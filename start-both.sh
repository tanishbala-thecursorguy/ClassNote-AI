#!/bin/bash

echo "🚀 Starting ClassNote AI servers..."
echo "📱 Desktop version: http://localhost:4000"
echo "📱 Mobile version: http://localhost:4001"
echo ""

# Kill any existing vite processes
pkill -f "vite" 2>/dev/null

# Start desktop version in background
echo "Starting desktop version on port 4000..."
npm run dev > /dev/null 2>&1 &
DESKTOP_PID=$!

# Start mobile version in background  
echo "Starting mobile version on port 4001..."
npm run dev:mobile > /dev/null 2>&1 &
MOBILE_PID=$!

echo "✅ Both servers started successfully!"
echo "📱 Desktop: http://localhost:4000 (PID: $DESKTOP_PID)"
echo "📱 Mobile: http://localhost:4001 (PID: $MOBILE_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping servers..."; kill $DESKTOP_PID $MOBILE_PID 2>/dev/null; echo "✅ Servers stopped"; exit 0' INT

# Keep script running
wait
