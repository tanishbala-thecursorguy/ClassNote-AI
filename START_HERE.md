# 🚀 Quick Start - ClassNote AI with Ollama

## Current Status

✅ **Completed:**
- Backend structure with Ollama AI integration
- 5 new AI-powered endpoints (enhance, summarize, key-points, study-guide, quiz)
- Frontend API service layer ready
- Fixed pkg-config dependency
- Removed pydub dependency (using ffmpeg directly)
- Port configuration set to 8001

⚠️ **Issue Found:**
The `av` package (PyAV) required by faster-whisper has compatibility issues with:
- Python 3.13 + FFmpeg 8.0

## 🎯 Solution: Use Python 3.11

### Option 1: Use pyenv (Recommended)

```bash
# Install pyenv if not already installed
brew install pyenv

# Install Python 3.11
pyenv install 3.11.10

# Navigate to project
cd "/Users/tanish/Downloads/ClassNote AI Monochrome Design/backend"

# Set Python 3.11 for this directory
pyenv local 3.11.10

# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# Start backend
python main.py
```

### Option 2: Download Python 3.11 directly

1. Download Python 3.11 from https://www.python.org/downloads/release/python-31110/
2. Install it
3. Create venv with Python 3.11:
   ```bash
   cd backend
   /Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

### Option 3: Wait for PyAV Update

The av==13.x versions should support FFmpeg 8.0, but aren't released for Python 3.13 yet.

## 📋 Once Dependencies Install

### Start Backend:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Start Frontend (new terminal):
```bash
npm run dev
```

### Test Ollama Features:
```bash
# Pull model (if not done)
ollama pull llama3.1

# Test health
curl http://localhost:8001/health

# Test AI enhancement
curl -X POST http://localhost:8001/enhance \
  -H "Content-Type: application/json" \
  -d '{"text": "so um today were gonna talk about algorithms"}'
```

## 🎉 What You'll Have

Once running:
- ✅ **Backend API** on http://localhost:8001
- ✅ **Frontend** on http://localhost:3000
- ✅ **5 AI Features** powered by Ollama:
  - Text enhancement (fix grammar/punctuation)
  - Lecture summarization  
  - Key point extraction
  - Study guide generation
  - Quiz creation
- ✅ **API Docs** at http://localhost:8001/docs

## 📚 Documentation

- **AI Features Guide:** `AI_FEATURES.md`
- **What's New:** `WHATS_NEW.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`

## 🔥 Quick Alternative - Test AI Features Now

While fixing dependencies, you can test just the Ollama features:

```bash
# Install only what's needed for AI
cd backend
source venv/bin/activate
pip install fastapi uvicorn ollama python-multipart starlette==0.38.5

# Create a simple test server (no Whisper)
python -c "
from fastapi import FastAPI
import ollama

app = FastAPI()

@app.get('/health')
def health():
    models = [m['name'] for m in ollama.list().get('models', [])]
    return {'ollama': {'models': models}}

@app.post('/enhance')
def enhance(data: dict):
    result = ollama.chat(model='llama3.1', messages=[{'role': 'user', 'content': f'Enhance: {data[\"text\"]}'}])
    return {'enhanced': result['message']['content']}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)
"
```

---

**Need Help?** Check the detailed guides or let me know!

