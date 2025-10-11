# ClassNote AI - Quick Start Guide

## Start Backend (Port 8001)

Navigate to the backend directory and run:

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Start server on port 8001
uvicorn main:app --host 0.0.0.0 --port 8001

# OR with auto-reload for development
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Alternative (using Python directly):
```bash
cd backend
source venv/bin/activate
python main.py  # Already configured for port 8001
```

## Start Frontend

In a **separate terminal**:

```bash
# From project root
npm run dev
```

The frontend will automatically connect to `http://localhost:8001`

## Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8001/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "model": "whisper-small",
     "compute_type": "int8"
   }
   ```

2. **API Documentation:**
   - Open http://localhost:8001/docs in your browser
   - You should see the interactive Swagger UI

3. **Frontend:**
   - Open http://localhost:3000 in your browser
   - You should see the ClassNote AI interface

## Running Both Servers Together

### Option 1: Automated Scripts

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

### Option 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Configuration

The frontend is configured to use `http://localhost:8001` by default.

To change the API URL, create `.env.local`:

```bash
VITE_API_URL=http://localhost:8001
```

## Port Configuration

Current setup:
- **Backend API:** Port 8001
- **Frontend:** Port 3000 (Vite default from config)

To change ports:

### Change Backend Port

**Option A:** Edit `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=YOUR_PORT, log_level="info")
```

**Option B:** Use command line:
```bash
uvicorn main:app --host 0.0.0.0 --port YOUR_PORT
```

### Change Frontend Port

Edit `vite.config.ts`:
```typescript
export default defineConfig({
  // ...
  server: {
    port: YOUR_PORT,
    open: true,
  },
})
```

Don't forget to update CORS in `backend/main.py` if you change frontend port:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:YOUR_FRONTEND_PORT",
    ],
    ...
)
```

## Troubleshooting

### Port Already in Use

**For port 8001:**
```bash
# Find and kill process using port 8001
# macOS/Linux:
lsof -ti:8001 | xargs kill -9

# Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### Backend Won't Start

1. Check if virtual environment is activated (you should see `(venv)` in your prompt)
2. Verify Python dependencies are installed:
   ```bash
   pip list | grep -E "fastapi|uvicorn|faster-whisper"
   ```
3. Check FFmpeg is installed:
   ```bash
   ffmpeg -version
   ```

### Frontend Can't Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://localhost:8001/health
   ```

2. Check `.env.local` has correct API URL:
   ```bash
   cat .env.local
   # Should show: VITE_API_URL=http://localhost:8001
   ```

3. Check browser console for CORS errors

### "Module not found" Errors

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Testing the Setup

1. **Start both servers**
2. **Go to http://localhost:3000**
3. **Complete onboarding**
4. **Click "New Recording"**
5. **Allow microphone access**
6. **Record a short test (5-10 seconds)**
7. **Stop, give it a title, and click "Save & Process"**
8. **Wait for transcription** (first time downloads ~500MB model)

If you see transcribed text, everything is working! 🎉

## Environment Variables Reference

### Frontend (.env.local)
```bash
# API endpoint
VITE_API_URL=http://localhost:8001

# Environment
NODE_ENV=development
```

### Backend (optional .env)
```bash
# Model configuration
WHISPER_MODEL=small
COMPUTE_TYPE=int8
DEVICE=cpu

# Server configuration
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=info
```

## Next Steps

- Read the full [README.md](README.md) for features and architecture
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions
- Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design

---

**Quick Reference:**
- Backend: `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`
- Frontend: `npm run dev`
- Health: http://localhost:8001/health
- API Docs: http://localhost:8001/docs
- App: http://localhost:3000

