from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel
from pydantic import BaseModel
import tempfile
import os
import io
import re
import logging
import subprocess

import requests
import json
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ClassNote AI Transcription API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # Previous port
        "http://localhost:4000",  # New port
        "http://localhost:4173",  # Vite preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model on startup
logger.info("Loading Whisper model...")
model = WhisperModel("small", compute_type="int8")  # free, local
logger.info("Whisper model loaded successfully")

# Ollama configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
DEFAULT_LLM_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

# Pydantic models for AI requests
class EnhanceRequest(BaseModel):
    text: str
    
class SummarizeRequest(BaseModel):
    text: str
    paragraphs: list[str]
    
class StudyGuideRequest(BaseModel):
    text: str
    title: str


def webm_to_wav_bytes(raw: bytes) -> bytes:
    """
    Convert WebM audio to WAV format using ffmpeg directly.
    Requires ffmpeg to be installed on the system.
    """
    # Create temp files for input and output
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_in:
        temp_in.write(raw)
        temp_in_path = temp_in.name
    
    temp_out_path = temp_in_path.replace(".webm", ".wav")
    
    try:
        # Use ffmpeg to convert
        subprocess.run([
            "ffmpeg", "-i", temp_in_path,
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            temp_out_path,
            "-y",  # Overwrite output
            "-loglevel", "error"
        ], check=True, capture_output=True)
        
        # Read the converted file
        with open(temp_out_path, "rb") as f:
            wav_data = f.read()
        
        return wav_data
    finally:
        # Cleanup temp files
        if os.path.exists(temp_in_path):
            os.remove(temp_in_path)
        if os.path.exists(temp_out_path):
            os.remove(temp_out_path)


def paragraphize_text(text: str, sentences_per_paragraph: int = 4) -> list[str]:
    """
    Split transcribed text into paragraphs.
    Groups sentences together for better readability.
    """
    # Fix common spacing/punctuation issues
    text = re.sub(r"\s+([.,!?;:])", r"\1", text)
    
    # Split into sentences
    sentences = re.split(r"(?<=[.!?])\s+", text)
    
    paragraphs = []
    buffer = []
    
    for sentence in sentences:
        if sentence.strip():
            buffer.append(sentence.strip())
        
        if len(buffer) >= sentences_per_paragraph:
            paragraphs.append(" ".join(buffer))
            buffer = []
    
    # Add remaining sentences as final paragraph
    if buffer:
        paragraphs.append(" ".join(buffer))
    
    return paragraphs


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ClassNote AI Transcription API"}


@app.get("/health")
async def health_check():
    """Detailed health check with model status."""
    ollama_status = "unavailable"
    ollama_models = []
    
    try:
        # Check Ollama availability via API
        response = requests.get(OLLAMA_TAGS_URL, timeout=2)
        if response.status_code == 200:
            models_data = response.json()
            ollama_models = [m['name'] for m in models_data.get('models', [])]
            ollama_status = "available" if ollama_models else "no_models"
        else:
            ollama_status = "error"
    except Exception as e:
        logger.warning(f"Ollama check failed: {e}")
        ollama_status = "unavailable"
    
    return {
        "status": "healthy",
        "whisper": {
            "model": "small",
            "compute_type": "int8",
            "status": "requires_python_3.11"
        },
        "ollama": {
            "status": ollama_status,
            "models": ollama_models,
            "url": OLLAMA_URL
        }
    }


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe audio file to text with timestamps and paragraphs.
    
    Supports: WAV, WebM, MP3, and other audio formats.
    Returns: Full text, paragraphs, and timestamped segments.
    """
    try:
        logger.info(f"Processing file: {file.filename}")
        
        # Read uploaded file
        raw = await file.read()
        
        # Convert to WAV if needed
        if file.filename and file.filename.endswith(".webm"):
            logger.info("Converting WebM to WAV")
            raw = webm_to_wav_bytes(raw)
        
        # Create temporary file for processing
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name
        
        # Transcribe with Faster-Whisper
        logger.info("Starting transcription...")
        segments, info = model.transcribe(
            tmp_path, 
            vad_filter=True,  # Voice Activity Detection for better segmentation
            word_timestamps=False
        )
        
        # Clean up temp file
        os.remove(tmp_path)
        
        # Process segments
        seg_list = []
        full_text_parts = []
        
        for s in segments:
            seg_list.append({
                "start": float(s.start),
                "end": float(s.end),
                "text": s.text.strip()
            })
            full_text_parts.append(s.text.strip())
        
        # Join and format text
        full_text = " ".join(full_text_parts)
        
        # Create paragraphs
        paragraphs = paragraphize_text(full_text)
        
        logger.info(f"Transcription complete: {len(seg_list)} segments, {len(paragraphs)} paragraphs")
        
        return JSONResponse({
            "text": full_text.strip(),
            "paragraphs": paragraphs,
            "segments": seg_list,
            "metadata": {
                "language": info.language,
                "language_probability": float(info.language_probability),
                "duration": float(info.duration)
            }
        })
    
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Transcription failed",
                "detail": str(e)
            }
        )


def check_ollama_model(model_name: str = DEFAULT_LLM_MODEL) -> bool:
    """Check if specified Ollama model is available via API."""
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=2)
        if response.status_code == 200:
            models_data = response.json()
            available_models = [m['name'] for m in models_data.get('models', [])]
            # Check for exact match or partial match (e.g., llama3.1 matches llama3.1:latest)
            return any(model_name in model or model in model_name for model in available_models)
        return False
    except Exception as e:
        logger.error(f"Ollama model check failed: {e}")
        return False


def call_ollama(prompt: str, model: str = DEFAULT_LLM_MODEL, system: Optional[str] = None) -> str:
    """Call Ollama API directly and return the response."""
    try:
        # Build the prompt with system message if provided
        full_prompt = prompt
        if system:
            full_prompt = f"System: {system}\n\nUser: {prompt}"
        
        # Use the generate endpoint for simpler streaming
        payload = {
            "model": model,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "temperature": 0.7
            }
        }
        
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json=payload,
            timeout=120  # 2 minutes timeout for longer responses
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Ollama API error: {response.text}"
            )
        
        result = response.json()
        return result.get('response', '').strip()
        
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        raise HTTPException(status_code=504, detail="LLM processing timed out")
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to Ollama")
        raise HTTPException(status_code=503, detail="Ollama service unavailable")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")


@app.post("/enhance")
async def enhance_transcription(request: EnhanceRequest):
    """
    Enhance transcription text using LLM.
    Fixes grammar, punctuation, and improves readability.
    """
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are a professional transcription editor. 
Your task is to clean up and enhance lecture transcriptions while maintaining the original meaning and content.
Fix grammar, add proper punctuation, correct obvious errors, but don't add new information.
Keep the lecture's natural flow and conversational tone."""
    
    prompt = f"""Please enhance this lecture transcription by fixing grammar, punctuation, and clarity:

{request.text}

Return only the enhanced text, no explanations."""
    
    enhanced_text = call_ollama(prompt, system=system_prompt)
    
    return JSONResponse({
        "original": request.text,
        "enhanced": enhanced_text.strip()
    })


