# 🚀 Quick Start Guide - Run Everything with Podman Compose

## ✅ Prerequisites

- **Podman** installed (version 4.0+)
- **Podman Compose** installed (v1.2.0+)
- At least **4GB RAM** available
- ~5GB disk space

---

## 🎯 One-Command Start

```bash
# From project root directory
podman-compose up -d
```

**What happens:**
- PostgreSQL database starts
- Redis cache & queue starts
- Laravel backend API server starts on port 8000
- Next.js frontend starts on port 3000
- ML Python service ready for clustering

---

## 📋 Common Commands

### Start All Services
```bash
podman-compose up -d
```

### View Logs (All Services)
```bash
podman-compose logs -f
```

### View Specific Service Logs
```bash
# Backend logs
podman-compose logs -f backend

# Frontend logs  
podman-compose logs -f frontend

# ML service logs
podman-compose logs -f ml-python
```

### Stop All Services
```bash
podman-compose down
```

### Restart Specific Service
```bash
podman-compose restart backend
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
podman-compose up --force-recreate backend

# Rebuild everything
podman-compose build --no-cache
```

### Enter Container Shell
```bash
# Laravel backend shell
podman exec -it simkap_backend bash

# Frontend shell
podman exec -it simkap_frontend sh

# ML Python shell
podman exec -it simkap_ml_python /app/backend/python/venv/bin/python
```

---

## 🔍 Health Check

After starting, verify all services are healthy:

```bash
# Check service status
podman-compose ps
```

Expected output:
```
NAME                    STATUS
simkap_postgres        Up (healthy)
simkap_redis           Up (healthy)
simkap_backend         Up (healthy)
simkap_queue_worker    Up
simkap_frontend        Up (healthy)
simkap_ml_python       Up (healthy)
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application UI |
| Backend API | http://localhost:8000/api/v1 | Laravel API endpoints |
| Backend API Docs | http://localhost:8000/api/v1/users | Test API endpoint |
| ML Clustering | http://localhost:3000/ml-clustering | K-Means clustering page |

---

## 🗄️ Database Setup

If you need to initialize the database:

```bash
# Enter backend container
podman exec -it simkap_backend bash

# Inside container, run migrations
php artisan migrate --force

# Seed initial data (optional)
php artisan db:seed

# Exit container
exit
```

---

## ⚙️ Configuration

### Environment Variables

Services use these env vars (already in compose file):

- `POSTGRES_DB`: sim_kinerja
- `APP_URL`: http://localhost:8000
- `NEXT_PUBLIC_API_URL`: http://localhost:8000/api/v1
- `REDIS_HOST`: redis
- `DB_CONNECTION`: pgsql

### Custom Ports

To change ports, edit `ports:` in `podman-compose.yml`:

```yaml
# Example: Change backend from 8000 to 8080
ports:
  - "0.0.0.0:8080:8000"
```

Then access at: http://localhost:8080

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process or change port in compose file
podman-compose down
# Edit podman-compose.yml to change port
podman-compose up -d
```

### Issue: Build Fails

```bash
# Clean build cache
podman-compose down -v  # Remove volumes
podman system prune     # Clean unused images
podman-compose build --no-cache
podman-compose up -d
```

### Issue: Cannot Connect to Backend

1. **Check if backend is running:**
   ```bash
   podman-compose ps
   ```

2. **Check backend logs:**
   ```bash
   podman-compose logs backend
   ```

3. **Test manually:**
   ```bash
   # In backend container
   php artisan serve
   # Should show "Development server running at http://localhost:8000"
   ```

4. **Restart backend:**
   ```bash
   podman-compose restart backend
   ```

### Issue: ML Clustering Not Working

1. **Verify ML service is running:**
   ```bash
   podman-compose ps ml-python
   ```

2. **Check ML logs:**
   ```bash
   podman-compose logs -f ml-python
   ```
   Look for: `"=== ML Python Service Ready ==="`

3. **Test ML script manually:**
   ```bash
   podman exec -it simkap_ml_python bash
   
   cd /app/backend/python
   ./venv/bin/python ml_processor.py --help
   ```

---

## 📊 Monitoring

