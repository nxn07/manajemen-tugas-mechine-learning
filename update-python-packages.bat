@echo off
chcp 65001 >nul
cls

echo ============================================================
echo 🔄 UPDATING PYTHON PACKAGES FOR SIM KINERJA PROJECT
echo ============================================================
echo.

:: Check if Python exists
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python not found in PATH
    echo.
    echo Please install Python 3.12+ from:
    echo   https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python detected
python --version
echo.

:: Get pip version
pip --version | findstr Python >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pip not available
    echo Installing pip...
    python -m ensurepip --upgrade
)

echo.
echo Updating core packages...
echo ============================================================
echo.

:: Update key packages
python -m pip install --upgrade ^
    scikit-learn ^
    numpy ^
    pandas ^
    psycopg2-binary ^
    requests ^
    httpx ^
    2>nul

echo.
echo Verifying installations...
echo ============================================================
echo.

python -c "
import sys
sys.path.insert(0, 'backend')

packages = ['sklearn', 'numpy', 'pandas', 'sqlite3', 'http.server']
errors = []

for pkg in packages:
    try:
        __import__(pkg.replace('sklearn', 'sklearn.preprocessing'))
        print(f'✅ {pkg}')
    except ImportError as e:
        print(f'❌ {pkg}: {e}')
        errors.append(pkg)

if errors:
    print()
    print(f'⚠️  Warning: {len(errors)} package(s) missing')
else:
    print()
    print('✅ All packages verified successfully!')
"

echo.
echo ============================================================
echo ✅ UPDATE COMPLETE
echo ============================================================
echo.
echo Your Python environment is now ready for SIM Kinerja!
echo.
pause
