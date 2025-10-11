# ClassNote AI - Architecture Documentation

## System Overview

ClassNote AI is a full-stack application that records audio lectures, transcribes them using AI, and provides an intuitive interface for viewing and managing lecture notes.

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (React + Vite + Tailwind)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────────────────┐
│                  Backend API                             │
│              (FastAPI + Python)                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Local Processing
                   │
┌──────────────────▼──────────────────────────────────────┐
│              AI Transcription                            │
│          (Faster-Whisper + FFmpeg)                       │
└──────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Component Structure

```
src/
├── components/
│   ├── screens/              # Full-page screen components
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── RecordScreen.tsx      # Audio recording interface
│   │   ├── ProcessingScreen.tsx  # Transcription progress
│   │   ├── SessionDetailScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── DesktopViewer.tsx
│   │
│   ├── classnote/            # Feature-specific components
│   │   ├── RecordButton.tsx
│   │   ├── LectureCard.tsx
│   │   ├── ProgressStepper.tsx
│   │   ├── TranscriptRow.tsx
│   │   ├── ChartBlock.tsx
│   │   └── TableBlock.tsx
│   │
│   └── ui/                   # Reusable UI primitives (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ components)
│
├── services/
│   └── api.ts                # Backend API client
│
├── styles/
│   └── globals.css           # Global styles
│
└── App.tsx                   # Main app with routing logic
```

### State Management

**Approach:** Component-level state with React hooks

**Key State:**
- `currentScreen` - Navigation state (discriminated union)
- `lectures` - Array of lecture metadata
- `recordingData` - Audio blob + metadata during recording
- `transcription` - API response with text, segments, paragraphs

**State Flow:**
```
RecordScreen → captures audio
     ↓
ProcessingScreen → calls API with audio blob
     ↓
App.tsx → receives transcription, updates lectures
     ↓
HomeScreen/SessionDetailScreen → displays results
```

### Recording Flow

1. **RecordScreen** requests microphone access
2. Uses `MediaRecorder` API to capture audio
3. Records to WebM format with Opus codec
4. Stores chunks in memory via `useRef`
5. On stop: creates Blob and passes to processing
6. Supports adding timestamped markers during recording

### API Integration

**Service Layer:** `src/services/api.ts`

**Key Functions:**
- `checkApiHealth()` - Verify backend connection
- `transcribeAudio(blob, onProgress)` - Upload & transcribe
- `formatTimestamp()` - Format seconds to MM:SS
- `formatDuration()` - Human-readable duration

**XMLHttpRequest** used instead of `fetch` to track upload progress.

## Backend Architecture

### Tech Stack

- **FastAPI** - Modern Python web framework
- **Faster-Whisper** - Optimized Whisper implementation
- **Pydub** - Audio format conversion
- **Uvicorn** - ASGI server

### API Endpoints

#### `GET /`
Health check root endpoint.

#### `GET /health`
Detailed health status including model information.

#### `POST /transcribe`
Main transcription endpoint.

**Request:**
```
Content-Type: multipart/form-data
Body: file (audio file)
```

**Response:**
```json
{
  "text": "Full transcription...",
  "paragraphs": ["Para 1", "Para 2", ...],
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "First segment"
    },
    ...
  ],
  "metadata": {
    "language": "en",
    "language_probability": 0.99,
    "duration": 120.5
  }
}
```

### Processing Pipeline

```
Audio Upload (WebM)
     ↓
Format Conversion (WebM → WAV)
     ↓
Whisper Transcription
     ↓
Text Segmentation
     ↓
Paragraph Formation
     ↓
JSON Response
```

### Whisper Configuration

**Model:** `small` (default)
- Size: ~500MB
- Quality: Good balance
- Speed: ~1-2 min for 1 hour lecture

**Settings:**
- `vad_filter=True` - Voice Activity Detection
- `word_timestamps=False` - Segment-level only
- `compute_type="int8"` - CPU-optimized

### Error Handling

- Invalid file format → 500 with error detail
- Transcription failure → Logged + 500 response
- CORS issues → Middleware configured for localhost

## Data Flow

### Recording → Transcription

```
User clicks record
     ↓
MediaRecorder starts capturing audio
     ↓
User adds markers (optional)
     ↓
User stops recording → enters title
     ↓
Blob created from audio chunks
     ↓
Navigate to ProcessingScreen with:
  - audioBlob
  - title
  - duration
  - markers
     ↓
ProcessingScreen uploads to /transcribe
     ↓
Backend processes audio:
  1. Convert to WAV
  2. Feed to Whisper
  3. Parse segments
  4. Create paragraphs
     ↓
Return transcription result
     ↓
App updates lecture status to "Ready"
     ↓
Navigate back to HomeScreen
```

### Storage Strategy

**Current:** In-memory only (demo mode)

**Production Ready:**
```typescript
// Store in localStorage/IndexedDB
interface LectureData {
  id: string;
  title: string;
  duration: string;
  date: string;
  audioBlob?: Blob;
  transcription: TranscriptionResponse;
  markers: Marker[];
}
```

Or connect to a backend database:
- PostgreSQL for metadata
- S3/MinIO for audio files
- Full-text search with Elasticsearch

## Security Considerations

### Current (Development)

- ✅ CORS enabled for localhost only
- ✅ Local-only processing (no data leaves machine)
- ✅ No authentication (single-user app)

### Production Recommendations

