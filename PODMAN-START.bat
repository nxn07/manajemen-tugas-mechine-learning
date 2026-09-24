@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo 🚀 SIM KINERJA - START ALL SERVICES WITH PODMAN (WSL)
echo ======================================================================
echo.

:: Check WSL
wsl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ WSL (Windows Subsystem for Linux) tidak terdeteksi!
    echo Silakan jalankan WSL terlebih dahulu.
    pause
    exit /b 1
)

echo [1/3] Menghubungkan ke Podman di WSL...
wsl -d Ubuntu-26.04 -e bash -c "podman --version && podman-compose --version"
if errorlevel 1 (
    echo ❌ Podman tidak ditemukan di Ubuntu-26.04!
    pause
    exit /b 1
)

echo.
echo [2/3] Menjalankan seluruh container via Podman...
wsl -d Ubuntu-26.04 -e bash -c "
cd /mnt/c/Users/Microsoft/Documents/Ngoding/TA
podman start simkap_postgres simkap_redis simkap_backend simkap_queue_worker simkap_frontend simkap_ml_python 2>/dev/null || podman-compose up -d
"

echo.
echo [3/3] Memeriksa status kontainer aktif...
wsl -d Ubuntu-26.04 -e bash -c "podman ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo.
echo ======================================================================
echo ✅ SELURUH SERVICE PODMAN BERHASIL DIJALANKAN!
echo ======================================================================
echo.
echo 🌐 Frontend Next.js : http://localhost:3000
echo ⚙️  Backend Laravel  : http://localhost:8000
echo 🗄️  PostgreSQL DB    : localhost:5432 (sim_kinerja)
echo ⚡ Redis Cache      : localhost:6379
echo 🧠 ML Python Engine : simkap_ml_python
echo.
echo Tekan tombol apapun untuk menutup jendela ini...
pause >nul
