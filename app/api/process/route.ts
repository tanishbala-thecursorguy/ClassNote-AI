import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TRANSCRIBE_URL = process.env.TRANSCRIBE_URL || 'http://localhost:8001/transcribe';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';

const NOTES_SYSTEM = `You are ClassNote AI. Return STRICT JSON only, no prose. Schema:
{
 "summary": { "keyTakeaways": [], "actionItems": [], "nextClassPrep": [] },
 "notes": [{ "heading": "", "bullets": [] }],
 "tables": [{ "title": "", "columns": [], "rows": [[]] }]
}
Rules:
- Fix punctuation, capitalization, grammar across all outputs.
- Use concise academic style.
- Keep tables clean (2–6 columns).
- If info missing, keep arrays minimal; never invent facts.`;

function notesUserPrompt(transcript: string) {
  return `Transcript:\n"""${transcript.slice(0, 200000)}"""\n
Return JSON only. Populate keyTakeaways (5–10), actionItems (prep/homework), nextClassPrep.
Create "notes" as headings with bullets. Add 1–2 tables if applicable (Concept/Definition/Example; Date/Topic/Reading/Due?).`;
}

export async function POST(req: NextRequest) {
  try {
    // Expect raw audio bytes (application/octet-stream)
    if (!req.headers.get('content-type')?.includes('application/octet-stream')) {
      return NextResponse.json({ error: 'Send audio as application/octet-stream' }, { status: 400 });
    }

    // Create recording entry in Supabase first
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .insert({
        title: 'New Recording',
        duration: '00:00',
        status: 'Processing'
      })
      .select()
      .single();

    if (recordingError) {
      console.error('Failed to create recording:', recordingError);
      return NextResponse.json({ error: 'Failed to create recording' }, { status: 500 });
    }

    // 1) send audio to transcriber
    const audio = Buffer.from(await req.arrayBuffer());
    const form = new FormData();
    form.append('file', new Blob([audio], { type: 'audio/webm' }), 'lecture.webm');

    const tRes = await fetch(TRANSCRIBE_URL, { method: 'POST', body: form });
    if (!tRes.ok) {
      // Update recording status to failed
      await supabase
        .from('recordings')
        .update({ status: 'Flagged' })
        .eq('id', recording.id);
      
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }
    const tJson = await tRes.json() as { text: string; paragraphs: string[]; segments: any[] };

  // 2) call Ollama for summaries/notes
  const oRes = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b-instruct',
      messages: [
        { role: 'system', content: NOTES_SYSTEM },
        { role: 'user', content: notesUserPrompt(tJson.text) }
      ],
      stream: false,
      options: { temperature: 0.2 }
    })
  });

  if (!oRes.ok) {
    return NextResponse.json({ error: 'Notes generation failed' }, { status: 500 });
  }

  const oJson = await oRes.json();
  // Ollama returns {message:{content:string}}
  const raw = oJson?.message?.content ?? '';
  let notes;
  try {
    notes = JSON.parse(raw);
  } catch {
    // Retry with a stricter "JSON only" reminder
    const oRes2 = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b-instruct',
        messages: [
          { role: 'system', content: NOTES_SYSTEM },
          { role: 'user', content: notesUserPrompt(tJson.text) + '\nReturn ONLY valid JSON. No explanations.' }
        ],
        stream: false,
        options: { temperature: 0 }
      })
    });
    const oJson2 = await oRes2.json();
    notes = JSON.parse(oJson2?.message?.content ?? '{}');
  }

    // 3) lightly reflow transcript into prettier paragraphs (already done server-side)
    const cleanParagraphs = tJson.paragraphs.map(p =>
      p.replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').trim()
    ).filter(Boolean);

    // Save transcript to Supabase
    const { error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        recording_id: recording.id,
        text: tJson.text.trim(),
        paragraphs: cleanParagraphs,
        segments: tJson.segments
      });

    if (transcriptError) {
      console.error('Failed to save transcript:', transcriptError);
    }

    // Save AI notes to Supabase
    const { error: notesError } = await supabase
      .from('ai_notes')
      .insert({
        recording_id: recording.id,
        summary: notes.summary,
        notes: notes.notes,
        tables: notes.tables
      });

    if (notesError) {
      console.error('Failed to save AI notes:', notesError);
    }

    // Update recording status to Ready
    await supabase
      .from('recordings')
      .update({ 
        status: 'Ready',
        title: `Lecture ${new Date().toLocaleDateString()}`
      })
      .eq('id', recording.id);

    return NextResponse.json({
      recording_id: recording.id,
      transcript: {
        text: tJson.text.trim(),
        paragraphs: cleanParagraphs,
        segments: tJson.segments
      },
      notes
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
