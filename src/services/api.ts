/**
 * API Service Layer
 * Handles all backend communication for ClassNote AI
 */

import { createClient } from '@supabase/supabase-js';

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8001";
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://ovypzuizenaknyntsnvb.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eXB6dWl6ZW5ha255bnRzbnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjczODgsImV4cCI6MjA3NTYwMzM4OH0.i-m1zTfr01xjA93UgP6N7qdAXPSCicEr75TFGiNiWas";

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionMetadata {
  language: string;
  language_probability: number;
  duration: number;
}

export interface TranscriptionResponse {
  text: string;
  paragraphs: string[];
  segments: TranscriptionSegment[];
  metadata: TranscriptionMetadata;
}

export interface EnhancedTextResponse {
  original: string;
  enhanced: string;
}

export interface SummaryResponse {
  summary: string;
  word_count: number;
  paragraph_count: number;
}

export interface KeyPointsResponse {
  key_points: string[];
  count: number;
}

export interface StudyGuideResponse {
  study_guide: string;
  title: string;
}

export interface QuizResponse {
  quiz: string;
  title: string;
}

export interface NotesPayload {
  notes_markdown: string;
  summary_bullets: string[];
  charts_embedded?: boolean;
  web_links?: string[];
  quiz?: Array<{
    question: string;
    options?: Record<string, string>;
    answer?: string;
    explanation?: string;
  }>;
}

export interface HealthResponse {
  status: string;
  whisper: {
    model: string;
    compute_type: string;
  };
  ollama: {
    status: string;
    models: string[];
  };
}

export interface ApiError {
  error: string;
  detail?: string;
}

/**
 * Check if the API is healthy and reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}

/**
 * Transcribe audio file using the backend API
 * @param audioFile - Audio file to transcribe (Blob or File)
 * @param onProgress - Optional callback for upload progress
 * @returns Transcription result with text, paragraphs, and segments
 */
export async function transcribeAudio(
  audioFile: Blob | File,
  onProgress?: (progress: number) => void
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  
  // Ensure file has proper name and extension
  const fileName = audioFile instanceof File 
    ? audioFile.name 
    : "recording.webm";
  
  formData.append("file", audioFile, fileName);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response: TranscriptionResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse transcription response"));
        }
      } else {
        try {
          const errorResponse: ApiError = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.detail || errorResponse.error));
        } catch {
          reject(new Error(`Transcription failed with status ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during transcription"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Transcription aborted"));
    });

    // Send request
    xhr.open("POST", `${API_URL}/transcribe`);
    xhr.send(formData);
  });
}

/**
 * Alternative fetch-based transcription (simpler but no progress tracking)
 */
export async function transcribeAudioSimple(
  audioFile: Blob | File
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  
  const fileName = audioFile instanceof File 
    ? audioFile.name 
    : "recording.webm";
  
  formData.append("file", audioFile, fileName);

  const response = await fetch(`${API_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Transcription failed");
  }

  return response.json();
}

/**
 * Generate comprehensive notes + summary + quiz from transcript (app-level API key)
 */
export async function generateNotesFromTranscript(transcript: string, topic?: string): Promise<NotesPayload> {
  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, topic }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Notes generation failed");
  }

  return response.json();
}

/**
 * Format timestamp for display (seconds to MM:SS)
 */
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get detailed health status including Ollama availability
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

/**
 * Enhance transcription text using AI
 * Fixes grammar, punctuation, and improves readability
 */
export async function enhanceTranscription(text: string): Promise<EnhancedTextResponse> {
  const response = await fetch(`${API_URL}/enhance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Enhancement failed");
  }

  return response.json();
}

/**
 * Generate a summary of the lecture
 */
export async function summarizeLecture(
  text: string,
  paragraphs: string[]
): Promise<SummaryResponse> {
  const response = await fetch(`${API_URL}/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, paragraphs }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Summarization failed");
  }

  return response.json();
}

/**
 * Extract key points from the lecture
 */
export async function extractKeyPoints(text: string): Promise<KeyPointsResponse> {
  const response = await fetch(`${API_URL}/key-points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Key point extraction failed");
  }

  return response.json();
}

/**
 * Generate a study guide from the lecture
 */
export async function generateStudyGuide(
  text: string,
  title: string
): Promise<StudyGuideResponse> {
  const response = await fetch(`${API_URL}/study-guide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, title }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Study guide generation failed");
  }

  return response.json();
}

/**
 * Generate a quiz from the lecture
 */
export async function generateQuiz(
  text: string,
  title: string
): Promise<QuizResponse> {
  const response = await fetch(`${API_URL}/quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, title }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Quiz generation failed");
  }

  return response.json();
}

/**
 * Chat with the academic AI assistant
 */
export interface ChatResponse {
  message: string;
  sources_included: boolean;
}

export async function chatWithAI(
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory || [],
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || error.error || "Chat request failed");
  }

  return response.json();
}

