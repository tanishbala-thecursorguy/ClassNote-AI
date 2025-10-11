# ClassNote AI - Complete Setup Guide

Step-by-step instructions to get ClassNote AI running on your machine.

## Quick Start (5 minutes)

### Step 1: Install Prerequisites

1. **Check Node.js** (need 18+):
   ```bash
   node --version
   ```
   If not installed: [Download Node.js](https://nodejs.org/)

2. **Check Python** (need 3.9+):
   ```bash
   python --version
   # or
   python3 --version
   ```
   If not installed: [Download Python](https://www.python.org/downloads/)

3. **Install FFmpeg**:
   ```bash
   # macOS (using Homebrew)
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ffmpeg
   
   # Windows (using Chocolatey)
   choco install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

### Step 2: Setup Frontend

Open Terminal/Command Prompt in the project folder:

```bash
# Install dependencies
npm install

# Start the frontend (keep this terminal open)
npm run dev
```

✅ Frontend should open at http://localhost:3000

### Step 3: Setup Backend

Open a **NEW** Terminal/Command Prompt:

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# You should see (venv) in your prompt now

# Install Python packages
pip install -r requirements.txt

# Start the backend (keep this terminal open)
python main.py
```

✅ Backend should start at http://localhost:8000

### Step 4: Test It Out

1. Go to http://localhost:3000 in your browser
2. Complete the onboarding
3. Click **"New Recording"**
4. Allow microphone access
5. Click the record button and say something
6. Stop recording, give it a title, and hit **"Save & Process"**
7. Wait for transcription (1-2 minutes first time due to model download)

## Detailed Setup Instructions

### Frontend Setup

#### Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Vite
- shadcn/ui components
- Tailwind CSS
- Lucide icons
- And more...

#### Environment Variables (Optional)

Create `.env.local` if you want to customize the API URL:

```bash
# Default is http://localhost:8000
VITE_API_URL=http://localhost:8000
```

#### Start Development Server

```bash
npm run dev
```

**What this does:**
- Starts Vite dev server on port 3000
- Enables hot module replacement
- Opens browser automatically

### Backend Setup

#### Create Virtual Environment

Why? Isolates Python packages from your system.

```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You'll see `(venv)` before your prompt when activated.

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI - Web framework
- Uvicorn - ASGI server
- Faster-Whisper - AI transcription
- Pydub - Audio processing
- Python-multipart - File uploads

#### Start Backend Server

```bash
python main.py
```

Or with auto-reload for development:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**First Run:**
The Whisper model (~500MB) will download automatically. This takes a few minutes.

## Verification Checklist

- [ ] Frontend running at http://localhost:3000
- [ ] Backend running at http://localhost:8000
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:8000/docs (API docs)
- [ ] Microphone permission granted
- [ ] Can record audio
- [ ] Audio transcribes successfully

## Common Issues & Solutions

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json and node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Python venv won't activate

**Windows PowerShell:**
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate
venv\Scripts\Activate.ps1
```

### Issue: `pip install` fails

**Solution:**
```bash
# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v
```

### Issue: FFmpeg not found

**macOS:**
```bash
# Install Homebrew first if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install FFmpeg
brew install ffmpeg
```

**Windows:**
1. Download from https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH
4. Restart terminal

### Issue: Port already in use

**Frontend (3000):**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Backend (8000):**
```bash
# Use a different port
uvicorn main:app --port 8001
```

Then update `.env.local`:
```bash
VITE_API_URL=http://localhost:8001
```

### Issue: Microphone doesn't work

**Browser Requirements:**
- Chrome/Edge: HTTPS or localhost only
- Firefox: Works on HTTP localhost
- Safari: May need explicit permission

**Solutions:**
1. Check browser settings > Privacy > Microphone
2. Ensure no other app is using mic
3. Try incognito/private mode
4. Restart browser

### Issue: Transcription takes forever

**Causes:**
- First run downloads model
- Long audio files
- CPU-bound processing

**Solutions:**
1. **Check model download progress** (backend logs)
2. **Use smaller model**:
   ```python
   # In backend/main.py
   model = WhisperModel("tiny", compute_type="int8")
   ```
3. **GPU acceleration** (if available):
   ```bash
   pip install faster-whisper[gpu]
   ```
   ```python
   model = WhisperModel("small", compute_type="float16", device="cuda")
   ```

### Issue: CORS errors

**Solution:**
Backend already has CORS configured for localhost:3000. If using different port:

```python
# In backend/main.py, update:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:YOUR_PORT"],
    ...
)
```

## Development Tips

### Keep Both Servers Running

You need TWO terminal windows:
1. **Terminal 1:** `npm run dev` (frontend)
2. **Terminal 2:** `python main.py` (backend)

### Auto-Reload

**Frontend:** Automatic with Vite  
**Backend:** Use `--reload` flag:
```bash
uvicorn main:app --reload
```

### View Logs

**Frontend:** Browser console (F12)  
**Backend:** Terminal output

### Test API Manually

```bash
# Health check
curl http://localhost:8000/health

# API docs (in browser)
open http://localhost:8000/docs
```

## Next Steps

Once everything is running:

1. **Explore the UI** - Navigate through different screens
2. **Test recording** - Try different audio lengths
3. **Check transcription quality** - Test with clear speech
4. **Customize settings** - Change Whisper model size
5. **Build for production** - `npm run build`

## Getting Help

If you're still stuck:

1. Check backend terminal for error logs
2. Check browser console for frontend errors
3. Review the main [README.md](README.md)
4. Check backend [README.md](backend/README.md)
5. Verify all prerequisites are installed correctly

## Production Deployment

See separate deployment guide for:
- Hosting on Vercel/Netlify (frontend)
- Hosting on Railway/Render (backend)
- Using Docker
- Environment configuration
- Security considerations

---

**Need help?** Check the troubleshooting section or review the logs in your terminal!

