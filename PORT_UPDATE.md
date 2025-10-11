# Port Update - ClassNote AI Now on Port 4000

## ✅ Changes Made

**Frontend:** Moved from port 3000 → **port 4000**

### Updated Files:
- `vite.config.ts` - Changed server port to 4000
- `backend/main.py` - Added port 4000 to CORS origins
- `backend/main_ai_only.py` - Added port 4000 to CORS origins
- `README.md` - Updated documentation

## 🚀 Current Setup

**Frontend:** http://localhost:4000  
**Backend:** http://localhost:8001  
**Ollama:** http://localhost:11434  

## 📋 Quick Commands

### Start Frontend (Port 4000):
```bash
npm run dev
```

### Start Backend (Port 8001):
```bash
cd backend
source venv/bin/activate
python main_ai_only.py
```

### Test Everything:
```bash
# Check frontend
curl http://localhost:4000

# Check backend
curl http://localhost:8001/health

# Test AI feature
curl -X POST http://localhost:8001/enhance \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}'
```

## 🎯 Access Points

- **App:** http://localhost:4000
- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health

## 🔧 Why Port 4000?

Port 4000 is commonly used for development and avoids conflicts with:
- Port 3000 (often used by other React apps)
- Port 8000 (commonly used by Python servers)
- Port 8001 (our backend)

---

**Ready to go!** 🎉
