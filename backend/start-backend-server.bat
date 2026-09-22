@echo off
chcp 65001 >nul
cls

echo ============================================================
echo 🚀 SIM KINERGE BACKEND SERVER STARTER
echo ============================================================
echo.

:: Check if port 8000 is in use
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  ERROR: Port 8000 already in use!
    echo    Another process is blocking the backend server.
    echo.
    echo To fix this:
    echo   1. Close any existing Laravel/PHP servers
    echo   2. Stop Docker/Podman containers running on port 8000
    echo   3. Run this batch file again
    pause
    exit /b 1
)

echo ✅ No conflicts detected on port 8000
echo.
echo Starting Python-based backend simulator...
echo This will:
echo   - Serve real data from SQLite database
echo   - Handle CORS for localhost:3000
echo   - Simulate Laravel API responses
echo.
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

python "api_bridge_server.py"

if errorlevel 1 (
    echo.
    echo ❌ Server exited with error
    pause
)
