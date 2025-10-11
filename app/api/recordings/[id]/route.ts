import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get recording with transcript and AI notes
    const { data: recording, error: recordingError } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (recordingError) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('recording_id', id)
      .single();

    const { data: aiNotes, error: notesError } = await supabase
      .from('ai_notes')
      .select('*')
      .eq('recording_id', id)
      .single();

    const { data: enhancements, error: enhancementsError } = await supabase
      .from('ai_enhancements')
      .select('*')
      .eq('recording_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      recording,
      transcript: transcript || null,
      aiNotes: aiNotes || null,
      enhancements: enhancements || []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const { data: recording, error } = await supabase
      .from('recordings')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recording:', error);
      return NextResponse.json({ error: 'Failed to update recording' }, { status: 500 });
    }

    return NextResponse.json({ recording });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recording:', error);
      return NextResponse.json({ error: 'Failed to delete recording' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
