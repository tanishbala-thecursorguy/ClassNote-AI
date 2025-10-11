import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovypzuizenaknyntsnvb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXB6dWl6ZW5ha255bnRzbnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjczODgsImV4cCI6MjA3NTYwMzM4OH0.i-m1zTfr01xjA93UgP6N7qdAXPSCicEr75TFGiNiWas'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Recording {
  id: string
  title: string
  course: string
  duration: string
  status: 'Recording' | 'Processing' | 'Ready' | 'Flagged'
  audio_url?: string
  created_at: string
  updated_at: string
}

export interface Transcript {
  id: string
  recording_id: string
  text: string
  paragraphs: string[]
  segments: Array<{
    start: number
    end: number
    text: string
  }>
  created_at: string
}

export interface AINotes {
  id: string
  recording_id: string
  summary: {
    keyTakeaways: string[]
    actionItems: string[]
    nextClassPrep: string[]
  }
  notes: Array<{
    heading: string
    bullets: string[]
  }>
  tables: Array<{
    title: string
    columns: string[]
    rows: string[][]
  }>
  created_at: string
}

export interface AIEnhancement {
  id: string
  recording_id: string
  type: 'enhance' | 'summarize' | 'key-points' | 'study-guide' | 'quiz'
  input_text?: string
  output_text: string
  created_at: string
}
