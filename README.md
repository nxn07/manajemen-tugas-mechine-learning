# 🚀 SIM-KAP — Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 11" />
  <img src="https://img.shields.io/badge/Next.js-14.x-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Status-Completed-success?style=for-the-badge" alt="Status" />
</p>

---

## 📖 Tentang Aplikasi

**SIM-KAP** (Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan) adalah platform enterprise berbasis web yang dikembangkan untuk **PT Central Saga Mandala** guna mengotomatisasi siklus kerja penugasan (*task assignment*), pelaporan progres, verifikasi hasil, hingga evaluasi performa periodik berbasis **Key Performance Indicator (KPI)** secara transparan dan akuntabel.

Sistem ini mengadopsi arsitektur terpisah (*Decoupled RESTful Architecture*) menggunakan **Laravel 11** sebagai Backend API Engine dan **Next.js 14 (App Router & Tailwind CSS)** sebagai Frontend Client, didukung oleh kontrol akses berbasis peran (**Role-Based Access Control / Spatie RBAC**).

---

## 🌟 Fitur Utama Sistem

| Modul | Deskripsi Fitur |
|---|---|
| 🔐 **Autentikasi & RBAC Multi-Role** | Login aman berbasis token **Laravel Sanctum** dengan 3 hierarki role Spatie: `admin`, `manager`, dan `pegawai`. |
| 👥 **Master Data Organisasi** | Manajemen master data akun pengguna, profil karyawan, departemen/divisi kerja, dan konfigurasi bobot KPI. |
| 📋 **Task Management & Kanban** | Pembuatan instruksi tugas dengan tingkat prioritas, bobot poin, tenggat waktu (*deadline*), dan visualisasi papan Kanban interaktif. |
| 📤 **Bukti Penugasan & Late Penalty** | Pengunggahan berkas bukti kerja dengan deteksi otomatis keterlambatan (*late submission flag*) dan penalti skor 10%. |
| 🔍 **Review & Evaluasi Atasan** | Verifikasi hasil kerja bawahan oleh Manajer/Kadiv dengan opsi *Approve* (status `COMPLETED`) atau *Reject / Need Revision*. |
| 📊 **Formula Evaluasi Kinerja Baku** | Perhitungan performa otomatis menggabungkan **60% Poin Tugas Terverifikasi + 40% Skor Kriteria KPI** serta pemetaan predikat Grade (A s/d E). |
| 📈 **Scorecard & Export PDF** | Dashboard analitik grafik performa radar chart dan ekspor cetak dokumen laporan resmi berformat PDF via DomPDF. |
| 🛡️ **Audit Activity Log** | Pencatatan rekam jejak aktivitas kritis pengguna secara persistif untuk audit keamanan. |

---

## 📐 Formula Penilaian Kinerja

Sistem menggunakan formula pembobotan baku sesuai standar operasional PT Central Saga Mandala:

$$\text{Nilai Akhir} = (60\% \times \text{Rata-rata Skor Tugas}) + (40\% \times \text{Skor Bobot KPI})$$

### Skala Predikat Nilai (Grade):
* **Grade A (Sangat Baik)**: $85.00 - 100.00$
* **Grade B (Baik)**: $75.00 - 84.99$
* **Grade C (Cukup)**: $60.00 - 74.99$
* **Grade D (Kurang)**: $50.00 - 59.99$
* **Grade E (Sangat Kurang)**: $< 50.00$

---

## 📊 Dokumentasi UML & Pemodelan Sistem

Seluruh diagram UML dan model data tersedia lengkap pada file [`Pedro-KP-EvaluasiKinerja-12UC.drawio`](./Pedro-KP-EvaluasiKinerja-12UC.drawio) (**43 Halaman / Tab Diagram**) serta didokumentasikan pada [`DOKUMENTASI_UML_LAPORAN_KP.md`](./DOKUMENTASI_UML_LAPORAN_KP.md):

1. **Use Case Diagram** (12 Use Cases & 3 Aktor)
2. **12 Activity Diagrams** (UC-01 s/d UC-12)
3. **12 Sequence Diagrams** (UC-01 s/d UC-12)
4. **Class Diagram** (8 Entitas Model Eloquent & Relasinya)
5. **Component Diagram** (Arsitektur 3-Tier: Frontend, API Service, Storage)
6. **Deployment Diagram** (Topologi Kontainer Docker / Podman)
7. **State Machine Diagram** (Siklus Tugas & Evaluasi)
8. **Package Diagram** (Layered Architecture)
9. **ERD / Entity Relationship Diagram** (11 Tabel Fisik PostgreSQL)
10. **12 Lembar Expanded Use Case Specification** (Format Narasi Skenario Akademik)

---

## 🛠️ Tech Stack

### Frontend:
* **Next.js 14** (App Router, Server & Client Components)
* **TypeScript**
* **Tailwind CSS** & Lucide React Icons
* **Axios** & React Hook Form

### Backend:
* **PHP 8.2 / 8.4** & **Laravel 11.x**
* **Laravel Sanctum** (Stateful API Authentication)
* **Spatie Laravel-Permission** (Role & Permission RBAC)
* **Barryvdh Laravel-DomPDF** (Cetak Laporan PDF)
* **Spatie Laravel-Activitylog** (Audit Log)

### Database & Infrastruktur:
* **PostgreSQL 16**
* **Docker** & **Docker Compose**
* **Nginx** Reverse Proxy

---

## ⚙️ Panduan Instalasi & Menjalankan Aplikasi

### 1. Clone Repositori
```bash
git clone https://github.com/Central-Saga/Pedro-KP-EvaluasiKinerja.git
cd Pedro-KP-EvaluasiKinerja
```

### 2. Menjalankan via Docker Compose (Rekomendasi)
```bash
docker compose up -d --build
```
Aplikasi akan aktif di:
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:8000`
* **PostgreSQL:** `localhost:5432`

---

### 3. Menjalankan Manual (Lokal)

#### A. Backend (Laravel 11)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

#### B. Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Akun Demo Pengujian (Seeder Default)

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Administrator / HRD** | `admin@centralsaga.com` | `password` | Akses penuh CRUD User, Divisi, Bobot KPI, & Audit Log |
| **Manager (Kadiv)** | `manager@centralsaga.com` | `password` | Pembuatan tugas, verifikasi review hasil, input nilai KPI |
| **Pegawai (Employee)** | `pegawai@centralsaga.com` | `password` | Penerimaan tugas, submit bukti kerja, lihat scorecard |

---

## 📁 Struktur Repositori

```text
├── backend/                  # RESTful API Laravel 11
│   ├── app/                  # Controllers, Models, Services, Policies
│   ├── database/             # Migrations & Seeders
│   └── routes/api.php        # Endpoint Routing API
├── frontend/                 # Client Web App Next.js 14
│   ├── src/app/              # Next.js App Router Pages
│   └── src/components/       # UI Components & Kanban Board
├── Pedro-KP-EvaluasiKinerja-12UC.drawio # File Master 43 Tab UML Draw.io
├── DOKUMENTASI_UML_LAPORAN_KP.md       # Dokumentasi Lengkap untuk Laporan KP
├── PRD_SIM_KAP.md            # Product Requirements Document
├── SPATIE_RBAC_MATRIX.md     # Matriks Role & Permissions
├── docker-compose.yml        # Konfigurasi Orkestrasi Docker
└── README.md                 # Dokumentasi Utama Repositori
```

---

## 👤 Pengembang (Author)
* **Nama Mahasiswa:** Pedrof Da Kristof
* **Program:** Kerja Praktik (KP) — Sistem Informasi
* **Mitra Instansi:** PT Central Saga Mandala
