# ClassNote AI - AI-Enhanced Features 🤖

ClassNote AI now includes powerful AI features powered by Ollama and local LLM models. All processing happens locally on your machine - your data never leaves!

## 🚀 Available Features

### 1. **Transcription Enhancement**
Automatically improve transcription quality by fixing grammar, punctuation, and clarity.

**Endpoint:** `POST /enhance`

**Example:**
```bash
curl -X POST http://localhost:8001/enhance \
  -H "Content-Type: application/json" \
  -d '{"text": "so um today were gonna talk about like algorithms and stuff"}'
```

**Response:**
```json
{
  "original": "so um today were gonna talk about like algorithms and stuff",
  "enhanced": "Today we're going to discuss algorithms and their applications."
}
```

### 2. **Lecture Summarization**
Generate comprehensive summaries that capture main ideas and key points.

**Endpoint:** `POST /summarize`

**Example:**
```bash
curl -X POST http://localhost:8001/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Full lecture transcription...",
    "paragraphs": ["Para 1", "Para 2"]
  }'
```

**Response:**
```json
{
  "summary": "**Main Topic**: Algorithms and Data Structures\n\n**Key Concepts**:\n- Algorithm complexity...",
  "word_count": 1234,
  "paragraph_count": 5
}
```

### 3. **Key Point Extraction**
Extract the most important concepts and facts from lectures.

**Endpoint:** `POST /key-points`

**Example:**
```bash
curl -X POST http://localhost:8001/key-points \
  -H "Content-Type: application/json" \
  -d '{"text": "Lecture content..."}'
```

**Response:**
```json
{
  "key_points": [
    "1. Greedy algorithms make locally optimal choices",
    "2. Dynamic programming solves overlapping subproblems",
    "3. Time complexity is O(n²) for this approach"
  ],
  "count": 3
}
```

### 4. **Study Guide Generation**
Create comprehensive study materials including overview, concepts, terms, and practice questions.

**Endpoint:** `POST /study-guide`

**Example:**
```bash
curl -X POST http://localhost:8001/study-guide \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Lecture content...",
    "title": "Greedy vs Dynamic Programming"
  }'
```

**Response:**
```json
{
  "study_guide": "# Study Guide: Greedy vs Dynamic Programming\n\n## Overview\n...",
  "title": "Greedy vs Dynamic Programming"
}
```

### 5. **Quiz Generation**
Generate multiple-choice quizzes with explanations to test understanding.

**Endpoint:** `POST /quiz`

**Example:**
```bash
curl -X POST http://localhost:8001/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Lecture content...",
    "title": "Algorithms Fundamentals"
  }'
```

**Response:**
```json
{
  "quiz": "Q1: What is the time complexity of...\nA) O(n)\nB) O(n²)...",
  "title": "Algorithms Fundamentals"
}
```

## 🛠️ Setup

### Prerequisites

1. **Ollama** - Local LLM runtime
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Windows
   # Download from https://ollama.com/download
   ```

2. **LLM Model** - Pull a supported model
   ```bash
   # Recommended (8B parameters, good balance)
   ollama pull llama3.1:8b-instruct
   
   # Alternative (smaller, faster)
   ollama pull mistral:7b
   
   # Alternative (larger, better quality)
   ollama pull llama3.1:70b-instruct
   ```

3. **Python Package**
   ```bash
   cd backend
   source venv/bin/activate
   pip install ollama==0.4.7
   ```

### Configuration

The backend automatically detects available Ollama models. Default model: `llama3.1:8b-instruct`

To change the model, edit `backend/main.py`:
```python
DEFAULT_LLM_MODEL = "mistral:7b"  # or any installed model
```

### Verify Installation

```bash
# Check Ollama is running
ollama list

# Check backend recognizes Ollama
curl http://localhost:8001/health
```

Expected health response:
```json
{
  "status": "healthy",
  "whisper": {
    "model": "small",
    "compute_type": "int8"
  },
  "ollama": {
    "status": "available",
    "models": ["llama3.1:8b-instruct"]
  }
}
```

## 📊 Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `mistral:7b` | 4.1GB | Fast | Good | Quick processing, real-time |
| `llama3.1:8b-instruct` | 4.7GB | Medium | Better | Balanced (recommended) |
| `llama3.1:70b-instruct` | 40GB | Slow | Best | Maximum quality |
| `deepseek-v3.1` | Various | Varies | Excellent | Alternative option |

## 🎯 Usage Examples

### From Python

```python
import requests

# Enhance transcription
response = requests.post(
    "http://localhost:8001/enhance",
    json={"text": "your transcription text here"}
)
enhanced = response.json()["enhanced"]

