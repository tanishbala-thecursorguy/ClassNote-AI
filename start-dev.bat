@echo off
REM ClassNote AI Development Startup Script for Windows
REM Starts both frontend and backend servers

echo.
echo Starting ClassNote AI Development Servers...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

REM Check if FFmpeg is installed
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: FFmpeg is not installed. Please install FFmpeg first.
    echo Windows: choco install ffmpeg
    pause
    exit /b 1
)

REM Start backend in new window
echo Starting Backend Server...
cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist venv\.installed (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo. > venv\.installed
)

echo Backend will start on http://localhost:8001
start "ClassNote AI - Backend" cmd /k "venv\Scripts\activate.bat && python main.py"

cd ..

REM Install frontend dependencies if needed
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

REM Start frontend in new window
echo Starting Frontend Server...
echo Frontend will start on http://localhost:3000
start "ClassNote AI - Frontend" cmd /k npm run dev

echo.
echo ====================================
echo Both servers are starting!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8001
echo API Docs: http://localhost:8001/docs
echo.
echo Close the terminal windows to stop the servers
echo ====================================
echo.

pause

