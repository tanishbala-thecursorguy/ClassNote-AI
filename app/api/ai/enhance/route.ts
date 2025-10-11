import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, recording_id, type } = body;

    if (!text || !recording_id || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: text, recording_id, type' 
      }, { status: 400 });
    }

    // Generate enhancement prompt based on type
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'enhance':
        systemPrompt = 'You are a text editor. Fix grammar, punctuation, and capitalization. Return only the corrected text.';
        userPrompt = `Fix this text: "${text}"`;
        break;
      case 'summarize':
        systemPrompt = 'You are a summarizer. Create a concise summary of the lecture content.';
        userPrompt = `Summarize this lecture transcript: "${text}"`;
        break;
      case 'key-points':
        systemPrompt = 'You are a note-taker. Extract the key points from this lecture. Return as a bulleted list.';
        userPrompt = `Extract key points from: "${text}"`;
        break;
      case 'study-guide':
        systemPrompt = 'You are a study guide creator. Create a structured study guide from this lecture content.';
        userPrompt = `Create a study guide from: "${text}"`;
        break;
      case 'quiz':
        systemPrompt = 'You are a quiz creator. Generate 5 multiple choice questions based on this lecture content.';
        userPrompt = `Create quiz questions from: "${text}"`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid enhancement type' }, { status: 400 });
    }

    // Call Ollama
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: { temperature: 0.3 }
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI enhancement failed' }, { status: 500 });
    }

    const result = await response.json();
    const enhancedText = result?.message?.content || '';

    // Save to Supabase
    const { data: enhancement, error } = await supabase
      .from('ai_enhancements')
      .insert({
        recording_id,
        type,
        input_text: text,
        output_text: enhancedText
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving enhancement:', error);
    }

    return NextResponse.json({
      enhancement: enhancement || null,
      output_text: enhancedText
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
