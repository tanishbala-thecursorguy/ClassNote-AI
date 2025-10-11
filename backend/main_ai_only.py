"""
ClassNote AI - AI Features Only (No Whisper)
This version works immediately while you set up Python 3.11 for Whisper
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import logging
import requests
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ClassNote AI - AI Features API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"
DEFAULT_LLM_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

# Pydantic models
class EnhanceRequest(BaseModel):
    text: str

class SummarizeRequest(BaseModel):
    text: str
    paragraphs: list[str]

class StudyGuideRequest(BaseModel):
    text: str
    title: str


def check_ollama_model(model_name: str = DEFAULT_LLM_MODEL) -> bool:
    """Check if specified Ollama model is available via API."""
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=2)
        if response.status_code == 200:
            models_data = response.json()
            available_models = [m['name'] for m in models_data.get('models', [])]
            return any(model_name in model or model in model_name for model in available_models)
        return False
    except Exception as e:
        logger.error(f"Ollama model check failed: {e}")
        return False


def call_ollama(prompt: str, model: str = DEFAULT_LLM_MODEL, system: Optional[str] = None) -> str:
    """Call Ollama API directly and return the response."""
    try:
        full_prompt = prompt
        if system:
            full_prompt = f"System: {system}\n\nUser: {prompt}"
        
        payload = {
            "model": model,
            "prompt": full_prompt,
            "stream": False,
            "options": {"temperature": 0.7}
        }
        
        response = requests.post(OLLAMA_GENERATE_URL, json=payload, timeout=120)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Ollama API error: {response.text}"
            )
        
        result = response.json()
        return result.get('response', '').strip()
        
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="LLM processing timed out")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama service unavailable")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")


@app.get("/")
async def root():
    return {"status": "healthy", "service": "ClassNote AI - AI Features API"}


@app.get("/health")
async def health_check():
    ollama_status = "unavailable"
    ollama_models = []
    
    try:
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
        "ollama": {
            "status": ollama_status,
            "models": ollama_models,
            "url": OLLAMA_GENERATE_URL
        }
    }


@app.post("/enhance")
async def enhance_transcription(request: EnhanceRequest):
    """Enhance transcription text using LLM."""
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available. Please run: ollama pull {DEFAULT_LLM_MODEL}"
        )
    
    system_prompt = """You are a professional transcription editor. 
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
    """Generate a comprehensive summary of the lecture."""
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available"
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
    """Extract key points and concepts from the lecture."""
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available"
        )
    
    system_prompt = """You are an educational content analyst.
Extract the most important points from lectures in a clear, organized manner."""
    
    prompt = f"""Extract the key points from this lecture. Format as a numbered list.
Focus on main concepts, important facts, and critical information students should remember.

Lecture:
{request.text}

Return only the key points list, no introduction."""
    
    key_points = call_ollama(prompt, system=system_prompt)
    
    points = [line.strip() for line in key_points.strip().split('\n') if line.strip()]
    
    return JSONResponse({
        "key_points": points,
        "count": len(points)
    })


@app.post("/study-guide")
async def generate_study_guide(request: StudyGuideRequest):
    """Generate a comprehensive study guide from the lecture."""
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available"
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
    """Generate quiz questions from the lecture content."""
    if not check_ollama_model():
        raise HTTPException(
            status_code=503,
            detail=f"Model {DEFAULT_LLM_MODEL} not available"
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
    logger.info("🚀 Starting ClassNote AI - AI Features Server on port 8001")
    logger.info(f"📍 Ollama URL: {OLLAMA_GENERATE_URL}")
    logger.info(f"🤖 Model: {DEFAULT_LLM_MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

