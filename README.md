  # ClassNotes AI

AI-powered lecture recording and transcription app with a beautiful monochrome UI. Record lectures, automatically transcribe them with Whisper AI, and access your notes anywhere.

Original design: [Figma](https://www.figma.com/design/8Yfbsu0eGS6dlGHLxOYqqg/ClassNote-AI-Monochrome-Design)

## 🚀 Features

- 🎤 **Audio Recording** - Record lectures with real-time markers
- 🤖 **AI Transcription** - Powered by Faster-Whisper (local, private)
- 📝 **Smart Paragraphs** - Automatic text segmentation
- ⏱️ **Timestamped Segments** - Navigate through lectures easily
- ✨ **AI Enhancement** - Improve transcription quality with LLMs (NEW!)
- 📊 **Smart Summaries** - Auto-generate lecture summaries (NEW!)
- 🎯 **Key Points** - Extract important concepts automatically (NEW!)
- 📚 **Study Guides** - Generate comprehensive study materials (NEW!)
- 📝 **Quiz Generation** - Create practice quizzes from lectures (NEW!)
- 📱 **Responsive Design** - Works on mobile and desktop
- 🎨 **Beautiful UI** - Clean monochrome design
- 🔒 **100% Local** - All processing on your machine, fully private

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Python 3.9+**
- **FFmpeg** (for audio processing)
- **Ollama** (for AI features) - Optional but recommended
- **pkg-config** (for audio dependencies)

### Install System Dependencies

```bash
# macOS
brew install ffmpeg pkg-config ollama

# Ubuntu/Debian
sudo apt-get install ffmpeg pkg-config
curl -fsSL https://ollama.com/install.sh | sh

# Windows (Chocolatey)
choco install ffmpeg
# Download Ollama from https://ollama.com/download
```

### Pull AI Model (for enhanced features)

```bash
ollama pull llama3.1:8b-instruct
```

## 🛠️ Installation

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file (optional - defaults to localhost:8000)
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will open at http://localhost:4000

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
```

The API will run at http://localhost:8001

## 🎯 Usage

1. **Start both servers** (frontend and backend)
2. **Click "New Recording"** in the app
3. **Allow microphone access** when prompted
4. **Start recording** your lecture
5. **Add markers** for key points during recording (optional)
6. **Stop recording** and give it a title
7. **Wait for transcription** - usually 1-2 minutes
8. **View your transcribed notes** with timestamps

## 📁 Project Structure

```
ClassNote AI/
├── src/
│   ├── components/
│   │   ├── screens/          # Main app screens
│   │   ├── classnote/         # Custom components
│   │   └── ui/                # shadcn/ui components
│   ├── services/
│   │   └── api.ts             # Backend API service
│   └── styles/
│       └── globals.css        # Global styles
├── backend/
│   ├── main.py                # FastAPI server
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
└── README.md                  # This file
```

## 🔧 Configuration

### Frontend Environment Variables

Create `.env.local`:

```bash
VITE_API_URL=http://localhost:8001
```

### Backend Model Configuration

Edit `backend/main.py` to change the Whisper model:

```python
# Options: tiny, base, small, medium, large-v2, large-v3
model = WhisperModel("small", compute_type="int8")
```

**Model Trade-offs:**
- `tiny` - Fastest, lower accuracy (~75MB)
- `small` - Good balance (~500MB) ✅ Default
- `medium` - Better accuracy, slower (~1.5GB)
- `large` - Best accuracy, slowest (~3GB)

## 🧪 Development

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

### Backend Testing

```bash
cd backend
# Test API health
curl http://localhost:8001/health

# Test transcription (requires audio file)
curl -X POST http://localhost:8001/transcribe \
  -F "file=@test.wav"
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc
- **AI Features Guide:** [AI_FEATURES.md](AI_FEATURES.md)

## 🔒 Privacy & Security

- **Local Processing** - All transcription happens on your machine
- **No Cloud Required** - No API keys or external services needed
- **Your Data Stays Local** - Audio and transcriptions remain private

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions
- Try HTTPS (required for some browsers)
- Ensure no other apps are using the microphone

### Frontend Port Changed
- Default port is now 4000 (was 3000)
- Update any bookmarks or references accordingly

### API Connection Failed
- Verify backend is running on port 8001
- Check `VITE_API_URL` in `.env.local`
- Ensure CORS is enabled (already configured)

### Transcription Errors
- Confirm FFmpeg is installed: `ffmpeg -version`
- Check Python dependencies are installed
- Review backend logs for detailed errors

### Model Download Issues
- First run downloads the Whisper model (~500MB)
- Ensure stable internet connection
- Check disk space availability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational and personal use.

## 🙏 Credits

- Design: [ClassNotes AI Design](https://www.figma.com/design/8Yfbsu0eGS6dlGHLxOYqqg/ClassNote-AI-Monochrome-Design)
- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Transcription: [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper)
- Icons: [Lucide React](https://lucide.dev/)
  