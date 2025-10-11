#!/usr/bin/env python3
"""
Quick test script to verify Ollama integration works
Run this while the dependency issue is being resolved
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ClassNote AI - Ollama Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️  Ollama package not installed")

class TextRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {"status": "ok", "message": "Ollama test server"}

@app.get("/health")
def health():
    if not OLLAMA_AVAILABLE:
        return {"ollama": "not_installed"}
    
    try:
        models = ollama.list()
        model_names = [m['name'] for m in models.get('models', [])]
        return {
            "ollama": "available",
            "models": model_names
        }
    except Exception as e:
        return {"ollama": "error", "detail": str(e)}

@app.post("/test-enhance")
def test_enhance(req: TextRequest):
    if not OLLAMA_AVAILABLE:
        return {"error": "Ollama not available"}
    
    try:
        response = ollama.chat(
            model="llama3.1",
            messages=[{
                "role": "system",
                "content": "Fix grammar and punctuation in the following text:"
            }, {
                "role": "user",
                "content": req.text
            }]
        )
        return {
            "original": req.text,
            "enhanced": response['message']['content']
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Ollama test server on port 8001...")
    print("📝 Test at: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
