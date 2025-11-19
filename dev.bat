@echo off
echo 🚀 Starting RFQ Backend (Quick Start)
echo.

REM Stop any running servers
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start development server
echo ✅ Starting server on http://localhost:3000
echo 📝 Press Ctrl+C to stop
echo.

npm run dev
