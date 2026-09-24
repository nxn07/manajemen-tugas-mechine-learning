# 🐍 PYTHON SETUP FOR SIM KINERJA

## Current Status ✅

**Installed:**
```bash
Python Version: 3.12.0
Executable: C:\Python312\python.exe
Platform: Windows 11 (x64)
```

**Installed Packages:**
```
✅ numpy             2.2.4      (Numerical computing)
✅ pandas            2.3.0      (Data manipulation)
✅ scikit-learn      1.7.0      (ML algorithms - K-Means)
✅ psycopg2-binary   2.9.13     (PostgreSQL connector)
✅ requests          latest     (HTTP client)
✅ httpx             latest     (Async HTTP client)
```

---

## What Python Is Used For?

### 1. **ML Pipeline Execution**
File: `backend/run_ml_simple.py`
- Extracts features from employees
- Runs K-Means clustering algorithm
- Saves results to SQLite database

### 2. **API Bridge Server**
File: `backend/api_bridge_server.py`
- Replaces Laravel backend (which needs PHP 8.2+)
- Serves real data from SQLite
- Handles CORS for frontend communication

### 3. **Data Generation Scripts**
- `backend/setup_ml_data.py` - Create test data
- Various verification scripts

---

## Why Not Use Laravel Backend Directly?

| Issue | Laravel Backend | Python Solution |
|-------|----------------|-----------------|
| PHP Requirement | 8.2+ ❌ | None ✅ |
| Your System | PHP 7.4 only | Python 3.12 ✅ |
| Setup Complexity | High (Docker/Podman) | Low (direct) ✅ |
| Development Speed | Slow startup | Instant ✅ |
| Production Ready | Yes | Dev mode only |

**Result:** Python API bridge provides instant development without PHP upgrade.

---

## How To Start Everything

### Option 1: Quick Start (Recommended)
```bash
# In PowerShell or Command Prompt:
cd C:\Users\Microsoft\Documents\Ngoding\KP\backend
start-backend-server.bat
```

This will:
1. Check if port 8000 is available
2. Start Python API server
3. Display helpful information
4. Run in background until you stop it

### Option 2: Manual Start
```bash
cd backend
python api_bridge_server.py
```

Expected output:
```
============================================================
🚀 SIM KINERJA API BRIDGE SERVER
============================================================

Database: database/database.sqlite
Server:   http://localhost:8000
Mode:     SQLite (Bypassing Laravel)

Endpoints available:
  GET  /api/v1/employees          - Employee list
  GET  /api/v1/dashboard/stats    - Dashboard statistics
  GET  /api/v1/clustering-results - ML clustering results
  POST /api/v1/ml/extract-features - Trigger extraction
  POST /api/v1/ml/run-clustering   - Run clustering

CORS enabled for localhost:3000 ✅

Press Ctrl+C to stop
============================================================
```

Then refresh browser with **Ctrl + Shift + R**.

---

## Updating Python Packages

To keep packages up-to-date:

### Method 1: Using Batch Script
```bash
update-python-packages.bat
```

### Method 2: Manual Update
```bash
python -m pip install --upgrade \
    scikit-learn \
    numpy \
    pandas \
    psycopg2-binary
```

### Verify Installation
```bash
python << 'EOF'
import sklearn, numpy, pandas
print(f"scikit-learn: {sklearn.__version__}")
print(f"numpy: {numpy.__version__}")
print(f"pandas: {pandas.__version__}")
print("✅ All packages working!")
EOF
```

---

## Testing Python Environment

Run this to verify everything works:

```bash
cd backend
python run_ml_simple.py
```

Should show:
```
============================================================
ML Pipeline - SIM Kinerja K-Means
============================================================

Found 26 employees
Extracting features...
Extracted 26 feature sets
Matrix shape: (26, 8)
Running K-Means (n_clusters=3)...
Silhouette Score: 0.2878

Cluster Distribution:
  Cluster 0: 8 employees (30.8%)
  Cluster 1: 7 employees (26.9%)
  Cluster 2: 11 employees (42.3%)

Saving to database...
Features saved
Clustering results saved (ID: 1)
Cluster assignments saved

SUCCESS - ML Pipeline Completed!
============================================================
```

---

## Common Issues & Solutions

### Issue 1: "Python not found"
**Solution:** Add Python to PATH
```cmd
setx PATH "%PATH%;C:\Python312\"
```
Then restart terminal.

### Issue 2: Port Already in Use
**Symptoms:** "Address already in use" error

**Solutions:**
1. Find process using port 8000:
   ```cmd
   netstat -ano | findstr :8000
   ```

2. Kill it:
   ```cmd
   taskkill /F /PID <PID_HERE>
   ```

3. Or use different port (edit `api_bridge_server.py`, change `PORT = 8000`)

### Issue 3: Import Errors
**Symptoms:** "ModuleNotFoundError"

**Solution:** Install missing package:
```bash
pip install package_name
```

Example:
```bash
pip install scikit-learn
```

### Issue 4: Database Not Found
**Symptoms:** "unable to open database file"

**Solution:** Ensure running from correct directory:
```bash
cd C:\Users\Microsoft\Documents\Ngoding\KP\backend
python api_bridge_server.py
```

---

## Performance Tips

### Optimize for Speed
The Python API server is already optimized for fast responses:
- Direct SQLite access (< 10ms queries)
- Minimal overhead
- No Docker container latency

### Memory Usage
Typical memory footprint:
- Python interpreter: ~50 MB
- API server process: ~30 MB
- Database cache: ~20 MB
- **Total: ~100 MB** (very light!)

### CPU Usage
- Idle: < 1%
- On request: Burst then idle
- Never constant load (unlike Laravel workers)

---

## Production vs Development

### Development Mode (Current)
**Using:** Python API Bridge
- ✅ Instant start
- ✅ Easy debugging
- ✅ Simple setup
- ❌ Not production-ready
- ❌ Limited authentication
- ❌ No queue management

### Production Mode (Future)
**Would use:** Full Laravel backend
- Requires: PHP 8.2+, PostgreSQL, Redis
- Setup: Docker/Podman containers
- Benefits: Full security, auth, scalability

**When to switch?** When deploying to production server.

---

## Next Steps After Python Setup

1. ✅ Start API bridge server (`start-backend-server.bat`)
2. ✅ Open browser to `http://localhost:3000`
3. ✅ Hard refresh (Ctrl + Shift + R)
4. ✅ Test all features work
5. ✅ Navigate to ML Clustering page
6. ✅ Verify data displays correctly

---

## Troubleshooting Checklist

Before reporting issues:
- [ ] Python installed (check `python --version`)
- [ ] Packages updated (`pip list`)
- [ ] Running from correct directory (`cd backend`)
- [ ] Port 8000 available (no conflicts)
- [ ] Database file exists (`database/database.sqlite`)
- [ ] Frontend server also running on port 3000

---

## Reference Commands

```bash
# Check Python version
python --version

# Show installed packages
pip list

# Update specific package
pip install --upgrade scikit-learn

# Install new package
pip install package_name

# Run ML pipeline
cd backend
python run_ml_simple.py

# Start API server
cd backend
python api_bridge_server.py

# Check if port is free
netstat -ano | findstr :8000
```

---

**Status:** ✅ READY  
**Last Updated:** 2026-09-22  
**Version:** 1.0
