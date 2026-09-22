# 🛠️ ML Clustering Troubleshooting Guide

## Problem: "Network Error" saat Ekstrak Fitur

### ❓ Symptom
- Error toast muncul: **"Error saat mengekstrak fitur: Network Error"**
- Total Karyawan: **0**
- Kualitas Model: **N/A (Menunggu hasil)**
- Status Periode: **Belum ada**

---

## ✅ Solution 1: Jalankan Backend Laravel

Laravel backend harus berjalan di `http://localhost:8000` agar frontend bisa akses API.

### Langkah-langkah:

```bash
# 1. Pergi ke folder backend
cd backend

# 2. Jalankan Laravel development server
php artisan serve

# Server akan jalan di http://localhost:8000
```

### Verifikasi:
Buka browser dan akses:
```
http://localhost:8000/api/v1/users?page=1&per_page=1
```

✅ Jika berhasil: Muncul JSON response dengan data users  
❌ Jika gagal: "Cannot GET /" atau connection refused → backend belum jalan

---

## ✅ Solution 2: Cek CORS Configuration

Jika masih error setelah backend jalan, pastikan CORS sudah dikonfigurasi:

### File yang sudah diperbaiki:
1. ✅ `backend/config/cors.php` - Konfigurasi allowed origins
2. ✅ `backend/bootstrap/app.php` - CORS middleware ditambahkan

### Test manual:
```bash
# Dari frontend (Next.js)
# Coba access API langsung
curl http://localhost:8000/api/v1/ml/extract-features \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"period": "2024-09"}'
```

---

## ✅ Solution 3: Restart Semua Service

Jika menggunakan Docker/Podman:

```bash
# Restart semua containers
docker-compose restart
# atau
podman-compose restart

# Check status
docker-compose ps
# atau
podman-compose ps
```

---

## 🧪 Diagnostic Tool

Buka halaman diagnostic khusus:
```
http://localhost:3000/ml-clustering/_diagnostics
```

Halaman ini akan:
- ✅ Test koneksi ke backend API
- ✅ Cek format response
- ✅ Berikan instruksi jika ada masalah

---

## 📊 Common Error Patterns

### Error 1: "Network Error"
**Cause**: Backend tidak running atau salah port  
**Fix**: Jalankan `php artisan serve`

### Error 2: "Cannot GET /api/v1/users"
**Cause**: Route `/users` belum terdaftar  
**Fix**: Pastikan `routes/api.php` sudah include routes untuk users

### Error 3: CORS Error
**Cause**: Frontend tidak di-allowed mengakses backend  
**Fix**: CORS config sudah diperbaiki di `backend/config/cors.php`

### Error 4: Token expired/invalid
**Cause**: Auth token sudah kadaluarsa  
**Fix**: Login ulang via `/login`

---

## 🔍 Browser Console Debugging

Tekan `F12` untuk buka Developer Tools → Tab "Console"

### Lihat log output:
1. **Fetch employee count...** - Memulai fetch
2. **API Error:** - Jika ada error, akan muncul detail lengkap
3. **✅ Employee count: X** - Jika berhasil

### Contoh log sukses:
```
🔍 Fetching employee count...
✅ Employee count: 50
```

### Contoh log error:
```
❌ API Error: {
  message: "request to http://localhost:8000/api/v1/users failed, reason: connect ECONNREFUSED 127.0.0.1:8000",
  config: { url: "/api/v1/users", method: "GET" },
  timestamp: "2026-09-22T07:50:00.000Z"
}
⚠️ Backend not accessible at http://localhost:8000
👉 Make sure Laravel backend is running: php artisan serve
```

---

## 🎯 Quick Reference

| Status | Command | Expected Result |
|--------|---------|-----------------|
| Start Laravel | `php artisan serve` | ✓ Runs on localhost:8000 |
| Test API | `http://localhost:8000/api/v1/users` | ✓ Returns JSON |
| Check Routes | `php artisan route:list` | ✓ Shows all endpoints |
| View Logs | `tail -f storage/logs/laravel.log` | ✓ Shows requests/errors |

---

## 📝 Files Modified for This Fix

1. ✅ `frontend/lib/api.ts` - Better error handling and logging
2. ✅ `frontend/app/(dashboard)/ml-clustering/page.tsx` - Improved error messages
3. ✅ `backend/config/cors.php` - Created with allowed origins
4. ✅ `backend/bootstrap/app.php` - Added CORS middleware
5. ✅ `frontend/app/ml-clustering/_diagnostics.tsx` - Diagnostic tool page

---

## 💡 Pro Tips

### Tip 1: Run Both Frontend & Backend Simultaneously
Open 2 terminal windows:
```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Tip 2: Use Environment Variables
Create `.env` files:

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Backend** (`backend/.env`):
```
APP_URL=http://localhost:8000
```

### Tip 3: Clear Cache if Issues Persist
```bash
# Frontend cache
rm -rf .next

# Backend cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 🆘 Still Having Issues?

1. **Check port availability:**
   ```bash
   # Check if port 8000 is in use
   netstat -ano | findstr :8000
   
   # Or change port
   php artisan serve --port=8001
   ```

2. **Verify PHP version:**
   ```bash
   php --version  # Should be 8.1+
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

4. **Review logs:**
   - Laravel: `storage/logs/laravel-*.log`
   - Frontend: Browser console (F12)

---

## ✨ After Fix Works

You should see:
- ✅ Total Karyawan: [actual number] (not 0)
- ✅ Quality Model: Available after clustering
- ✅ No "Network Error" toast
- ✅ Successfully extract features button click
- ✅ Clustering runs smoothly

Happy coding! 🚀