# Generate summary
response = requests.post(
    "http://localhost:8001/summarize",
    json={
        "text": "full lecture text",
        "paragraphs": ["para1", "para2"]
    }
)
summary = response.json()["summary"]
```

### From TypeScript/JavaScript

```typescript
import {
  enhanceTranscription,
  summarizeLecture,
  extractKeyPoints,
  generateStudyGuide,
  generateQuiz
} from './services/api';

// Enhance transcription
const enhanced = await enhanceTranscription(transcriptionText);

// Get summary
const summary = await summarizeLecture(text, paragraphs);

// Extract key points
const keyPoints = await extractKeyPoints(text);

// Generate study guide
const studyGuide = await generateStudyGuide(text, "Lecture Title");

// Generate quiz
const quiz = await generateQuiz(text, "Lecture Title");
```

## ⚙️ Advanced Configuration

### Temperature Control

Adjust creativity vs consistency in `backend/main.py`:

```python
response = ollama.chat(
    model=model,
    messages=messages,
    options={
        "temperature": 0.7,  # 0.0 = deterministic, 1.0 = creative
        "top_p": 0.9,
        "top_k": 40
    }
)
```

### Custom Prompts

Modify system prompts in each endpoint function:

```python
system_prompt = """Your custom instructions here.
Be specific about tone, format, and requirements."""
```

### Rate Limiting

For production, add rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/enhance")
@limiter.limit("10/minute")
async def enhance_transcription(request: EnhanceRequest):
    # ... endpoint logic
```

## 🐛 Troubleshooting

### "Ollama not available" Error

**Cause:** Ollama service not running or Python package not installed

**Solution:**
```bash
# Check Ollama is running
ollama list

# Restart Ollama service (macOS/Linux)
pkill ollama
ollama serve &

# Install Python package
pip install ollama==0.4.7
```

### "Model not available" Error

**Cause:** Requested model not pulled

**Solution:**
```bash
ollama pull llama3.1:8b-instruct
```

### Slow Response Times

**Causes:**
- Large model on CPU
- Long input text
- No GPU acceleration

**Solutions:**
1. **Use smaller model:**
   ```bash
   ollama pull mistral:7b
   ```

2. **Enable GPU (if available):**
   ```bash
   # Ollama automatically uses GPU if available
   # Verify with:
   ollama ps
   ```

3. **Chunk large texts:**
   ```python
   # Split text into smaller chunks
   chunks = [text[i:i+2000] for i in range(0, len(text), 2000)]
   ```

### High Memory Usage

**Causes:**
- Large model loaded in RAM
- Multiple concurrent requests

**Solutions:**
1. **Use quantized models:**
   ```bash
   ollama pull llama3.1:8b-instruct-q4  # 4-bit quantized
   ```

2. **Limit concurrent requests:**
   ```python
   from fastapi import BackgroundTasks
   from asyncio import Semaphore
   
   sem = Semaphore(2)  # Max 2 concurrent LLM calls
   ```

## 📈 Performance Tips

1. **Batch Processing**
   - Process multiple lectures together
   - Reuse model for multiple requests

2. **Caching**
   - Cache summaries for frequently accessed lectures
   - Use Redis for distributed caching

3. **Streaming Responses**
   ```python
   @app.post("/summarize-stream")
   async def summarize_stream(request: SummarizeRequest):
       async def generate():
           stream = ollama.chat(
               model=DEFAULT_LLM_MODEL,
               messages=[...],
               stream=True
           )
           for chunk in stream:
               yield chunk['message']['content']
       
       return StreamingResponse(generate())
   ```

## 🔒 Security Considerations

1. **Input Validation**
   - Limit text length
   - Sanitize user inputs
   - Validate request formats

2. **Resource Limits**
   - Set max tokens per request
   - Implement timeout limits
   - Add rate limiting

3. **Privacy**
   - All processing is local
   - No data sent to external APIs
   - Transcriptions stay on your machine

## 🚀 Future Enhancements

Planned features:
- [ ] Real-time streaming enhancements
- [ ] Multi-language support
- [ ] Custom fine-tuned models for education
- [ ] Collaborative study guides
- [ ] Flashcard generation
- [ ] Concept mapping
- [ ] Citation extraction
- [ ] Bibliography generation

## 📚 Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Llama 3.1 Model Card](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Mistral Documentation](https://docs.mistral.ai/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Contributing

Want to add new AI features? Follow these steps:

1. **Add endpoint** to `backend/main.py`
2. **Add TypeScript function** to `src/services/api.ts`
3. **Update tests** and documentation
4. **Submit pull request**

Example new endpoint:
```python
@app.post("/analyze-sentiment")
async def analyze_sentiment(request: EnhanceRequest):
    if not check_ollama_model():
        raise HTTPException(503, detail="Model not available")
    
    prompt = f"Analyze the sentiment of this lecture: {request.text}"
    result = call_ollama(prompt)
    
    return JSONResponse({"sentiment": result})
```

---

**Questions?** Check the main [README.md](README.md) or open an issue!

