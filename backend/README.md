# ClassNote AI Backend

FastAPI-based transcription service using Faster-Whisper for high-quality speech-to-text conversion.

## Features

- 🎤 Audio transcription with Faster-Whisper
- ⚡ Fast processing with optimized model
- 📝 Automatic paragraph segmentation
- ⏱️ Timestamped segments for playback sync
- 🌐 CORS-enabled for frontend integration

## Prerequisites

1. **Python 3.9+** installed
2. **FFmpeg** installed (required for audio conversion)
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # Windows (using Chocolatey)
   choco install ffmpeg
   ```

## Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate virtual environment:**
   ```bash
   # macOS/Linux
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Development Mode
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

The API will be available at:
- **API:** http://localhost:8001
- **Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health

## API Endpoints

### `POST /transcribe`
Transcribe audio file to text.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (audio file - WAV, WebM, MP3, etc.)

**Response:**
```json
{
  "text": "Full transcription text...",
  "paragraphs": [
    "First paragraph...",
    "Second paragraph..."
  ],
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "Segment text"
    }
  ],
  "metadata": {
    "language": "en",
    "language_probability": 0.99,
    "duration": 120.5
  }
}
```

### `GET /health`
Check API health status.

## Model Configuration

Current configuration:
- **Model:** `whisper-small` (balanced speed/accuracy)
- **Compute:** `int8` (optimized for CPU)

To change the model, edit `main.py`:
```python
# Options: tiny, base, small, medium, large-v2, large-v3
model = WhisperModel("medium", compute_type="int8")
```

## Troubleshooting

### Model Download
On first run, the Whisper model will be downloaded automatically (~500MB for small model). This may take a few minutes.

### FFmpeg Issues
If you get audio conversion errors, ensure FFmpeg is properly installed:
```bash
ffmpeg -version
```

### Port Already in Use
If port 8001 is taken, specify a different port:
```bash
uvicorn main:app --port 8002
```

## Performance Tips

1. **GPU Acceleration (optional):**
   - Install CUDA toolkit
   - Use `compute_type="float16"` for faster processing
   - Install `faster-whisper[gpu]`

2. **Model Selection:**
   - `tiny`: Fastest, lower accuracy (~75MB)
   - `small`: Good balance (~500MB) ✅ Current
   - `medium`: Better accuracy, slower (~1.5GB)
   - `large`: Best accuracy, slowest (~3GB)

## Security Notes

- Never commit API keys or secrets
- Use environment variables for sensitive config
- Enable authentication for production deployment
- Restrict CORS origins in production

