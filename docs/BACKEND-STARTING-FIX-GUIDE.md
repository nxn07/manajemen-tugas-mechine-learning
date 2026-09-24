# 🔧 Emergency Fix: Backend Stuck in "Starting" Status

## ❌ Problem

```
CONTAINER ID    IMAGE                   COMMAND              STATUS
df4d1db9b809    localhost/kp_backend   /bin/sh -c php ar...  Up About an hour (starting)
```

**Issue:** Backend container stuck in "starting" status forever

---

## 🎯 Root Causes

### Cause #1: Database Connection Failed
```
SQLSTATE[08006] [7] connection refused
Connection to PostgreSQL timed out
```

**Fix:**
```bash
# Check PostgreSQL is running
podman ps | grep postgres

# Verify database accessible
podman exec simkap_postgres psql -U postgres -d sim_kinerja -c "SELECT 1;"
```

---

### Cause #2: PHP-FPM Configuration Error
```
PHP message: configuration file path error
Failed to start FPM process
Memory limit exceeded
```

**Fix:**
```bash
# Check PHP config
podman logs simkap_backend --tail 50 | grep -i php

# Apply optimized config
cp backend/config/php-fpm.d/optimize.ini /tmp/
podman-compose restart backend
```

---

### Cause #3: Laravel Bootstrap Failure
```
Target [Illuminate\Contracts\Console\Kernel] is not instantiable
Container instantiation failed
Missing .env file
```

**Fix:**
```bash
# Verify .env exists
cat backend/.env | head -10

# Clear caches
podman exec simkap_backend php artisan config:clear
podman exec simkap_backend php artisan route:clear

# Rebuild with clean cache
podman-compose build --no-cache backend
```

---

### Cause #4: Port Conflict
```
Address already in use: Port 8000
Binding to port failed
```

**Fix:**
```bash
# Check what's using port 8000
lsof -i :8000

# Change to different port temporarily
sed -i 's/8000/8001/' docker-compose.yml
podman-compose up -d
```

---

### Cause #5: Missing Dependencies
```
Class 'App\Models\User' not found
Vendor packages missing
Composer install failed
```

**Fix:**
```bash
# Install dependencies inside container
podman exec -it simkap_backend composer install --no-dev --optimize-autoloader

# Or rebuild image
podman-compose build --no-cache backend
```

---

## 🚀 IMMEDIATE FIX COMMAND

Run this one command for automatic fix:

```bash
cd /mnt/c/Users/Microsoft/Documents/Ngoding/KP
./EMERGENCY-BACKEND-FIX.sh
```

**What it does:**
1. ✅ Stops problematic container
2. ✅ Checks logs for errors
3. ✅ Rebuilds Dockerfile if needed
4. ✅ Starts fresh with health monitoring
5. ✅ Verifies all services working
6. ✅ Shows verification results

**Time: ~2-5 minutes**

---

## 🔍 Manual Troubleshooting Steps

### Step 1: Check Logs
```bash
podman logs simkap_backend --tail 100

# Look for specific errors:
grep -i "error" log/output
grep -i "exception" log/output
grep -i "timeout" log/output
```

### Step 2: Test Database Access
```bash
# Inside container
podman exec -it simkap_backend bash

# Test DB connection
php artisan db:connection --force

# Exit container
exit
```

### Step 3: Check Ports
```bash
# Check if port 8000 available
netstat -tlnp | grep :8000

# If occupied, kill process or change port
sudo kill -9 <PID>
```

### Step 4: Verify Health Endpoint
```bash
curl http://localhost:8000/api/v1/health

# Should return: {"status":"ok"}
# If 503: Backend still starting
# If 404: Route not configured
```

---

## 📊 Common Error Messages & Fixes

| Error Message | Likely Cause | Quick Fix |
|--------------|--------------|-----------|
| `connection refused` | Database down | Start PostgreSQL container |
| `port already in use` | Port conflict | Change port or kill process |
| `memory limit` | Resource exhausted | Increase RAM allocation |
| `configuration error` | Bad php.ini | Use optimize.ini |
| `vendor missing` | Composer issues | Run composer install |
| `route not found` | Cache issue | Clear route cache |

---

## ⏱️ Expected Startup Times

| Scenario | Normal Time | Timeout Threshold |
|----------|-------------|-------------------|
| Fresh build | 2-5 minutes | >10 min = abnormal |
| Cached build | 30-60 seconds | >2 min = warning |
| Restart only | 10-20 seconds | >1 min = unhealthy |
| With migrations | 1-3 minutes | >5 min = slow DB |

**Your situation:** 1 hour → DEFINITELY PROBLEM!

---

## 💡 Prevention Tips

### 1. Monitor Container Health
```bash
# Add to crontab
*/5 * * * * podman ps --format "{{.Names}} | {{.Status}}" >> /var/log/container_health.log
```

### 2. Set Health Check Timeout
```yaml
# In docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s  # Give more time on startup
```

### 3. Configure Timeouts Properly
```ini
; In php.ini
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
```

---

## 🆘 Emergency Rollback

If nothing works:

```bash
# Stop everything
podman-compose down -v

# Clean system
podman system prune -a --volumes

# Start fresh
podman-compose up -d

# Wait for health
sleep 60
podman ps | grep backend
```

---

## ✅ Success Criteria

Backend is considered healthy when:

- ✅ Status shows "Up (healthy)" instead of "starting"
- ✅ Health endpoint returns 200 OK
- ✅ Can run `php artisan migrate --force`
- ✅ API endpoints respond (<1s response time)
- ✅ No critical errors in logs after 5 minutes

---

## 📞 Still Having Issues?

Collect diagnostics:

```bash
# 1. Container info
podman inspect simkap_backend

# 2. Recent logs
podman logs simkap_backend --tail 200

# 3. Process list inside
podman exec simkap_backend ps aux

# 4. Network connections
podman exec simkap_backend netstat -tlnp

# 5. Memory usage
podman stats simkap_backend --no-stream
```

Share these with support team for faster resolution.

---

**Bottom line:** The container has been stuck for 1 hour which is way beyond normal startup time. Running `./EMERGENCY-BACKEND-FIX.sh` should resolve this immediately! 🚀
