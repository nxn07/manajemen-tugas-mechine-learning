@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo 📊 SIM KINERJA - PODMAN CONTAINERS HEALTH & STATUS
echo ======================================================================
echo.

wsl -d Ubuntu-26.04 -e bash -c "
podman ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
"

echo.
echo ======================================================================
echo Tes koneksi HTTP:
wsl -d Ubuntu-26.04 -e bash -c "
curl -s -o /dev/null -w 'Frontend (Port 3000) : Status HTTP %{http_code}\n' http://localhost:3000 || echo 'Frontend: Offline'
curl -s -o /dev/null -w 'Backend  (Port 8000) : Status HTTP %{http_code}\n' http://localhost:8000/api/v1/auth/me || echo 'Backend: Offline'
"
echo ======================================================================
pause