@app.post("/summarize")
async def summarize_lecture(request: SummarizeRequest):
    """
    Generate a comprehensive summary of the lecture.
    """
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are an expert at summarizing educational content.
Create clear, concise summaries that capture the main ideas and key points.
Use bullet points for clarity and organize by topic."""
    
    prompt = f"""Summarize this lecture transcription. Include:
1. Main topic and objectives
2. Key concepts covered
3. Important details and examples
4. Conclusions or takeaways

Transcription:
{request.text}

Format as a clear, structured summary."""
    
    summary = call_ollama(prompt, system=system_prompt)
    
    return JSONResponse({
        "summary": summary.strip(),
        "word_count": len(request.text.split()),
        "paragraph_count": len(request.paragraphs)
    })


@app.post("/key-points")
async def extract_key_points(request: EnhanceRequest):
    """
    Extract key points and concepts from the lecture.
    """
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are an educational content analyst.
Extract the most important points from lectures in a clear, organized manner."""
    
    prompt = f"""Extract the key points from this lecture. Format as a numbered list.
Focus on main concepts, important facts, and critical information students should remember.

Lecture:
{request.text}

Return only the key points list, no introduction."""
    
    key_points = call_ollama(prompt, system=system_prompt)
    
    # Parse the response into a list
    points = [line.strip() for line in key_points.strip().split('\n') if line.strip()]
    
    return JSONResponse({
        "key_points": points,
        "count": len(points)
    })


@app.post("/study-guide")
async def generate_study_guide(request: StudyGuideRequest):
    """
    Generate a comprehensive study guide from the lecture.
    """
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are an expert educator creating study materials.
Generate comprehensive study guides that help students learn and retain information."""
    
    prompt = f"""Create a study guide for this lecture titled "{request.title}".

Include:
1. **Overview**: Brief summary of the topic
2. **Key Concepts**: Main ideas with explanations
3. **Important Terms**: Definitions of key terms
4. **Practice Questions**: 5-7 questions to test understanding
5. **Study Tips**: How to best learn this material

Lecture Content:
{request.text}

Format as a well-structured study guide."""
    
    study_guide = call_ollama(prompt, system=system_prompt)
    
    return JSONResponse({
        "study_guide": study_guide.strip(),
        "title": request.title
    })


@app.post("/quiz")
async def generate_quiz(request: StudyGuideRequest):
    """
    Generate quiz questions from the lecture content.
    """
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are an expert at creating educational assessments.
Generate clear, fair quiz questions that test understanding of key concepts."""
    
    prompt = f"""Create a quiz with 10 multiple-choice questions based on this lecture: "{request.title}"

For each question:
- Write a clear question
- Provide 4 options (A, B, C, D)
- Mark the correct answer
- Add a brief explanation

Lecture:
{request.text}

Format as:
Q1: [question]
A) [option]
B) [option]
C) [option]
D) [option]
Correct: [letter]
Explanation: [brief explanation]"""
    
    quiz = call_ollama(prompt, system=system_prompt)
    
    return JSONResponse({
        "quiz": quiz.strip(),
        "title": request.title
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

