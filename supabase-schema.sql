-- ClassNote AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  course TEXT NOT NULL DEFAULT 'CS101 – Intro to Algorithms',
  duration TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Recording' CHECK (status IN ('Recording', 'Processing', 'Ready', 'Flagged')),
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  paragraphs TEXT[] NOT NULL DEFAULT '{}',
  segments JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Notes table
CREATE TABLE IF NOT EXISTS ai_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  summary JSONB NOT NULL DEFAULT '{}',
  notes JSONB NOT NULL DEFAULT '[]',
  tables JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Enhancements table (for individual AI operations)
CREATE TABLE IF NOT EXISTS ai_enhancements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enhance', 'summarize', 'key-points', 'study-guide', 'quiz')),
  input_text TEXT,
  output_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_recording_id ON transcripts(recording_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_recording_id ON ai_notes(recording_id);
CREATE INDEX IF NOT EXISTS idx_ai_enhancements_recording_id ON ai_enhancements(recording_id);
CREATE INDEX IF NOT EXISTS idx_ai_enhancements_type ON ai_enhancements(type);

-- Row Level Security (RLS) policies
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_enhancements ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later with authentication)
CREATE POLICY "Allow all operations on recordings" ON recordings FOR ALL USING (true);
CREATE POLICY "Allow all operations on transcripts" ON transcripts FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_notes" ON ai_notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_enhancements" ON ai_enhancements FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_recordings_updated_at 
    BEFORE UPDATE ON recordings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO recordings (title, course, duration, status) VALUES
('Greedy vs Dynamic Programming', 'CS101 – Intro to Algorithms', '52:18', 'Ready'),
('Graph Theory Fundamentals', 'CS101 – Intro to Algorithms', '48:35', 'Ready'),
('Sorting Algorithms Deep Dive', 'CS101 – Intro to Algorithms', '56:12', 'Processing')
ON CONFLICT DO NOTHING;
