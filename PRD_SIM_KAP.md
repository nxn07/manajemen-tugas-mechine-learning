# 📘 Product Requirement Document (PRD) & UI/UX Design System
# SIM-KAP — Sistem Informasi Kinerja Pegawai

> **Versi:** 3.0 (Figma Design & Production Ready)  
> **Target Platform:** Web Desktop (Responsive: 1440px Base, 1024px Tablet, 375px Mobile)  
> **Design Tooling:** Figma (Auto Layout 5.0, Component Variants, Design Tokens)  
> **Live Web Implementation:** [https://frontend-eight-jade-66.vercel.app](https://frontend-eight-jade-66.vercel.app)  
> **Status:** Active Reference for UI/UX Designer & Frontend Engineers  

---

## 1. Executive Summary & Product Vision

### 1.1 Deskripsi Produk
**SIM-KAP (Sistem Informasi Kinerja Pegawai)** adalah platform enterprise berbasis web modern yang dirancang untuk PT Central Saga Mandala guna mendigitalkan seluruh siklus evaluasi kinerja karyawan. Sistem ini mengintegrasikan penugasan kerja harian/mingguan, pengumpulan dan verifikasi bukti tugas secara real-time, monitoring kriteria *Key Performance Indicator* (KPI), perhitungan akumulasi skor otomatis berbasis formula pembobotan presisi, hingga penerbitan kartu skor (*scorecard*) dan laporan berkas resmi berformat PDF.

### 1.2 User Personas & Core Problems Solved
1. **Administrator (Superuser/HR Admin):**
   * *Pain Point:* Kesulitan mengelola akun pengguna secara terpusat, memetakan divisi, dan memastikan total bobot persentase KPI pas 100%.
   * *Solusi Figma:* Panel manajemen master data pengguna, divisi, dan KPI dengan indikator visual progress bar akumulasi bobot 100%.
2. **Manager (Kepala Divisi / Evaluator):**
   * *Pain Point:* Penugasan tercecer di chat/email, tidak ada pelacakan bukti kerja yang transparan, dan perhitungan nilai akhir manual yang rentan bias.
   * *Solusi Figma:* Dashboard penugasan interaktif, modal review bukti kerja (Approve/Revisi), dan form kalkulasi penilaian bulanan otomatis (60% Tugas + 40% KPI).
3. **Employee (Pegawai / Anggota Tim):**
   * *Pain Point:* Ketidakjelasan tenggat waktu penugasan, proses pengumpulan bukti kerja yang rumit, serta ketidaktahuan atas skor dan grade kinerja yang didapatkan.
   * *Solusi Figma:* Kartu tugas visual dengan countdown deadline, drag-and-drop file uploader, dan halaman personal scorecard dengan visualisasi grade (A-E) transparan.

---

## 2. Design System Foundations & Figma Tokens

Untuk memastikan konsistensi visual di Figma, gunakan acuan token dan sistem desain berikut:

### 2.1 Color Palette & Semantic Tokens

```text
[ BRAND & PRIMARY ]
  Primary 50  : #EFF6FF (Background tint)
  Primary 100 : #DBEAFE (Badge & chip background)
  Primary 500 : #3B82F6 (Interactive elements)
  Primary 600 : #2563EB (Primary CTA Button / Main Brand)
  Primary 700 : #1D4ED8 (Button Hover State)
  Primary 900 : #1E3A8A (High-contrast brand accents)

[ NEUTRAL SURFACES & TEXT ]
  White       : #FFFFFF (Card surface in Light Mode)
  Slate 50    : #F8FAFC (Global app background)
  Slate 100   : #F1F5F9 (Input fill & subtle dividers)
  Slate 200   : #E2E8F0 (Border & divider lines)
  Slate 400   : #94A3B8 (Placeholder text & icons)
  Slate 500   : #64748B (Secondary / helper text)
  Slate 700   : #334155 (Subheading & body text)
  Slate 900   : #0F172A (Headings & primary dark text)
  Dark Surface: #1E293B (Navbar & Sidebar card in Dark Mode)
  Dark Canvas : #0F172A (Canvas background in Dark Mode)

[ STATUS & STATE PALETTE ]
  Success 500 : #10B981 (Approved / Completed / Grade A)
  Success 100 : #D1FAE5 (Success Badge Background)
  Warning 500 : #F59E0B (In Progress / Pending / Grade C)
  Warning 100 : #FEF3C7 (Warning Badge Background)
  Danger 500  : #EF4444 (Overdue / Rejected / Grade E)
  Danger 100  : #FEE2E2 (Danger Badge Background)
  Info 500    : #0EA5E9 (Submitted / Review Queue)
  Info 100    : #E0F2FE (Info Badge Background)

[ EVALUATION GRADE BADGES ]
  Grade A     : #059669 (Emerald Green - Sangat Memuaskan >= 85)
  Grade B     : #2563EB (Royal Blue - Baik 75 - 84.99)
  Grade C     : #D97706 (Amber Orange - Cukup 65 - 74.99)
  Grade D     : #EA580C (Burnt Orange - Kurang 50 - 64.99)
  Grade E     : #DC2626 (Crimson Red - Sangat Kurang < 50)
```

### 2.2 Typography Scale (Desktop Base: 1440px)
* **Font Family:** `Plus Jakarta Sans` atau `Inter` (Font Web Sans-Serif Modern).
* **Code / Numbers Font:** `Consolas` atau `JetBrains Mono` (untuk NIK, Kode Tugas, Skor).

| Token Figma | Size | Line Height | Weight | Rekomendasi Penggunaan |
| --- | --- | --- | --- | --- |
| **Display 1** | 32px | 40px (125%) | 700 (Bold) | Hero banner, total score scorecard |
| **Heading 1** | 24px | 32px (133%) | 700 (Bold) | Judul utama halaman dashboard |
| **Heading 2** | 20px | 28px (140%) | 600 (SemiBold) | Judul kartu widget, section modal |
| **Heading 3** | 16px | 24px (150%) | 600 (SemiBold) | Header tabel, sub-section, judul tugas |
| **Body Regular** | 14px | 20px (143%) | 400 (Regular) | Teks isi konten, deskripsi tugas, paragraf |
| **Body Medium** | 14px | 20px (143%) | 500 (Medium) | Label form input, navigasi menu aktif |
| **Body Bold** | 14px | 20px (143%) | 700 (Bold) | Button CTA, skor numerik, nama pegawai |
| **Caption** | 12px | 16px (133%) | 500 (Medium) | Timestamp, helper text form, badge status |
| **Monospace Data**| 13px | 18px (138%) | 600 (SemiBold) | NIK, kode divisi, persentase bobot |

### 2.3 Spacing, Radius & Elevation System
* **Grid Base:** 8-Point Grid System (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Border Radius:**
  * `rounded-sm` (4px): Checkbox, tag kecil.
  * `rounded-md` (8px): Input text, dropdown field, button standard.
  * `rounded-lg` (12px): Kartu widget, modal dialog, popover.
  * `rounded-xl` (16px): Main dashboard card container.
  * `rounded-full` (9999px): Avatar, status pill badges.
* **Elevation / Drop Shadows:**
  * `Shadow Soft (Card)`: `0px 1px 3px rgba(15, 23, 42, 0.08), 0px 1px 2px rgba(15, 23, 42, 0.04)`.
  * `Shadow Medium (Modal)`: `0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)`.
  * `Shadow Hover (Interactive)`: `0px 20px 25px -5px rgba(15, 23, 42, 0.12), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)`.

---

## 3. Information Architecture & Sitemap

```text
[ SIM-KAP Application Structure ]
│
├── 01. Authentication Flow
│   └── Screen 01: Login Page (/login)
│
├── 02. Dashboard Layout Shell
│   ├── Left Sidebar Navigation (Expanded 260px / Collapsed 80px)
│   ├── Top Header Navbar (Breadcrumbs, Search, Notification, Profile Dropdown)
│   │
│   ├── 03. Modul Tugas (Task Management)
│   │   ├── Screen 02: Task Board & List View (/tasks)
│   │   ├── Modal 02A: Buat / Edit Tugas (Admin & Manager)
│   │   ├── Modal 02B: Submit Bukti Pengerjaan (Employee)
│   │   └── Modal 02C: Review & Approval Tugas (Manager)
│   │
│   ├── 04. Modul Evaluasi Kinerja (Scorecard)
│   │   ├── Screen 03: Performance Scorecard Dashboard (/evaluations)
│   │   ├── Modal 03A: Detail Scorecard & Break-Down Nilai
│   │   └── Modal 03B: Form Input Penilaian Evaluasi (Manager)
│   │
│   ├── 05. Modul Master Data KPI
│   │   ├── Screen 04: KPI Criteria Management (/kpis)
│   │   └── Modal 04A: Tambah / Edit Kriteria & Bobot KPI
│   │
│   ├── 06. Modul Master Data Divisi
│   │   ├── Screen 05: Divisi Management (/divisions)
│   │   └── Modal 05A: Tambah / Edit Divisi
│   │
│   ├── 07. Modul Pengguna & RBAC
│   │   ├── Screen 06: User & Role Management (/users)
│   │   └── Modal 06A: Tambah User & Assign Role Spatie
│   │
│   └── 08. Modul Audit & Log
│       └── Screen 07: Activity Logs / Audit Trail (/activity-logs)
│
└── 09. Error & Empty State Screens
    ├── 403 Forbidden Access Page
    ├── 404 Not Found Page
    └── Global Loading & Skeleton Placeholder
```

---

## 4. Screen-by-Screen UI/UX Specifications (Figma Canvas Specs)

### Screen 01: Login & Authentication (`/login`)
* **Ukuran Frame Figma:** `1440 x 900 px` (Desktop Full Screen).
* **Layout Structure:** Split-Screen 50/50.
  * **Sisi Kiri (Brand Artwork & Value Proposition):**
    * Latar belakang gradient deep indigo-to-slate (`#1E3A8A` ke `#0F172A`).
    * Logo resmi SIM-KAP + badge enterprise *"Sistem Informasi Kinerja Pegawai PT Central Saga Mandala"*.
    * Ilustrasi visual analitik kartu scorecard, badge nilai A, dan grafik tren performa.
    * Kutipan testimoni / highlight sistem: *"Pengukuran kinerja terpadu, objektif, dan otomatis berbasis pembobotan KPI."*
  * **Sisi Kanan (Form Card Autentikasi):**
    * Card container `440px` lebar di tengah layar (*centered*).
    * Header: Logo icon, Heading *"Selamat Datang Kembali"* (24px Bold), Subheading *"Masukkan kredensial akun Anda untuk mengakses sistem"* (14px Regular).
    * Form Fields:
      1. **Input Email:** Label *"Alamat Email"*, Placeholder *"nama@perusahaan.com"*, icon surat di sisi kiri.
      2. **Input Password:** Label *"Kata Sandi"*, Placeholder *"••••••••"*, toggle icon mata (*show/hide password*) di sisi kanan.
      3. **Row Fitur:** Checkbox *"Ingat saya"* di kiri, tautan *"Lupa kata sandi?"* di kanan.
      4. **Primary CTA Button:** *"Masuk ke Sistem"* (Tinggi 48px, background `#2563EB`, text putih 14px bold, rounded-lg).
      5. **Testing Quick-Fill Pills:** Chip tombol cepat untuk demo testing: `[Admin]`, `[Manager]`, `[Employee]` yang mengisi otomatis email & password.
    * States to Design: Default, Focus Field, Error Alert (Password/Email salah banner merah), Loading Spinner on Button.

---

### Screen 02: Task Management Dashboard (`/tasks`)
* **Ukuran Frame Figma:** `1440 x 1024 px` (Dashboard Shell Standard).
* **Komponen Layout:**
  * **Header Halaman:**
    * Judul: *"Daftar Tugas & Penugasan"* (24px Bold) + Badge total tugas aktif.
    * Tombol Utama (Kanan): `+ Buat Tugas Baru` (Warna `#2563EB`, hanya tampil untuk Admin/Manager).
  * **Summary KPI Widgets (Grid 4 Kolom di Atas):**
    1. *Total Tugas Ditugaskan:* Angka besar, icon checklist biru.
    2. *Sedang Dikerjakan (In Progress):* Angka besar, icon jam kuning amber.
    3. *Menunggu Review (Submitted):* Angka besar, icon berkas info biru langit.
    4. *Selesai (Completed / Approved):* Angka besar, icon centang hijau emerald.
  * **Filter & Search Toolbar (Sticky Bar):**
    * Search Bar (Lebar 320px, icon search, placeholder *"Cari nama tugas atau pegawai..."*).
    * Dropdown Filter Status: Multi-select (`Semua`, `Pending`, `In Progress`, `Submitted`, `Approved`, `Rejected`).
    * Dropdown Filter Divisi: (`Semua Divisi`, `IT & Software`, `Human Resources`, `Finance`, dll.).
    * View Switcher Toggle: Icon Grid View vs Icon Table View.
  * **Task Card Component Anatomy (Grid View):**
    * Header Kartu: Badge status berwarna (`In Progress` / `Submitted` / `Overdue`) di kiri, Bobot Tugas `Poin: 8/10` di kanan.
    * Judul Tugas: 16px SemiBold (Maksimal 2 baris, ellipsis).
    * Deskripsi Singkat: 13px Regular Slate 500 (Maksimal 2 baris).
    * Meta Data Row:
      * Avatar + Nama Pegawai Pelaksana.
      * Icon Kalender + Tanggal Deadline (Jika < 24 jam: teks warna merah tebal).
    * Footer Kartu:
      * Progress status / waktu submit.
      * Action CTA Button:
        * Untuk Pegawai: Tombol *"Kumpulkan Bukti"* (Warna Hijau).
        * Untuk Manager: Tombol *"Review Tugas"* (Warna Biru).
        * Tombol Detail (Icon titik tiga / eye).

#### Modal 02A: Buat / Edit Tugas (`CreateTaskModal`)
* **Ukuran Modal:** Lebar `560px`, rounded-xl, backdrop overlay 50% opacity.
* **Fields:**
  * Judul Modal: *"Buat Penugasan Baru"*.
  * Input Text: Judul Tugas (*Wajib*).
  * Textarea: Deskripsi & Instruksi Pengerjaan.
  * Dropdown: Pilih Divisi Terkait.
  * Dropdown Select dengan Avatar: Pilih Pegawai Penanggung Jawab.
  * Slider / Number Input: Bobot Prioritas Tugas (Skala 1 - 10).
  * Date-Time Picker: Batas Waktu Pengumpulan (Deadline).
  * Footer: Tombol *"Batal"* (Outline) dan *"Terbitkan Tugas"* (Solid Blue).

#### Modal 02B: Kumpulkan Bukti Tugas (`SubmitTaskModal`)
* **Ukuran Modal:** Lebar `520px`.
* **Fields:**
  * Preview Ringkasan Tugas (Judul, Deadline, Bobot).
  * Drag & Drop File Upload Zone:
    * Icon cloud upload, teks *"Klik atau seret berkas bukti kerja ke sini"*.
    * Format diizinkan: PDF, DOCX, ZIP, PNG, JPG (Maks 10MB).
  * Input Text: Tautan Hasil Kerja Alternatif (Opsional, Google Drive / Figma / GitHub URL).
  * Textarea: Catatan Tambahan Pegawai.
  * Footer: Tombol *"Batal"* dan *"Kirim Bukti Tugas"* (Solid Green).

#### Modal 02C: Review & Verifikasi Tugas (`ReviewTaskModal`)
* **Ukuran Modal:** Lebar `640px`.
* **Fields:**
  * Preview Berkas & Link yang dikumpulkan oleh pegawai (Link dapat diklik, berkas dapat diunduh).
  * Catatan Pengumpulan dari Pegawai.
  * Pilihan Radio / Button Group Status Review:
    * Option 1: `Setujui (Approve)` — Tugas selesai, siap dihitung evaluasi.
    * Option 2: `Minta Revisi (Revision)` — Pegawai harus memperbaiki pengumpulan.
  * Textarea: Catatan Evaluasi / Alasan Revisi dari Manager (*Wajib diisi jika revisi*).
  * Footer: Tombol *"Simpan Hasil Review"*.

---

### Screen 03: Performance Evaluation & Scorecard (`/evaluations`)
* **Ukuran Frame Figma:** `1440 x 1024 px`.
* **Fungsi Utama:** Rekapitulasi nilai akhir bulanan pegawai, pembobotan (60% Tugas + 40% KPI), grade resmi, dan cetak PDF.
* **Komponen Visual Halaman:**
  * **Header Section:**
    * Judul: *"Evaluasi Kinerja Pegawai & Scorecard"*.
    * Filter Periode Penilaian: Dropdown Bulan (`Januari - Desember`) & Tahun (`2026`).
    * Filter Divisi: Dropdown Divisi.
    * Tombol Utama (Manager/Admin): `+ Hitung & Buat Penilaian`.
  * **Scorecard Statistic Cards (3 Kolom):**
    1. *Rata-Rata Nilai Divisi:* Angka besar `82.40` (Badge: Grade B).
    2. *Distribusi Grade:* Mini Bar Chart persentase peraih grade A, B, C, D, E.
    3. *Pegawai Berkinerja Terbaik (Top Performer):* Avatar, Nama, Nilai `94.50 (Grade A)`.
  * **Data Table Scorecard:**
    * Kolom 1: Pegawai (Foto Avatar, Nama Lengkap, NIK).
    * Kolom 2: Divisi & Jabatan.
    * Kolom 3: Nilai Akumulasi Tugas (Bobot 60%).
    * Kolom 4: Nilai Kriteria KPI (Bobot 40%).
    * Kolom 5: Nilai Akhir / Final Score (Formula otomatis).
    * Kolom 6: Badge Grade Visual (Pill bulat tebal: `A`, `B`, `C`, `D`, atau `E`).
    * Kolom 7: Status Review (`Draft` / `Published`).
    * Kolom 8: Aksi (Tombol *"Lihat Detail Scorecard"*, Tombol *"Cetak PDF"*).

#### Modal 03A: Detail Scorecard & Export Laporan
* **Ukuran Modal:** Lebar `720px`, layout elegan menyerupai sertifikat/lembar penilaian resmi.
* **Elemen Desain:**
  * Kop Dokumen Perusahaan PT Central Saga Mandala.
  * Identitas Pegawai (Nama, NIK, Divisi, Posisi, Periode Penilaian).
  * Dua Kotak Breakdown Skor:
    * Kotak Kiri: Skor Tugas `85.00` x 60% = `51.00`.
    * Kotak Kanan: Skor KPI `90.00` x 40% = `36.00`.
  * Banner Nilai Akhir: Angka besar `87.00` dengan stempel Badge Grade `A (Sangat Memuaskan)`.
  * Radar Chart / Bar Breakdown capaian per Kriteria KPI (Kedisiplinan, Kualitas Kerja, Teamwork, dll.).
  * Catatan & Rekomendasi Pengembangan dari Kepala Divisi.
  * Footer: Tombol *"Tutup"* dan Tombol *"Export Dokumen PDF"* (Icon printer/download).

---

### Screen 04: Master Data KPI Management (`/kpis`)
* **Ukuran Frame Figma:** `1440 x 900 px`.
* **Fitur Utama:** Menetapkan indikator penilaian objektif dan mengontrol total bobot persentase agar tepat 100%.
* **Komponen:**
  * **Progress Bar Akumulasi Bobot (Card Khusus di Atas):**
    * Judul: *"Total Akumulasi Bobot Kriteria KPI"*
    * Bar Visual:
      * Jika Total = 100%: Warna Hijau Emerald (`Valid - Siap Digunakan`).
      * Jika Total < 100%: Warna Amber Kuning (`Belum Mencapai 100% - Kurang X%`).
      * Jika Total > 100%: Warna Merah Danger (`Melebihi Kapasitas 100% - Kurangi X%`).
  * **Tabel Master KPI:**
    * Kolom: No, Nama Kriteria KPI, Persentase Bobot (%), Target Capaian, Deskripsi Penilaian, Status Aktif Toggle, Aksi (Edit / Hapus).
  * **Modal Tambah/Edit KPI:**
    * Input Nama Kriteria, Input Persentase Bobot (1-100%), Textarea Panduan Penilaian.

---

### Screen 05: Master Data Divisi (`/divisions`)
* **Ukuran Frame Figma:** `1440 x 900 px`.
* **Tampilan:**
  * Grid Kartu Divisi (3 kolom per baris) atau Tabel Modern.
  * Isi Kartu:
    * Badge Kode Divisi (misal: `DIV-IT`, `DIV-HR`, `DIV-FIN`).
    * Nama Divisi (20px SemiBold).
    * Deskripsi Singkat Unit Kerja.
    * Statistik Cepat: Icon User (`14 Pegawai`), Icon Tasks (`8 Tugas Berjalan`).
    * Tombol *"Kelola Divisi"* / *"Lihat Anggota"*.
  * **Modal Tambah Divisi:** Input Kode Divisi, Nama Divisi, Deskripsi, Penunjukan Kepala Divisi (Manager).

---

### Screen 06: Manajemen Pengguna & Spatie RBAC (`/users`)
* **Ukuran Frame Figma:** `1440 x 900 px`.
* **Fungsi:** Mengatur akun login dan pembagian hak akses (*Role-Based Access Control*).
* **Komponen:**
  * Tab Filter Role: `Semua User (42)`, `Administrator (3)`, `Manager (8)`, `Employee (31)`.
  * Data Table Pengguna:
    * Kolom 1: Avatar + Nama User + Username.
    * Kolom 2: Alamat Email terverifikasi.
    * Kolom 3: Divisi Penempatan.
    * Kolom 4: Role Badge (Warna Khusus: Ungu untuk `ADMIN`, Biru untuk `MANAGER`, Hijau untuk `EMPLOYEE`).
    * Kolom 5: Status Akun (Pill Hijau `Aktif` / Abu `Nonaktif`).
    * Kolom 6: Aksi (Edit Role, Reset Password, Hapus User).
  * **Modal Tambah User & Role:**
    * Input Nama, Email, Password Default, Dropdown Role Spatie, Dropdown Hubungkan ke Data Pegawai.

---

### Screen 07: Log Aktivitas & Audit Trail (`/activity-logs`)
* **Ukuran Frame Figma:** `1440 x 900 px`.
* **Fungsi:** Jejak audit kepatuhan (*compliance*) untuk mencatat setiap aksi krusial sistem.
* **Komponen:**
  * Filter Toolbar: Filter berdasarkan Aktor Pengguna, Jenis Aksi (`LOGIN`, `CREATE_TASK`, `SUBMIT_TASK`, `REVIEW_TASK`, `CALCULATE_EVALUATION`), dan Tanggal.
  * Timeline List View:
    * Sisi Kiri: Waktu kejadian (*timestamp* relatif & absolut).
    * Sisi Tengah: Garis timeline vertikal dengan titik dot icon berwarna sesuai jenis aksi.
    * Sisi Kanan: Kartu aktivitas memuat Foto Aktor, Deskripsi Tindakan, Subject Target, IP Address, dan tombol *"Lihat Payload Data"* yang mengekspansi data JSON perubahan.

---

## 5. Component Library & Interactive Micro-States

Buat komponen Figma berikut sebagai **Component Set dengan Auto Layout & Variants**:

### 5.1 Button Component (`Btn/Primary`, `Btn/Secondary`, `Btn/Outline`, `Btn/Danger`)
* **Ukuran (Height):**
  * `Large`: 48px (Tombol Submit Utama, Login CTA).
  * `Medium`: 40px (Tombol aksi tabel, modal footer).
  * `Small`: 32px (Tombol aksi kartu mini, filter chip).
* **Varian State:** `Default`, `Hover`, `Pressed/Active`, `Focused` (dengan outline ring 2px), `Disabled` (Opacity 50%, not-allowed cursor), `Loading` (Icon spinner berputar).

### 5.2 Input Field Component (`Input/Text`, `Input/Password`, `Input/Select`)
* **Tinggi Standar:** 42px, radius 8px, border 1px solid Slate 200.
* **Varian State:**
  * `Default`: Background Slate 50, border Slate 200, placeholder Slate 400.
  * `Hover`: Border Slate 300.
  * `Focus`: Border Blue 600, ring outline 3px Blue 100, background White.
  * `Error`: Border Red 500, helper text merah di bawah input *"Email tidak valid"*.
  * `Disabled`: Background Slate 100, border Slate 200, teks Slate 400.

### 5.3 Status Badge & Grade Pills (`Badge/Status`, `Badge/Grade`)
* **Format:** Auto layout horizontal, padding `4px 10px`, radius `9999px` (Pill), font 12px SemiBold.
* **Daftar Varian Badge Status:**
  * `Pending`: Background Yellow 100, Teks Yellow 800, dot icon kuning.
  * `In Progress`: Background Blue 100, Teks Blue 800, dot icon biru.
  * `Submitted`: Background Purple 100, Teks Purple 800, dot icon ungu.
  * `Approved`: Background Green 100, Teks Green 800, dot icon hijau.
  * `Revision`: Background Orange 100, Teks Orange 800, dot icon oranye.
  * `Overdue`: Background Red 100, Teks Red 800, dot icon merah.

### 5.4 Feedback Toast & Notification Banner
* **Floating Toast (Pojok Kanan Atas):** Lebar 360px, shadow medium, auto dismiss 4 detik.
  * `Toast/Success`: Icon checklist hijau, judul *"Berhasil Disimpan"*, pesan deskripsi.
  * `Toast/Error`: Icon silang merah, judul *"Gagal Memproses Data"*, pesan error validasi.

---

## 6. Rekomendasi Struktur Halaman File Figma

Agar file proyek Figma Anda tertata secara profesional dan mudah dipahami oleh dosen penguji maupun tim developer, gunakan struktur halaman (*pages*) berikut:

```text
📁 Figma Project: SIM-KAP Enterprise System
│
├── 📄 00. Cover & Project Info
│   └── Thumbnail proyek, nama sistem, logo kampus/perusahaan, dan riwayat changelog.
│
├── 📄 01. Design Tokens & Styles
│   └── Color styles, typography scale, spacing guide, shadows, dan grid layout 1440px.
│
├── 📄 02. Component Library (UI Kit)
│   └── Master components: Button, Form Input, Dropdown, Modal Shell, Badge, Avatar, Table Cells.
│
├── 📄 03. Global Layout Shell
│   └── Sidebar (Expanded & Collapsed), Top Navbar, Breadcrumbs, dan User Profile Menu.
│
├── 📄 04. High-Fidelity UI Screens (Desktop 1440px)
│   ├── Frame 01: Login Screen
│   ├── Frame 02: Task Management (Grid & Table View)
│   ├── Frame 03: Performance Evaluation Scorecard
│   ├── Frame 04: Master KPI Criteria Management
│   ├── Frame 05: Master Divisi Management
│   ├── Frame 06: User & Spatie RBAC Management
│   └── Frame 07: Activity Log & Audit Trail
│
├── 📄 05. Modals & Interactive Overlays
│   ├── Modal Buat Tugas, Submit Tugas, Review Bukti Tugas.
│   ├── Modal Detail Scorecard & Export PDF.
│   └── Modal Tambah KPI, Divisi, dan User.
│
└── 📄 06. Interactive Prototype Flow
    └── Alur klik prototype dari Login -> Buat Tugas -> Submit -> Review -> Terbit Scorecard.
```

---

## 7. Business Logic & Evaluation Formulas for UI Display

Ketika mendesain halaman **Evaluasi Kinerja (`/evaluations`)**, komponen UI harus merefleksikan formula bisnis backend:

$$\mathbf{Nilai\ Akhir} = (\mathbf{Skor\ Tugas} \times 60\%) + (\mathbf{Skor\ KPI} \times 40\%)$$

### Skala Grade Visual di Figma:
* $\mathbf{\ge 85.00} \longrightarrow \mathbf{Grade\ A}$ (Badge Hijau Emerald `#059669` — *Sangat Memuaskan*)
* $\mathbf{75.00 - 84.99} \longrightarrow \mathbf{Grade\ B}$ (Badge Biru `#2563EB` — *Baik*)
* $\mathbf{65.00 - 74.99} \longrightarrow \mathbf{Grade\ C}$ (Badge Kuning Amber `#D97706` — *Cukup*)
* $\mathbf{50.00 - 64.99} \longrightarrow \mathbf{Grade\ D}$ (Badge Oranye `#EA580C` — *Kurang*)
* $\mathbf{< 50.00} \longrightarrow \mathbf{Grade\ E}$ (Badge Merah Crimson `#DC2626` — *Sangat Kurang*)

---

## 8. Checklist Kesiapan Desain Figma (Designer Sign-Off)

Gunakan checklist ini sebelum melakukan presentasi atau serah terima (*handoff*) desain ke developer:
- [x] Seluruh token warna dan tipografi telah didaftarkan sebagai **Figma Local Styles / Variables**.
- [x] Seluruh frame menggunakan **Auto Layout 5.0** dengan *constraints* yang responsif.
- [x] Komponen interaktif memiliki varian state lengkap (`Default`, `Hover`, `Active`, `Disabled`, `Error`).
- [x] Kontras warna teks memenuhi standar aksesibilitas **WCAG 2.1 AA** (rasio minimal 4.5:1).
- [x] Semua 3 role pengguna (`Admin`, `Manager`, `Employee`) memiliki tampilan halaman dan aksi yang disesuaikan (*Role-Based UI*).
- [x] Alur prototype interaktif (*Clickable Prototype*) dapat mendemonstrasikan siklus penugasan dari awal hingga pengunduhan PDF Scorecard.
