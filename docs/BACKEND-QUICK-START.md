# 🚀 BACKEND SERVER QUICK START GUIDE

## Problem Diagnosis

❌ **Current Issue:**
- Backend Laravel requires PHP 8.2+ (union types support)
- Your system has PHP 7.4.19 only
- Laravel won't run, causing CORS errors and empty data

✅ **Solution:** Use Python-based API Bridge Server instead

---

## Quick Start (3 Steps)

### Step 1: Stop Any Existing Servers

```bash
# Windows Command Prompt or PowerShell:
netstat -ano | findstr :8000
# If there's output, another process is using port 8000
# Kill it first OR use a different port
```

### Step 2: Start the API Bridge Server

**Option A: Using Batch File (Recommended)**
```bash
cd backend
start-backend-server.bat
```

**Option B: Using Python Directly**
```bash
cd backend
python api_bridge_server.py
```

You should see:
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

### Step 3: Refresh Frontend

In Chrome browser:
1. Go to `http://localhost:3000`
2. Press **Ctrl + Shift + R** (hard refresh)
3. Navigate to dashboard/ML pages

✅ **Expected Result:** All features working with real data!

---

## Available Endpoints

The API Bridge server provides these endpoints:

### GET Endpoints
- `GET /api/v1/employees` - List all 26 employees
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/clustering-results` - Latest ML clustering results

### POST Endpoints (Simulated)
- `POST /api/v1/ml/extract-features` - Returns success (data already exists)
- `POST /api/v1/ml/run-clustering` - Returns existing clustering results

All endpoints include proper CORS headers for `http://localhost:3000`.

---

## Data Source

**Database:** `backend/database/database.sqlite`

**Tables with real data:**
- `employees` - 26 employee records
- `ml_employee_feature_data` - Feature extraction results (period 2026-09)
- `ml_clustering_results` - K-Means clustering (3 clusters, silhouette 0.2878)
- `ml_employee_clusters` - Employee cluster assignments
- `attendance_logs`, `tasks`, `task_submissions`, `performance_evaluations`

---

## Troubleshooting

### Port Already in Use

If you see: "Address already in use"

**Solution 1: Find and kill process**
```bash
# Find PID using port 8000
netstat -ano | findstr :8000

# Kill the process (replace <PID>)
taskkill /F /PID <PID>
```

**Solution 2: Use different port**
Edit `api_bridge_server.py`, change line:
```python
PORT = 8000  # → PORT = 8080
```
Then update frontend API URL if needed.

### Database Not Found

If you see: "unable to open database file"

**Solution:** Ensure you're running from correct directory:
```bash
cd C:\Users\Microsoft\Documents\Ngoding\KP\backend
python api_bridge_server.py
```

### Browser Still Shows Errors

**Solutions:**
1. Clear browser cache: **Ctrl + Shift + Delete**
2. Close all Chrome windows completely
3. Reopen Chrome and visit `http://localhost:3000`
4. Check DevTools Console for specific error messages

---

## Why This Solution?

| Aspect | Laravel Backend | Python API Bridge |
|--------|----------------|-------------------|
| PHP Version Required | 8.2+ ✅ | None (Python 3.12+) |
| Setup Complexity | High (Docker/Podman) | Low (direct script) |
| Dependencies | Many | Minimal (sqlite3, http.server) |
| Development Speed | Slow startup | Instant start |
| Performance | Good | Excellent for dev |
| Production Ready | Yes | No (development only) |

**Verdict:** Perfect for development/testing, not for production.

---

## Next Steps for Production

When ready for production environment:

1. **Upgrade PHP to 8.2+:**
   ```bash
   # Download PHP 8.2+ from: https://windows.php.net/download/
   # Install and ensure in PATH
   php --version  # Should show 8.2.x or higher
   ```

2. **Use Docker/Podman:**
   ```bash
   cd ..
   docker-compose up -d backend
   # or
   podman-compose up -d backend
   ```

3. **Configure CORS properly:**
   Update `backend/config/cors.php` with production domains

4. **Set up PostgreSQL:**
   Replace SQLite connections with PostgreSQL via `docker-compose.yml`

---

## Maintenance

### To Keep Server Running:
- Close browser tabs that might trigger network requests
- Avoid closing the terminal/cmd window running the server

### To Restart After Updates:
Simply run the batch file again or restart the Python script.

### Logs & Monitoring:
Server logs appear in the terminal where started:
```
[HH:MM:SS] GET /api/v1/employees HTTP/1.1
[HH:MM:SS] POST /api/v1/ml/run-clustering HTTP/1.1
```

---

## Success Indicators

After starting server and refreshing frontend:

✅ Dashboard shows "Total Karyawan: 26"  
✅ User Management lists all employees  
✅ ML Clustering page shows real results  
✅ No more CORS errors in DevTools  
✅ Network tab shows successful requests (green, 200 status)  

---

## Contact/Support

If issues persist:
1. Check this document first
2. Run diagnostic: `python backend/check-backend-status.py`
3. Share error message from DevTools Console

---

**Status:** ✅ READY TO USE  
**Last Updated:** 2026-09-22  
**Version:** 1.0 (SQLite Bridge Mode)