1. **Authentication**
   ```python
   from fastapi import Depends, HTTPException
   from fastapi.security import HTTPBearer
   
   security = HTTPBearer()
   
   @app.post("/transcribe")
   async def transcribe(token: str = Depends(security)):
       # Verify token
       pass
   ```

2. **Rate Limiting**
   ```python
   from slowapi import Limiter
   
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/transcribe")
   @limiter.limit("5/minute")
   async def transcribe():
       pass
   ```

3. **File Validation**
   - Max file size (e.g., 100MB)
   - Allowed formats only (wav, webm, mp3)
   - Virus scanning

4. **HTTPS Only**
   - SSL/TLS certificates
   - Secure cookies
   - HSTS headers

## Performance Optimization

### Frontend

1. **Code Splitting**
   ```typescript
   const SessionDetailScreen = lazy(() => 
     import('./components/screens/SessionDetailScreen')
   );
   ```

2. **Audio Compression**
   - Use WebM Opus codec (already implemented)
   - Bitrate: 32kbps sufficient for speech

3. **Progress Feedback**
   - Upload progress bar
   - Step-by-step processing indicators

### Backend

1. **Model Caching**
   - Model loaded once on startup
   - Reused for all requests

2. **Async Processing**
   ```python
   from fastapi import BackgroundTasks
   
   @app.post("/transcribe")
   async def transcribe(background_tasks: BackgroundTasks):
       # Return immediately, process in background
       background_tasks.add_task(process_audio, file)
       return {"status": "processing", "id": job_id}
   ```

3. **GPU Acceleration**
   ```python
   model = WhisperModel(
       "small",
       device="cuda",
       compute_type="float16"
   )
   ```

4. **Caching Results**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def get_transcription(audio_hash: str):
       pass
   ```

## Scalability

### Horizontal Scaling

**Frontend:**
- Deploy to CDN (Vercel, Netlify, Cloudflare)
- Static assets cached at edge

**Backend:**
- Deploy multiple instances behind load balancer
- Use Redis for shared session storage
- Queue transcription jobs with Celery/RQ

### Vertical Scaling

- GPU instances for faster transcription
- Larger Whisper models (medium/large)
- More CPU cores for parallel processing

## Monitoring & Observability

### Recommended Tools

**Backend:**
```python
import logging
from prometheus_client import Counter, Histogram

transcription_duration = Histogram(
    'transcription_duration_seconds',
    'Time spent transcribing'
)

@app.post("/transcribe")
async def transcribe():
    with transcription_duration.time():
        # ... transcription logic
        pass
```

**Frontend:**
```typescript
// Error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [new BrowserTracing()],
});
```

### Key Metrics

- Transcription success rate
- Average transcription time
- API latency (p50, p95, p99)
- Error rates by type
- Active users / recordings per day

## Testing Strategy

### Frontend

```typescript
// Unit tests (Vitest)
describe('RecordScreen', () => {
  it('starts recording on button click', () => {
    // Test logic
  });
});

// Integration tests
describe('Recording flow', () => {
  it('uploads and transcribes audio', async () => {
    // Full flow test
  });
});
```

### Backend

```python
# Unit tests (pytest)
def test_paragraphize_text():
    text = "Sentence one. Sentence two."
    result = paragraphize_text(text, 2)
    assert len(result) == 1

# Integration tests
def test_transcribe_endpoint(client):
    with open("test.wav", "rb") as f:
        response = client.post(
            "/transcribe",
            files={"file": f}
        )
    assert response.status_code == 200
```

## Deployment

### Docker Setup

```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]

# Backend
FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Environment Variables

**Frontend:**
- `VITE_API_URL` - Backend API URL

**Backend:**
- `MODEL_SIZE` - Whisper model (tiny/base/small/medium/large)
- `COMPUTE_TYPE` - int8/float16/float32
- `DEVICE` - cpu/cuda
- `LOG_LEVEL` - debug/info/warning/error

## Future Enhancements

### Phase 1: Core Features
- [ ] Save transcriptions to database
- [ ] Search across all lectures
- [ ] Export to PDF/Markdown
- [ ] Audio playback with transcript sync

### Phase 2: AI Features
- [ ] Automatic summary generation (GPT-4/Claude)
- [ ] Key point extraction
- [ ] Quiz generation from lectures
- [ ] Speaker diarization (who said what)

### Phase 3: Collaboration
- [ ] Multi-user support
- [ ] Shared lectures
- [ ] Comments and annotations
- [ ] Real-time collaboration

### Phase 4: Advanced
- [ ] Mobile apps (React Native)
- [ ] Offline mode with sync
- [ ] Video lecture support
- [ ] Live transcription during recording

## Troubleshooting Guide

### Common Issues

**Issue:** Transcription is slow
- **Cause:** CPU-bound processing
- **Fix:** Use smaller model or GPU acceleration

**Issue:** Out of memory
- **Cause:** Large audio files + model size
- **Fix:** Increase RAM or process in chunks

**Issue:** Poor transcription quality
- **Cause:** Background noise, unclear speech
- **Fix:** Use VAD filter (already enabled), denoise audio

## Contributing

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for development setup.

### Code Style

- Frontend: ESLint + Prettier
- Backend: Black + isort + mypy
- Commits: Conventional Commits

### Pull Request Process

1. Create feature branch
2. Add tests
3. Update documentation
4. Submit PR with description
5. Pass CI checks
6. Get review approval
7. Merge to main

---

**Last Updated:** October 2025  
**Version:** 1.0.0

