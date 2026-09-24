@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo 🚀 SIM KINERJA - QUICK START SCRIPT
echo ======================================================================
echo.
echo This script starts BOTH frontend and backend servers WITHOUT
echo Docker/Podman. Works on any Windows machine with Node.js & Python.
echo.
echo Prerequisites Check...
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NOT found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Node.js: OK
node --version | findstr "v"

:: Check Python
python --version >nul 2>&1  
if errorlevel 1 (
    echo ⚠️  Python NOT found
    echo Installing Python...
    start https://www.python.org/downloads/
    timeout /t 3 >nul
) else (
    echo ✅ Python: OK
    python --version | findstr "3."
)

echo.
echo Starting servers in 3 seconds...
timeout /t 3 >nul

cls

echo ======================================================================
echo STEP 1: Starting Backend API Server (Separate Window)
echo ======================================================================
echo.
echo The backend will start in a NEW window. Keep it open!
echo Press Ctrl+C only when you're done testing.
echo.

cd backend

REM Start backend server in new console window
start "SIM Kinerja Backend Server" cmd /k title Backend Server && python api_bridge_server.py

echo.
echo Waiting 4 seconds for backend to initialize...
timeout /t 4 >nul

cls

echo ======================================================================
echo STEP 2: Starting Frontend Next.js Server (This Window)
echo ======================================================================
echo.
echo The frontend will start here. Wait for 'Compiled successfully!' message.
echo.
echo ------------------------------------------------------
echo IMPORTANT: Press CTRL+C ONLY when you want to STOP.
echo Do not close this window while using the app!
echo ------------------------------------------------------
echo.

cd frontend

REM Start next.js dev server
npm run dev

REM If command above fails, try alternative
if errorlevel 1 (
    echo.
    echo Alternative command failed. Try manually:
    echo   cd frontend
    echo   npm run dev
    pause
)
