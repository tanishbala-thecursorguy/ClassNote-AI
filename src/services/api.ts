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
 * Now calls OpenRouter directly from frontend for Vercel deployment
 */
export async function generateNotesFromTranscript(transcript: string, topic?: string): Promise<NotesPayload> {
  const PRIMARY_API_KEY = "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";
  const BACKUP_API_KEY = "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";
  const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

  const systemPrompt = `You are an expert academic note generator. Given a lecture transcript, you MUST return a single, valid JSON object with these exact keys:
{
  "notes_markdown": (string, strict markdown with ALL sections below),
  "summary_bullets": (array of 10-20 concise English summary points),
  "charts_embedded": (boolean, true if any chart JSON is present),
  "web_links": (array of at least 5 real .edu/.gov/journal URLs),
  "quiz": (array of EXACTLY 50 unique quiz objects, each with: question, options {A,B,C,D}, answer, explanation)
}

CRITICAL RULES:
- ALWAYS return exactly 50 quiz questions, never fewer
- If transcript lacks 50 distinct points, create additional relevant questions
- Return ONLY valid JSON, no prose, no extra text
- Never repeat quiz questions

notes_markdown structure (use markdown):
## 1. INTRODUCTION
- Clear overview of topic

## 2. EXPLANATION WITH SIDE HEADINGS
Break into numbered sections (e.g., "### 2.1 Topic Name"):
- **Definition:** Clear definition with key terms **bolded**
- **Explanation:** Detailed explanation
- Bullet points with examples
- **Example:** Real-world example

## 3. SHORT NOTES
- Concise bullet points of key facts

## 4. IMPORTANT TOPICS
- **Topic 1:** Brief explanation
- **Topic 2:** Brief explanation

## 5. REAL-LIFE EXAMPLE
- Comprehensive scenario with bullets

## 6. TABLES
Use markdown tables for comparisons (| Header 1 | Header 2 |)

## 7. CHARTS
Include at least one chart as JSON code block:
\`\`\`json
{
  "type": "bar|line|pie",
  "title": "Chart Title",
  "data": [{"name": "Label", "value": 100}],
  "xKey": "name",
  "yKey": "value"
}
\`\`\`

## 8. WEB LINKS
- List 5-10 high-quality academic URLs

Return ONLY this JSON object, fully filled out.`;

  const userPrompt = `Topic: ${topic || "Lecture"}

Transcript:
${transcript}

Return a JSON object with keys: notes_markdown, summary_bullets (array of strings), charts_embedded (boolean), web_links (array of url strings), quiz (array of objects with fields: question, options (A-D), answer, explanation).
Ensure notes_markdown includes tables and chart JSON blocks when relevant.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  // Try primary key first, fallback to backup
  let responseText = "";
  try {
    console.log("Attempting notes generation with PRIMARY key...");
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PRIMARY_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "ClassNote AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: messages,
        temperature: 0.7,
        max_tokens: 16000
      })
    });

    if (!response.ok) {
      throw new Error(`Primary API key failed: ${response.status}`);
    }

    const data = await response.json();
    responseText = data.choices?.[0]?.message?.content || "";
    console.log("PRIMARY key succeeded for notes generation");
  } catch (e1) {
    console.error("Primary key failed, trying backup:", e1);
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BACKUP_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "ClassNote AI"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: messages,
          temperature: 0.7,
          max_tokens: 16000
        })
      });

      if (!response.ok) {
        throw new Error(`Backup API key also failed: ${response.status}`);
      }

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || "";
      console.log("BACKUP key succeeded for notes generation");
    } catch (e2) {
      console.error("Both API keys failed:", e2);
      throw new Error("Both API keys failed for notes generation. Please try again.");
    }
  }

  // Parse JSON response
  try {
    const payload = JSON.parse(responseText);
    console.log(`Notes generated successfully. Quiz count: ${payload.quiz?.length || 0}`);
    
    // Validate required fields
    if (!payload.notes_markdown && !payload.summary_bullets) {
      console.error("API returned empty response");
      throw new Error("API returned empty content");
    }
    
    return payload;
  } catch (parseErr) {
    console.warn("Failed to parse as JSON, using fallback structure:", parseErr);
    console.log("Raw response (first 500 chars):", responseText.substring(0, 500));
    
    // If response looks like JSON error, throw it
    if (responseText.includes("error") || responseText.includes("Error")) {
      throw new Error(`API Error: ${responseText.substring(0, 200)}`);
    }
    
    return {
      notes_markdown: responseText,
      summary_bullets: [],
      charts_embedded: false,
      web_links: [],
      quiz: []
    };
  }
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
  // Call OpenRouter directly from frontend for Vercel deployment
  const CHAT_API_KEY = "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";
  const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  
  const systemPrompt = `You are a friendly, approachable academic tutor and friend. You help university students with their studies while being warm, conversational, and supportive.

PERSONALITY & TONE:
- Be friendly, warm, and conversational - like talking to a friend
- Respond to greetings naturally (hi, hello, how are you, etc.)
- Use a supportive, encouraging tone
- Be enthusiastic about learning
- Balance being helpful with being approachable
- Use casual but educated language (not overly formal)

CRITICAL: Your responses MUST follow this EXACT structured format (like ChatGPT academic notes):

**1. INTRODUCTION**
- Start with a clear, concise introduction to the topic
- Give an overview of what will be covered
- Keep it friendly and welcoming

**2. EXPLANATION with SIDE HEADINGS**
Break down the topic into numbered main sections (e.g., "1. Topic Name", "2. Next Topic"):

For EACH main section, include:
- **Definition:** (in bold) followed by the definition with key terms **bolded**
- **Explanation:** Detailed explanation after the definition
- Then list sub-points or types using bullet points:
  • **Bold Name/Type:** explanation
  • **Another Type:** explanation
- **Example:** (in bold) followed by a real-life example relevant to that specific topic

**3. SHORT NOTES**
- Include concise bullet points with key facts:
• Important point 1
• Important point 2
• Important point 3

**4. IMPORTANT TOPICS**
- Create a dedicated section listing crucial concepts:
• **Topic 1:** Brief explanation
• **Topic 2:** Brief explanation

**5. REAL-LIFE EXAMPLE (Dedicated Section)**
- Include a comprehensive real-world scenario:
- Start with "Let's say [scenario]:" or similar
- Use bullet points to explain actions:
  • **Actor/Entity** (in bold) does X, which leads to Y
- End with a summary sentence

**6. CONCLUSION**
- Wrap up with "In simple words," or similar
- Provide a core definition in bold (like a blockquote): **"Main concept explanation"**
- Add a concluding paragraph explaining significance and takeaways
- Include sources and recommended readings if it's an academic topic

FORMATTING RULES:
- Use markdown: \`##\` for main headings, \`###\` for sub-headings
- **Bold** key terms, definitions, and important concepts
- Use bullet points (\`• \`) extensively for lists
- Use horizontal separators (\`---\`) between major sections
- Number main topics (1., 2., 3., etc.)
- Keep definitions clear and concise
- Make examples practical and relatable

TABLES:
- Use markdown tables for comparisons, data summaries, or structured information
- Format: | Header 1 | Header 2 | Header 3 |
          |----------|----------|----------|
          | Data 1   | Data 2   | Data 3   |

TASK HANDLING:
- If a student mentions tasks/assignments, acknowledge warmly
- Offer: "I'll remember that! I can send you a notification reminder instead of an alarm - would that help?"
- Be proactive about reminders

RESPONSE LENGTH:
- Academic topics: 400-800 words (comprehensive)
- Casual questions: 50-150 words (friendly and brief)
- Greetings: Keep it warm and conversational

REMEMBER: Structure is KEY - follow the format above exactly. Make it look like well-organized class notes that are easy to read and understand!`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(conversationHistory || []),
    { role: "user", content: message }
  ];

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAT_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "ClassNote AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return {
      message: aiMessage,
      sources_included: aiMessage.toLowerCase().includes("source") || aiMessage.toLowerCase().includes("reference")
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw new Error("Failed to connect to AI assistant. Please try again.");
  }
}

