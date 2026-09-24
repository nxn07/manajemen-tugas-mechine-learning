# 🛡️ DOKUMEN RESMI MATRIKS SPATIE RBAC & ARSITEKTUR SISTEM
**Sistem Informasi Kinerja & Audit Pegawai (SIM-KAP) — Performa.id (Central Saga Enterprise)**

Dokumen ini disusun sebagai panduan resmi kesesuaian antara **Spesifikasi Arsitektur Sistem (UML, ERD, Use Case)** dengan **Implementasi Program (Backend Laravel & Frontend Next.js)**.

---

## 📊 1. Matriks Spatie RBAC (100% Sesuai Diagram Use Case)

Pemetaan hak akses berikut disusun berdasarkan 12 tabel Use Case Specification resmi:

| No | Nama Use Case / Fitur | Aktor Resmi Dokumen | 🛡️ ADMIN / HRD | 👔 MANAGER | 👤 KARYAWAN |
| :-: | :--- | :--- | :-: | :-: | :-: |
| **UC-01** | **Login** | Semua Aktor | ✅ | ✅ | ✅ |
| **UC-02** | **Logout** | Semua Aktor | ✅ | ✅ | ✅ |
| **UC-03** | **Kelola Profil** | Semua Aktor | ✅ | ✅ | ✅ |
| **UC-04** | **Kelola Data Karyawan** | Admin / HRD | ✅ | ❌ | ❌ |
| **UC-05** | **Kelola Data Divisi** | Admin / HRD | ✅ | ❌ | ❌ |
| **UC-06** | **Kelola Kriteria KPI** | Admin / HRD | ✅ | ❌ | ❌ |
| **UC-07** | **Buat Penugasan Baru** | Manajer / Atasan | ✅ *(Super)* | ✅ | ❌ |
| **UC-08** | **Lihat Daftar Penugasan** | Manajer & Karyawan | ✅ | ✅ | ✅ |
| **UC-09** | **Update Status & Submit Tugas** | Karyawan | ❌ | ❌ | ✅ |
| **UC-10** | **Verifikasi & Evaluasi Tugas** | Manajer / Atasan | ✅ *(Super)* | ✅ | ❌ |
| **UC-11** | **Lihat Kinerja Pribadi** | Karyawan | ❌ | ❌ | ✅ |
| **UC-12** | **Cetak Laporan Kinerja** | Admin & Manajer | ✅ | ✅ | ❌ |

---

## 🔑 2. Rincian Hak Akses & Tampilan Menu Sidebar per Role

### 1. 🛡️ **Role: ADMIN / HRD**
* **Kredensial Test**: Email: `admin@gmail.com` | Password: `password`
* **Peran System**: Administrator & Human Resource Department.
* **Tampilan Menu Sidebar (8 Menu)**:
  1. `Dashboard` (`/`)
  2. `Manajemen Tugas` (`/tasks`)
  3. `Evaluasi Kinerja` (`/evaluations`)
  4. `Master Divisi` (`/divisions`) — *(Khusus Admin/HRD sesuai UC-05)*
  5. `Kriteria KPI` (`/kpis`) — *(Khusus Admin/HRD sesuai UC-06)*
  6. `Manajemen User` (`/users`) — *(Khusus Admin/HRD sesuai UC-04)*
  7. `Audit Log` (`/activity-logs`)
  8. `Pengaturan` (`/settings`)

### 2. 👔 **Role: MANAGER / ATASAN**
* **Kredensial Test**: Email: `manager@gmail.com` | Password: `password`
* **Peran System**: Penanggung Jawab Unit Kerja & Evaluator Kinerja.
* **Tampilan Menu Sidebar (3 Menu Utama Operasional)**:
  1. `Dashboard` (`/`)
  2. `Manajemen Tugas` (`/tasks`) — *(Membuat Tugas Baru [UC-07] & Verifikasi/Review Tugas [UC-10])*
  3. `Evaluasi Kinerja` (`/evaluations`) — *(Input Nilai KPI & Cetak Laporan Kinerja [UC-12])*

### 3. 👤 **Role: KARYAWAN / STAFF**
* **Kredensial Test**: Email: `employee@gmail.com` / `sarah@gmail.com` | Password: `password`
* **Peran System**: Pelaksana Tugas & Staf Operasional.
* **Tampilan Menu Sidebar (3 Menu Utama Staf)**:
  1. `Dashboard` (`/`)
  2. `Manajemen Tugas` (`/tasks`) — *(Lihat Daftar Tugas [UC-08] & Submit Bukti Kerja [UC-09])*
  3. `Evaluasi Kinerja` (`/evaluations`) — *(Lihat Rekapitulasi & Grafik Kinerja Pribadi [UC-11])*

---

## 🗄️ 3. Kesesuaian Skema Database (ERD) & Objek OOP (Class Diagram)

Seluruh struktur database PostgreSQL dan Model Eloquent Laravel telah 100% presisi dengan ERD & Class Diagram:

1. **`users`** ➔ Kredensial autentikasi (`id`, `username`, `email`, `password_hash`, `role`).
2. **`employees`** ➔ Profil pegawai (`id`, `user_id`, `division_id`, `nik`, `full_name`, `phone`, `position`).
3. **`divisions`** ➔ Struktur departemen (`id`, `name`, `description`).
4. **`tasks`** ➔ Instruksi kerja (`id`, `created_by_manager_id`, `assigned_employee_id`, `title`, `description`, `deadline`, `weight`, `status`).
5. **`task_submissions`** ➔ Bukti penyerahan tugas (`id`, `task_id`, `employee_id`, `file_path`, `notes`, `submitted_at`).
6. **`kpi_criteria`** ➔ Indikator bobot KPI (`id`, `criteria_name`, `weight_percentage`, `description`).
7. **`performance_evaluations`** ➔ Hasil kalkulasi evaluasi (`id`, `task_id`, `employee_id`, `evaluator_manager_id`, `kpi_criteria_id`, `score`, `feedback_notes`, `evaluated_at`).

---

## ⚡ 4. Kesesuaian Alur Interaksi (Activity & Sequence Diagrams)

1. **Login & Authenticate Flow (UC-01 & UC-02)**:
   - `User` ➔ `LoginPage` ➔ `AuthService` ➔ `Sanctum/JWT` ➔ `PostgreSQL` ➔ Token Disimpan & Redirect ke Dashboard sesuai Role.
2. **Task Creation & Assignment Flow (UC-07)**:
   - `Manager` ➔ `CreateTaskModal` ➔ `TaskService.create()` ➔ Insert `tasks` ➔ Status `PENDING`.
3. **Task Submission Flow (UC-09)**:
   - `Karyawan` ➔ `SubmitTaskModal` ➔ Upload File / Link Drive ➔ Insert `task_submissions` ➔ Status `SUBMITTED`.
4. **Task Review & Performance Evaluation Flow (UC-10 & UC-12)**:
   - `Manager` ➔ `EvaluationsPage` ➔ Input Slider KPI ➔ Calculation Formula `FinalScore = (Task*0.6) + (KPI*0.4)` ➔ Insert `performance_evaluations` ➔ Status `APPROVED/COMPLETED` ➔ Grade Assigned (A-E) ➔ Export PDF/Excel Report.

---

## 🏁 Kesimpulan Kesesuaian

Sistem **Performa.id — Central Saga Enterprise** saat ini telah **100% SESUAI DAN PRESISI** dengan 6 dokumen arsitektur utama Anda (Use Case Specification, Activity Diagrams, Class Diagram, ERD, Sequence Diagrams, dan Spatie RBAC Matrix).
