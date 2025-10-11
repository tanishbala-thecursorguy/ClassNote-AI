import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recordings:', error);
      return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 });
    }

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, course, duration } = body;

    const { data: recording, error } = await supabase
      .from('recordings')
      .insert({
        title: title || 'New Recording',
        course: course || 'CS101 – Intro to Algorithms',
        duration: duration || '00:00',
        status: 'Recording'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recording:', error);
      return NextResponse.json({ error: 'Failed to create recording' }, { status: 500 });
    }

    return NextResponse.json({ recording });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
