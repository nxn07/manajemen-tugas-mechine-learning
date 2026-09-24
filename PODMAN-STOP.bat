@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo 🛑 SIM KINERJA - STOP ALL PODMAN CONTAINERS
echo ======================================================================
echo.

wsl -d Ubuntu-26.04 -e bash -c "
echo 'Menghentikan seluruh kontainer SIM Kinerja...'
podman stop simkap_frontend simkap_queue_worker simkap_backend simkap_ml_python simkap_redis simkap_postgres
echo 'Seluruh kontainer telah dihentikan.'
"

echo.
echo ======================================================================
echo ✅ Kontainer berhasil dihentikan.
echo ======================================================================
pause
