"""
ClassNote AI - AI Features Only (No Whisper)
This version works immediately while you set up Python 3.11 for Whisper
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
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

# OpenRouter configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Keep chat key (original)
CHAT_OPENROUTER_API_KEY = os.getenv("CHAT_OPENROUTER_API_KEY", "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")
# NEW: Primary key for all app features (notes, summary, quiz)
PRIMARY_OPENROUTER_API_KEY = "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"
# Backup key if primary fails
BACKUP_OPENROUTER_API_KEY = os.getenv("APP_OPENROUTER_API_KEY", "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")

# Pydantic models
class EnhanceRequest(BaseModel):
    text: str

class SummarizeRequest(BaseModel):
    text: str
    paragraphs: list[str]

class StudyGuideRequest(BaseModel):
    text: str
    title: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list[dict]] = None

class NotesRequest(BaseModel):
    transcript: str
    topic: Optional[str] = None

class QuizValidateRequest(BaseModel):
    question: str
    answer: str
    reference_text: str


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


def call_openrouter(messages: list[dict], system_prompt: str, api_key: str | None = None) -> str:
    """Call OpenRouter API for chat completions."""
    try:
        # Prepare messages with system prompt
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        payload = {
            "model": "anthropic/claude-3.5-sonnet",  # Using Claude for better educational responses
            "messages": full_messages,
            "temperature": 0.7,
            "max_tokens": 4000,  # Allow for detailed, long responses
        }
        
        headers = {
            "Authorization": f"Bearer {api_key or CHAT_OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:4000",
            "X-Title": "ClassNote AI"
        }
        
        response = requests.post(
            OPENROUTER_API_URL,
            json=payload,
            headers=headers,
            timeout=120
        )
        
        if response.status_code != 200:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Chat API error: {response.text}"
            )
        
        result = response.json()
        
        if "choices" not in result or len(result["choices"]) == 0:
            raise HTTPException(
                status_code=500,
                detail="No response from chat API"
            )
        
        return result["choices"][0]["message"]["content"].strip()
        
    except requests.exceptions.Timeout:
        logger.error("OpenRouter request timed out")
        raise HTTPException(status_code=504, detail="Chat request timed out")
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to OpenRouter")
        raise HTTPException(status_code=503, detail="Chat service unavailable")
    except Exception as e:
        logger.error(f"OpenRouter error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint for educational assistance.
    Focuses on university studies, provides detailed answers with sources.
    """
    system_prompt = """You are a friendly, approachable academic tutor and friend. You help university students with their studies while being warm, conversational, and supportive.

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
- Use markdown: `##` for main headings, `###` for sub-headings
- **Bold** key terms, definitions, and important concepts
- Use bullet points (`• `) extensively for lists
- Use horizontal separators (`---`) between major sections
- Number main topics (1., 2., 3., etc.)
- Keep definitions clear and concise
- Make examples practical and relatable

TABLES:
- Use markdown tables for comparisons, data summaries, or structured information
- Format: | Header 1 | Header 2 | Header 3 |
          |----------|----------|----------|
          | Data 1   | Data 2   | Data 3   |

CHARTS & GRAPHS:
- For questions involving data, statistics, comparisons, trends, or quantitative information, GENERATE CHARTS
- Include charts as JSON in this format:
  ```json
  {
    "type": "bar" | "line" | "pie",
    "title": "Chart Title",
    "data": [
      {"name": "Label 1", "value": 100},
      {"name": "Label 2", "value": 200}
    ],
    "xKey": "name",
    "yKey": "value"
  }
  ```
- Use bar charts for comparisons
- Use line charts for trends over time
- Use pie charts for proportions/percentages
- Always include relevant charts when discussing:
  - Economic data (GDP, inflation, unemployment)
  - Statistical comparisons
  - Historical trends
  - Survey results
  - Performance metrics
  - Scientific data with numbers

TASK HANDLING:
- If a student mentions tasks/assignments, acknowledge warmly
- Offer: "I'll remember that! I can send you a notification reminder instead of an alarm - would that help?"
- Be proactive about reminders

RESPONSE LENGTH:
- Academic topics: 400-800 words (comprehensive)
- Casual questions: 50-150 words (friendly and brief)
- Greetings: Keep it warm and conversational

REMEMBER: Structure is KEY - follow the format above exactly. Make it look like well-organized class notes that are easy to read and understand!"""

    # Prepare conversation history
    messages = []
    if request.conversation_history:
        messages = request.conversation_history
    else:
        messages = []
    
    # Add current user message
    messages.append({"role": "user", "content": request.message})
    
    try:
        response_text = call_openrouter(messages, system_prompt)
        
        return JSONResponse({
            "message": response_text,
            "sources_included": "sources" in response_text.lower() or "reference" in response_text.lower()
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")


@app.post("/notes")
async def generate_notes(request: NotesRequest):
    """
    Generate comprehensive notes, summary bullets, and embedded chart/table instructions
    from a long transcript. Output uses the strict structure requested by the frontend.
    """
    system_prompt = """You are an expert academic note generator. Given a lecture transcript, you MUST return a single, valid JSON object with these exact keys:
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
```json
{
  "type": "bar|line|pie",
  "title": "Chart Title",
  "data": [{"name": "Label", "value": 100}],
  "xKey": "name",
  "yKey": "value"
}
```

## 8. WEB LINKS
- List 5-10 high-quality academic URLs

Return ONLY this JSON object, fully filled out."""

    topic_hint = request.topic or "Lecture"
    user_prompt = f"""Topic: {topic_hint}

Transcript:
{request.transcript}

Return a JSON object with keys: notes_markdown, summary_bullets (array of strings), charts_embedded (boolean), web_links (array of url strings), quiz (array of objects with fields: question, options (A-D), answer, explanation).
Ensure notes_markdown includes tables and chart JSON blocks when relevant.
"""

    # Try primary key first, fallback to backup if it fails
    response_text = None
    try:
        logger.info("Attempting notes generation with PRIMARY key...")
        response_text = call_openrouter([
            {"role": "user", "content": user_prompt}
        ], system_prompt, api_key=PRIMARY_OPENROUTER_API_KEY)
        logger.info("PRIMARY key succeeded for notes generation")
    except Exception as e1:
        logger.error(f"Primary OpenRouter key failed: {e1}. Trying backup key...")
        try:
            response_text = call_openrouter([
                {"role": "user", "content": user_prompt}
            ], system_prompt, api_key=BACKUP_OPENROUTER_API_KEY)
            logger.info("BACKUP key succeeded for notes generation")
        except Exception as e2:
            logger.error(f"Backup OpenRouter key also failed: {e2}")
            raise HTTPException(status_code=500, detail=f"Both API keys failed. Primary: {str(e1)}, Backup: {str(e2)}")

    # Parse JSON response
    try:
        payload = json.loads(response_text)
        logger.info(f"Notes generated successfully. Quiz count: {len(payload.get('quiz', []))}")
    except Exception as parse_err:
        logger.warning(f"Failed to parse as JSON: {parse_err}. Using fallback structure.")
        payload = {"notes_markdown": response_text, "summary_bullets": [], "charts_embedded": False, "web_links": [], "quiz": []}

    return JSONResponse(payload)


@app.post("/quiz/validate")
async def quiz_validate(request: QuizValidateRequest):
    """Validate a user's answer against the reference text."""
    system_prompt = "You are a precise quiz validator. Respond only with 'correct' or 'incorrect' and one concise sentence explanation."
    prompt = f"""Question: {request.question}
User Answer: {request.answer}
Reference Text:
{request.reference_text}
"""
    try:
        verdict = call_openrouter([{"role": "user", "content": prompt}], system_prompt, api_key=PRIMARY_OPENROUTER_API_KEY)
    except Exception:
        verdict = call_openrouter([{"role": "user", "content": prompt}], system_prompt, api_key=BACKUP_OPENROUTER_API_KEY)
    return JSONResponse({"verdict": verdict.strip()})


if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting ClassNote AI - AI Features Server on port 8001")
    logger.info(f"📍 Ollama URL: {OLLAMA_GENERATE_URL}")
    logger.info(f"🤖 Model: {DEFAULT_LLM_MODEL}")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

