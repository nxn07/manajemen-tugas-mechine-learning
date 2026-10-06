# AGENTS.md — Aturan kerja agent di repo ini (TA / manajemen-tugas-mechine-learning)

## Ringkas proyek
Repo tugas akhir: **Sistem Informasi Manajemen Kinerja & Penugasan Karyawan (K-Means)**.
Stack: Laravel (backend) + Next.js (frontend) + PostgreSQL + Podman.

## 🌿 Aturan branch (WAJIB)
- **JANGAN langsung commit/push ke `main` atau `dev`.**
- Selalu kerjakan di branch kerja:
  `agent/<topik-singkat>` (contoh: `agent/fix-auth-cors`).
- Setelah selesai: `git push -u origin <branch>` lalu laporkan ke user untuk direview.
- Pesan commit: gaya Conventional Commits (`fix:`, `feat:`, `docs:`, `chore:`).

## ✅ Standar sebelum push
1. `php artisan test` (Pest) lulus — kalau backend berubah.
2. `npm run lint` / `tsc` bersih — kalau frontend berubah.
3. Jangan commit: `.env`, `vendor/`, `node_modules/`, `storage/`, berkas >5 MB.

## 📁 Struktur penting
- `backend/`  — Laravel 11 API
- `frontend/` — Next.js 14
- `docs/`     — dokumentasi
- Container: `podman-compose.yml`

## 🚫 Yang tidak boleh
- Mengubah sejarah git (`push --force`, `rebase` branch bersama).
- Menghapus file tanpa memberi tahu user.
- Menyentuh kredensial/rahasia.