### Resource Usage
```bash
# CPU & Memory per container
podman stats

# Specific container
podman stats simkap_backend
```

### Disk Space
```bash
# Volume sizes
podman volume ls
podman inspect simkap_postgres_data
```

---

## 🔄 Development Workflow

### After Making Code Changes

#### Backend Changes:
```bash
# No rebuild needed - volumes auto-sync
# Just restart PHP-FPM for changes to apply
podman-compose restart backend
```

#### Frontend Changes:
```bash
# Hot reload automatic with WATCHPACK_POLLING
# But sometimes need browser Ctrl+R refresh
# Or restart frontend dev server
podman-compose restart frontend
```

#### New Dependencies:
```bash
# Backend: composer add package && rebuild
composer require vendor/package
podman-compose build backend

# Frontend: npm install package && rebuild
cd frontend
npm install package
cd ..
podman-compose build frontend
```

---

## 💾 Data Persistence

Volumes used:
- `postgres_data` - PostgreSQL database files
- `redis_data` - Redis persistent data
- `ml_python_venv` - Python virtual environment & ML packages

To backup data:
```bash
# Backup database
podman exec simkap_postgres pg_dump -U postgres sim_kinerja > backup.sql

# Backup volumes
podman run --rm -v simkap_postgres_data:/data -v $(pwd):backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## 🎯 Testing ML Clustering

Once everything is running:

1. **Navigate to:** http://localhost:3000/ml-clustering

2. **Verify connectivity:**
   - Total Karyawan should show actual count (not 0)
   - Click "Ekstrak Fitur" button
   - Should see success toast message

3. **Run clustering:**
   - Set period (e.g., 2024-09)
   - Select cluster count (2-5)
   - Click "Jalankan Clustering"
   - Watch progress and results

4. **Expected timing:**
   - Feature extraction: ~1-3 seconds per 50 employees
   - K-Means clustering: ~2-5 seconds for 100 employees
   - Total pipeline: <10 seconds for typical datasets

---

## 🆘 Emergency Reset

If things get really broken:

```bash
# 1. Stop everything
podman-compose down -v  # Removes volumes too!

# 2. Clean up
podman system prune -a --volumes

# 3. Fresh start
podman-compose up -d

# 4. Initialize database
podman exec -it simkap_backend bash -c "
  php artisan migrate --force &&
  php artisan db:seed &&
  echo 'Database initialized!'
"
```

---

## 📚 Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [Podman Compose Documentation](https://github.com/containers/podman-compose)
- [Laravel Docker Best Practices](https://laravel.com/docs/10.x/deployment)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)

---

## ✨ Tips

### Tip 1: Use Named Pipes (Linux/WSL)
For better file sync performance:
```yaml
volumes:
  - ./backend:/var/www:cached  # Instead of default bind mount
```

### Tip 2: Enable Health Checks in Background
Don't wait for containers to be fully ready before accessing app.
Add small delay or use healthcheck conditions.

### Tip 3: Monitor ML Process Duration
```bash
# Tail ML logs in real-time
podman logs -f simkap_ml_python
```

### Tip 4: Development Mode with Hot Reload
The setup already includes:
- `WATCHPACK_POLLING: "true"` - Auto-refresh on file changes
- `CHOKIDAR_USEPOLLING: "true"` - File watching enhancement

Just edit files and hit Ctrl+R in browser!

---

## 🎉 Success Checklist

After running `podman-compose up -d`, verify:

- ✅ PostgreSQL: Up and healthy
- ✅ Redis: Running
- ✅ Backend: Responding on port 8000
- ✅ Frontend: Loading on port 3000
- ✅ ML Python: Initialized with scikit-learn
- ✅ Can access http://localhost:3000
- ✅ API returns JSON at http://localhost:8000/api/v1/users
- ✅ ML Clustering page loads without errors
- ✅ Feature extraction works
- ✅ K-Means clustering produces results

**If all ✅ then YOU'RE DONE!** 🚀

---

## 📞 Support

If you encounter issues:

1. Check logs: `podman-compose logs -f`
2. Test individual services manually
3. Review error messages carefully
4. Try emergency reset section above
5. Check this document's troubleshooting section

Good luck! 🍀
