# DOKUMENTASI LENGKAP DIAGRAM UML & MODEL SISTEM (LAPORAN KERJA PRAKTIK)
## Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan Berbasis Web pada PT Central Saga Mandala (SIM-KAP)

File Diagram Draw.io: `Pedro-KP-EvaluasiKinerja-12UC.drawio` (Tersedia **43 Halaman / Tab Diagram Lengkap**)

---

## 📑 DAFTAR ISI SELURUH DIAGRAM PADA DRAW.IO (43 TAB)

| No | Nama Tab di Draw.io | Tipe Diagram | Deskripsi / Fokus Pemodelan |
|---|---|---|---|
| **1** | `1. Use Case Diagram (12 UC)` | Use Case Diagram | Pemetaan 12 use case utama terhadap 3 aktor: Pegawai, Manager, Administrator |
| **2** | `2. AD - UC-01 Login` | Activity Diagram | Alur autentikasi, validasi kredensial Sanctum, dan penerbitan token sesi |
| **3** | `3. AD - UC-02 Logout` | Activity Diagram | Alur pencabutan token sesi aktif dan pengalihan ke login page |
| **4** | `4. AD - UC-03 Kelola User` | Activity Diagram | Alur manajemen user dan penetapan role Spatie oleh Administrator |
| **5** | `5. AD - UC-04 Kelola Divisi` | Activity Diagram | Alur CRUD data master unit divisi operasional perusahaan |
| **6** | `6. AD - UC-05 Kelola KPI` | Activity Diagram | Alur pengaturan indikator penilaian dan pembobotan kriteria KPI |
| **7** | `7. AD - UC-06 Buat Tugas` | Activity Diagram | Alur distribusi penugasan kerja baru dari Manager ke Pegawai |
| **8** | `8. AD - UC-07 Monitoring Tugas` | Activity Diagram | Alur pemantauan status dan progres tugas (Tabel & Kanban Board) |
| **9** | `9. AD - UC-08 Submit Bukti Tugas` | Activity Diagram | Alur unggah dokumen/link bukti pengerjaan dan validasi deadline (-10%) |
| **10** | `10. AD - UC-09 Review Tugas` | Activity Diagram | Alur verifikasi pengerjaan tugas (Approve / Reject dengan catatan revisi) |
| **11** | `11. AD - UC-10 Input Nilai KPI` | Activity Diagram | Alur penginputan skor parameter kriteria KPI berkala oleh Manager |
| **12** | `12. AD - UC-11 Kalkulasi Evaluasi` | Activity Diagram | Alur kalkulasi otomatis skor tugas (60%) + skor KPI (40%) serta grade A–E |
| **13** | `13. AD - UC-12 Scorecard & Laporan` | Activity Diagram | Alur tampilan kartu nilai karyawan dan ekspor laporan PDF (DomPDF) |
| **14** | `14. SD - UC-01 Login` | Sequence Diagram | Interaksi Pengguna -> FormLogin -> AuthController -> SanctumToken |
| **15** | `15. SD - UC-02 Logout` | Sequence Diagram | Interaksi Pengguna -> Navbar -> AuthController -> RevokeToken |
| **16** | `16. SD - UC-03 Kelola User` | Sequence Diagram | Interaksi Admin -> UserPage -> UserController -> SpatieRole & DB |
| **17** | `17. SD - UC-04 Kelola Divisi` | Sequence Diagram | Interaksi Admin -> DivisionPage -> DivisionController -> DivisionEntity |
| **18** | `18. SD - UC-05 Kelola KPI` | Sequence Diagram | Interaksi Admin -> KpiPage -> KpiController -> KpiCriteriaEntity |
| **19** | `19. SD - UC-06 Buat Tugas` | Sequence Diagram | Interaksi Manager -> ModalTask -> TaskController -> TaskEntity & Notif |
| **20** | `20. SD - UC-07 Monitoring Tugas` | Sequence Diagram | Interaksi User -> TaskBoard -> TaskController -> QueryWithFilter |
| **21** | `21. SD - UC-08 Submit Bukti Tugas` | Sequence Diagram | Interaksi Pegawai -> SubmitModal -> TaskController -> Storage & Submission |
| **22** | `22. SD - UC-09 Review Tugas` | Sequence Diagram | Interaksi Manager -> ReviewModal -> TaskController -> UpdateStatus & Poin |
| **23** | `23. SD - UC-10 Input Nilai KPI` | Sequence Diagram | Interaksi Manager -> EvalForm -> EvaluationController -> SaveKpiScore |
| **24** | `24. SD - UC-11 Kalkulasi Evaluasi` | Sequence Diagram | Interaksi Manager/Sistem -> EvaluationController -> EvaluationService -> ScoreCalc |
| **25** | `25. SD - UC-12 Scorecard & Laporan` | Sequence Diagram | Interaksi Pegawai -> ScorecardPage -> EvaluationController -> DomPDFStream |
| **26** | `26. Class Diagram (Diagram Kelas)` | Class Diagram | Struktur kelas model entitas: User, Employee, Division, Task, TaskSubmission, KpiCriteria, PerformanceEvaluation, ActivityLog, relasi Eloquent dan multiplisitasnya |
| **27** | `27. Component Diagram (Diagram Komponen)` | Component Diagram | Arsitektur komponen modular: Next.js 14 Frontend, REST API Controller Laravel 11, Service Layer, Repository, Spatie RBAC, PostgreSQL 16, & Storage Subsystem |
| **28** | `28. Deployment Diagram (Diagram Deployment)` | Deployment Diagram | Topologi perangkat keras dan kontainerisasi (Docker/Podman Compose): Node.js 20 (Frontend), PHP 8.4-FPM + Nginx (Backend), PostgreSQL 16, dan Volume Mounts |
| **29** | `29. State Machine Diagram (Diagram Status)` | State Machine Diagram | Siklus hidup penugasan (*Pending -> In Progress -> Submitted -> Under Review -> Approved/Rejected*) & Siklus Evaluasi Kinerja Bulanan |
| **30** | `30. Package Diagram (Diagram Paket)` | Package Diagram | Pemaketan modular berlapis (*Presentation Layer, Security Layer, Application Controller Layer, Business Service Layer, Persistence Layer, Infrastructure Layer*) |
| **31** | `31. ERD (Entity Relationship Diagram)` | ERD (Database Model) | Skema fisik tabel basis data relasional PostgreSQL, Primary Keys, Foreign Keys, Tipe Data, dan Derajat Relasi (1:1, 1:N) |
| **32** | `32. EUC - UC-01 Login` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-01 Login & Autentikasi Pengguna |
| **33** | `33. EUC - UC-02 Logout` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-02 Logout / Keluar Sesi Akun |
| **34** | `34. EUC - UC-03 Kelola User` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-03 Kelola Data Pengguna & Role Spatie |
| **35** | `35. EUC - UC-04 Kelola Divisi` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-04 Kelola Data Master Divisi |
| **36** | `36. EUC - UC-05 Kelola KPI` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-05 Kelola Kriteria & Bobot KPI |
| **37** | `37. EUC - UC-06 Distribusi Tugas` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-06 Distribusi / Pembuatan Tugas Baru |
| **38** | `38. EUC - UC-07 Monitoring Tugas` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-07 Monitoring Daftar & Progres Tugas |
| **39** | `39. EUC - UC-08 Submit Tugas` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-08 Pengumpulan Bukti Pengerjaan Tugas |
| **40** | `40. EUC - UC-09 Review Tugas` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-09 Review & Verifikasi Hasil Tugas |
| **41** | `41. EUC - UC-10 Input Penilaian KPI` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-10 Input Penilaian Kriteria KPI Pegawai |
| **42** | `42. EUC - UC-11 Kalkulasi Skor` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-11 Kalkulasi Skor & Grade Evaluasi |
| **43** | `43. EUC - UC-12 Scorecard & Laporan` | Expanded Use Case | Spesifikasi narasi skenario lengkap UC-12 Monitoring Scorecard & Cetak Laporan |

---

## 🗄️ 1. DOKUMENTASI ERD (ENTITY RELATIONSHIP DIAGRAM)

Diagram ERD (Tab 31) memodelkan skema fisik database PostgreSQL yang diimplementasikan pada backend Laravel 11:

### Kamus Data Fisik (Physical Data Dictionary)

1. **Tabel `users`**:
   * `id` (bigint, PK, Auto Increment): Identifikator unik akun pengguna.
   * `name` (varchar(255)): Nama lengkap user akun.
   * `email` (varchar(255), Unique): Alamat email untuk autentikasi login.
   * `password` (varchar(255)): Hash password terenkripsi (Bcrypt / Argon2id).
   * `remember_token` (varchar(100), Nullable): Token sesi persistent.
   * `created_at` & `updated_at` (timestamp): Waktu pembuatan dan modifikasi akun.

2. **Tabel `employees`**:
   * `id` (bigint, PK, Auto Increment): Identifikator profil pegawai.
   * `user_id` (bigint, FK -> users.id, Cascade): Relasi 1-to-1 ke akun user.
   * `division_id` (bigint, FK -> divisions.id): Relasi unit kerja divisi pegawai.
   * `nik` (varchar(50), Unique): Nomor Induk Karyawan resmi.
   * `full_name` (varchar(255)): Nama lengkap pegawai.
   * `phone` (varchar(50), Nullable): Nomor kontak telepon/WhatsApp.
   * `position` (varchar(100)): Jabatan kerja karyawan.
   * `created_at` & `updated_at` (timestamp).

3. **Tabel `divisions`**:
   * `id` (bigint, PK): Identifikator divisi.
   * `name` (varchar(255)): Nama divisi (cth: IT, HRD, Marketing, Operasional).
   * `description` (text, Nullable): Uraian tugas pokok dan fungsi unit kerja.
   * `created_at` & `updated_at` (timestamp).

4. **Tabel `tasks`**:
   * `id` (bigint, PK): Identifikator penugasan.
   * `created_by_manager_id` (bigint, FK -> employees.id): Manajer pembuat tugas.
   * `assigned_employee_id` (bigint, FK -> employees.id): Pegawai pelaksana tugas.
   * `title` (varchar(255)): Judul tugas.
   * `description` (text, Nullable): Rincian instruksi pekerjaan.
   * `deadline` (datetime): Batas akhir pengumpulan hasil tugas.
   * `weight` (int): Bobot tingkat kesulitan/prioritas tugas (Poin).
   * `status` (enum: `'PENDING'`, `'IN_PROGRESS'`, `'WAITING_VERIFICATION'`, `'COMPLETED'`, `'REVISION'`): Status siklus pengerjaan.
   * `created_at` & `updated_at` (timestamp).

5. **Tabel `task_submissions`**:
   * `id` (bigint, PK): Identifikator berkas bukti tugas.
   * `task_id` (bigint, FK -> tasks.id, Cascade): Tugas yang dikumpulkan.
   * `employee_id` (bigint, FK -> employees.id): Pegawai pengunggah bukti.
   * `file_path` (varchar(255)): Path berkas dokumen di storage server.
   * `notes` (text, Nullable): Catatan penjelasan dari pegawai.
   * `submitted_at` (timestamp): Waktu pengunggahan berkas bukti.
   * `created_at` & `updated_at` (timestamp).

6. **Tabel `kpi_criteria`**:
   * `id` (bigint, PK): Identifikator parameter penilaian KPI.
   * `criteria_name` (varchar(255)): Nama indikator (cth: Kedisiplinan, Kualitas Kerja, Inisiatif).
   * `weight_percentage` (decimal(5,2)): Persentase bobot parameter (Total akumulasi 100%).
   * `description` (text, Nullable): Penjelasan rubrik penilaian.
   * `created_at` & `updated_at` (timestamp).

7. **Tabel `performance_evaluations`**:
   * `id` (bigint, PK): Identifikator kartu evaluasi kinerja bulanan.
   * `task_id` (bigint, FK -> tasks.id, Nullable): Rujukan akumulasi tugas.
   * `employee_id` (bigint, FK -> employees.id): Pegawai yang dinilai.
   * `evaluator_manager_id` (bigint, FK -> employees.id): Manajer evaluator penilai.
   * `kpi_criteria_id` (bigint, FK -> kpi_criteria.id): Kriteria KPI yang dinilai.
   * `score` (decimal(5,2)): Nilai angka yang diberikan evaluator (0–100).
   * `feedback_notes` (text, Nullable): Catatan evaluasi dan saran perbaikan.
   * `evaluated_at` (timestamp): Waktu finalisasi evaluasi.
   * `created_at` & `updated_at` (timestamp).

8. **Tabel Spatie RBAC & Audit Trail**:
   * `roles`, `permissions`, `model_has_roles`: Konfigurasi otorisasi berbasis peran (Role-Based Access Control).
   * `activity_log`: Pencatatan jejak audit sistem (Audit Trail).

---

## 📝 2. EXPANDED USE CASE SPECIFICATIONS (12 SKENARIO LENGKAP)

Berikut adalah **Expanded Use Case (Tabel Narasi Terinci)** untuk seluruh 12 Use Case yang siap dicantumkan pada Bab Analisis Sistem (Bab III / Bab IV) Laporan Kerja Praktik:

---

### UC-01: Login & Autentikasi Pengguna
* **Use Case ID:** UC-01
* **Nama Use Case:** Login & Autentikasi Pengguna
* **Aktor Utama:** Pegawai, Manager, Administrator
* **Deskripsi Singkat:** Pengguna melakukan autentikasi identitas ke dalam sistem menggunakan email dan password untuk mendapatkan hak akses sesuai perannya.
* **Pre-conditions (Kondisi Awal):** Pengguna telah terdaftar di database sistem dan membuka halaman login Next.js.
* **Post-conditions (Kondisi Akhir):** Pengguna berhasil login, menerima Sanctum Bearer Token, dan diarahkan ke Dashboard sesuai perannya.
* **Main Flow (Skenario Utama):**
  1. Pengguna membuka antarmuka form login.
  2. Pengguna memasukkan alamat email dan password, lalu menekan tombol "Sign In".
  3. Frontend mengirimkan request HTTP POST `/api/v1/auth/login` berisi kredensial.
  4. Backend memvalidasi format data dan mencocokkan hash password di database.
  5. Backend menerbitkan Sanctum API Token beserta data profil dan Role Spatie.
  6. Frontend menyimpan token sesi dan mengarahkan pengguna ke halaman Dashboard.
* **Alternative / Exception Flow:**
  * *4a. Kredensial Salah:* Sistem menampilkan pesan kesalahan "Email atau password yang Anda masukkan salah" (HTTP 401 Unauthorized). Pengguna diminta menginput ulang.

---

### UC-02: Logout / Keluar Sesi Akun
* **Use Case ID:** UC-02
* **Nama Use Case:** Logout / Keluar Sesi Akun
* **Aktor Utama:** Semua Pengguna Terautentikasi (Pegawai, Manager, Administrator)
* **Deskripsi Singkat:** Pengguna mengakhiri sesi kerja aktif dan mencabut token otentikasi dari sistem.
* **Pre-conditions:** Pengguna sedang dalam status login aktif di sistem SIM-KAP.
* **Post-conditions:** Token Sanctum di server dicabut (*revoked*), data sesi lokal dihapus, dan layar kembali ke halaman login.
* **Main Flow:**
  1. Pengguna menekan tombol "Logout" pada navbar/sidebar aplikasi.
  2. Sistem menampilkan dialog konfirmasi keluar.
  3. Pengguna mengonfirmasi tindakan logout.
  4. Frontend mengirimkan request HTTP POST `/api/v1/auth/logout` dengan Bearer Token.
  5. Backend menghapus token aktif dari tabel `personal_access_tokens`.
  6. Frontend membersihkan cache sesi dan mengarahkan tampilan kembali ke halaman login.

---

### UC-03: Kelola Akun Pengguna & Role Spatie
* **Use Case ID:** UC-03
* **Nama Use Case:** Kelola Akun Pengguna & Role Spatie
* **Aktor Utama:** Administrator
* **Deskripsi Singkat:** Administrator mengelola data user (Tambah, Edit, Hapus, Reset Password) dan menetapkan hak akses peran (*Role Assignment*).
* **Pre-conditions:** Administrator telah login dan memiliki hak akses `manage-users`.
* **Post-conditions:** Data akun dan penetapan peran tersimpan mutakhir di database.
* **Main Flow:**
  1. Admin membuka menu "Manajemen Pengguna".
  2. Sistem menampilkan tabel daftar seluruh akun pengguna beserta rolenya.
  3. Admin memilih aksi: Tambah User, Edit Profil, atau Ubah Role.
  4. Admin menginput/memperbarui data pada modal form dan menekan "Simpan".
  5. Backend memvalidasi data unik email dan memperbarui relasi di tabel `users` dan `model_has_roles`.
  6. Sistem mencatat aksi ke tabel `activity_log` dan menampilkan notifikasi sukses.

---

### UC-04: Kelola Data Master Divisi
* **Use Case ID:** UC-04
* **Nama Use Case:** Kelola Data Master Divisi
* **Aktor Utama:** Administrator
* **Deskripsi Singkat:** Administrator mengelola master data unit departemen/divisi kerja perusahaan.
* **Pre-conditions:** Administrator login dengan hak akses `manage-divisions`.
* **Post-conditions:** Data divisi kerja berhasil tersimpan, diubah, atau dihapus dari sistem.
* **Main Flow:**
  1. Admin mengakses menu "Data Master Divisi".
  2. Sistem menampilkan daftar nama divisi dan deskripsi operasionalnya.
  3. Admin menambahkan divisi baru atau mengubah data yang sudah ada.
  4. Backend memproses penyimpanan ke tabel `divisions`.
  5. Sistem memperbarui tabel tampilan secara real-time.

---

### UC-05: Kelola Kriteria & Bobot KPI
* **Use Case ID:** UC-05
* **Nama Use Case:** Kelola Kriteria & Bobot KPI
* **Aktor Utama:** Administrator
* **Deskripsi Singkat:** Mengatur indikator parameter penilaian kinerja karyawan dan menetapkan persentase pembobotan (Total bobot = 100%).
* **Pre-conditions:** Administrator login dengan hak akses `manage-kpi`.
* **Post-conditions:** Master kriteria KPI tersimpan dan siap digunakan untuk evaluasi bulanan.
* **Main Flow:**
  1. Admin membuka menu "Master Kriteria KPI".
  2. Sistem menampilkan daftar kriteria aktif beserta persentase bobotnya.
  3. Admin menambah/mengedit kriteria (cth: Kedisiplinan 25%, Kualitas 40%, Inisiatif 35%).
  4. Backend memvalidasi total bobot akumulasi bernilai tepat 100%.
  5. Data tersimpan ke tabel `kpi_criteria`.

---

### UC-06: Distribusi / Pembuatan Tugas Baru
* **Use Case ID:** UC-06
* **Nama Use Case:** Distribusi / Pembuatan Tugas Baru
* **Aktor Utama:** Manager (Kadiv)
* **Deskripsi Singkat:** Manajer divisi mendistribusikan instruksi penugasan kerja baru kepada staf pegawai pelaksana.
* **Pre-conditions:** Manajer login dan berada di divisi yang sesuai.
* **Post-conditions:** Tugas baru berstatus `PENDING` tersimpan di database dan tampil pada daftar tugas pegawai terpilih.
* **Main Flow:**
  1. Manajer membuka menu "Manajemen Penugasan" dan klik "Buat Tugas Baru".
  2. Manajer mengisi judul tugas, instruksi/deskripsi, memilih pegawai penerima, tanggal deadline, dan bobot tugas (poin).
  3. Manajer menekan tombol "Kirim Penugasan".
  4. Backend menyimpan data ke tabel `tasks` dengan status awal `PENDING`.
  5. Sistem mengirimkan notifikasi penugasan ke akun pegawai bersangkutan.

---

### UC-07: Monitoring Daftar & Progres Tugas
* **Use Case ID:** UC-07
* **Nama Use Case:** Monitoring Daftar & Progres Tugas
* **Aktor Utama:** Pegawai (Employee) & Manager (Kadiv)
* **Deskripsi Singkat:** Memantau status, tenggat waktu, dan progres seluruh daftar tugas aktif melalui tampilan tabel data dan Kanban Board.
* **Pre-conditions:** Pengguna telah login ke sistem.
* **Post-conditions:** Pengguna memperoleh informasi mutakhir mengenai status penugasan (*Pending, In Progress, Waiting Verification, Completed, Revision*).
* **Main Flow:**
  1. Pengguna membuka menu "Daftar Tugas".
  2. Sistem mengambil data tugas berdasarkan filter peran (Pegawai melihat tugasnya; Manajer melihat tugas divisinya).
  3. Sistem menampilkan visualisasi data dalam bentuk Tabel Interaktif dan Kanban Board.
  4. Pengguna dapat memfilter berdasarkan status, tingkat prioritas, atau rentang tanggal deadline.

---

### UC-08: Pengumpulan Bukti Pengerjaan Tugas
* **Use Case ID:** UC-08
* **Nama Use Case:** Pengumpulan Bukti Pengerjaan Tugas
* **Aktor Utama:** Pegawai (Employee)
* **Deskripsi Singkat:** Pegawai mengunggah dokumen bukti pengerjaan tugas atau tautan hasil kerja sebelum batas waktu berakhir.
* **Pre-conditions:** Pegawai memiliki tugas dengan status `IN_PROGRESS` atau `REVISION`.
* **Post-conditions:** Bukti tugas tersimpan di tabel `task_submissions`, status tugas berubah menjadi `WAITING_VERIFICATION`, dan sistem menghitung penalti keterlambatan jika melewati deadline.
* **Main Flow:**
  1. Pegawai memilih tugas yang telah diselesaikan dan menekan tombol "Kumpulkan Tugas".
  2. Pegawai mengunggah berkas dokumen hasil kerja (PDF/ZIP/Gambar) dan menambahkan catatan pengerjaan.
  3. Pegawai menekan tombol "Submit Bukti".
  4. Backend menyimpan berkas ke direktori `/storage/app/submissions/`.
  5. Sistem memeriksa timestamp pengumpulan terhadap deadline. Jika terlambat, sistem mencatat status `is_late = true` (penalti -10% poin).
  6. Status tugas diperbarui menjadi `WAITING_VERIFICATION`.

---

### UC-09: Review & Verifikasi Hasil Tugas
* **Use Case ID:** UC-09
* **Nama Use Case:** Review & Verifikasi Hasil Tugas
* **Aktor Utama:** Manager (Kadiv)
* **Deskripsi Singkat:** Manajer memeriksa kelayakan bukti tugas yang dikumpulkan pegawai untuk disetujui (*Approve*) atau ditolak untuk perbaikan (*Reject/Revision*).
* **Pre-conditions:** Terdapat tugas dengan status `WAITING_VERIFICATION`.
* **Post-conditions:** Tugas disetujui (status `COMPLETED` dan poin dicatat) atau ditolak (status `REVISION` dengan catatan perbaikan).
* **Main Flow:**
  1. Manajer membuka daftar tugas yang menunggu verifikasi.
  2. Manajer mengunduh/memeriksa berkas bukti pengerjaan tugas.
  3. Manajer memilih keputusan:
     * **Jika Sesuai:** Klik "Setujui Tugas (Approve)", status menjadi `COMPLETED`, poin tugas siap dikalkulasi.
     * **Jika Belum Sesuai:** Klik "Minta Revisi (Reject)", input catatan kekurangan, status kembali ke `REVISION`.
  4. Backend memperbarui data pada tabel `tasks` dan `task_submissions`.

---

### UC-10: Input Penilaian Kriteria KPI Pegawai
* **Use Case ID:** UC-10
* **Nama Use Case:** Input Penilaian Kriteria KPI Pegawai
* **Aktor Utama:** Manager (Kadiv)
* **Deskripsi Singkat:** Manajer menginput skor kuantitatif untuk setiap parameter kriteria KPI pegawai pada periode evaluasi tertentu.
* **Pre-conditions:** Periode evaluasi kinerja bulanan telah dibuka.
* **Post-conditions:** Skor kriteria KPI tersimpan di tabel `performance_evaluations`.
* **Main Flow:**
  1. Manajer membuka menu "Evaluasi Kinerja" dan memilih pegawai yang akan dinilai.
  2. Sistem menampilkan daftar indikator kriteria KPI aktif.
  3. Manajer menginput skor nilai (skala 0–100) untuk tiap kriteria dan menuliskan umpan balik (*feedback*).
  4. Manajer menekan tombol "Simpan Penilaian KPI".
  5. Backend memvalidasi kelengkapan data dan menyimpan record ke database.

---

### UC-11: Kalkulasi Skor & Grade Evaluasi
* **Use Case ID:** UC-11
* **Nama Use Case:** Kalkulasi Skor & Grade Evaluasi
* **Aktor Utama:** Manager (Kadiv) / Automated Evaluation Engine
* **Deskripsi Singkat:** Sistem secara otomatis mengkalkulasi skor akhir kinerja pegawai dengan menggabungkan Akumulasi Tugas (60%) dan Skor KPI (40%) serta menentukan Grade Evaluasi (A–E).
* **Pre-conditions:** Tugas pada periode evaluasi telah diverifikasi dan skor KPI telah diinput lengkap.
* **Post-conditions:** Skor akhir terhitung presisi dan Grade evaluasi ditetapkan.
* **Main Flow:**
  1. Manajer/Sistem memicu proses "Hitung Nilai Akhir".
  2. Service Layer mengeksekusi formula perhitungan:
     $$\text{Task Score} = \left(\frac{\text{Total Poin Tugas Disetujui}}{\text{Total Target Poin}}\right) \times 100$$
     $$\text{KPI Score} = \sum (\text{Skor Kriteria}_i \times \text{Bobot Kriteria}_i)$$
     $$\text{Final Score} = (\text{Task Score} \times 0.60) + (\text{KPI Score} \times 0.40)$$
  3. Sistem menetapkan Grade berdasarkan rentang nilai:
     * **Grade A:** $\ge 85.00$ (*Sangat Baik / Istimewa*)
     * **Grade B:** $75.00 - 84.99$ (*Baik / Memenuhi Ekspektasi*)
     * **Grade C:** $65.00 - 74.99$ (*Cukup / Perlu Peningkatan*)
     * **Grade D:** $50.00 - 64.99$ (*Kurang*)
     * **Grade E:** $< 50.00$ (*Sangat Kurang*)
  4. Hasil evaluasi final tersimpan dan dikunci untuk penerbitan laporan.

---

### UC-12: Monitoring Scorecard & Cetak Laporan
* **Use Case ID:** UC-12
* **Nama Use Case:** Monitoring Scorecard & Cetak Laporan
* **Aktor Utama:** Pegawai (Employee) & Manager (Kadiv)
* **Deskripsi Singkat:** Pegawai melihat kartu nilai evaluasi kinerjanya (*Scorecard*) dan mengunduh/mencetak dokumen resmi laporan evaluasi kinerja dalam format PDF.
* **Pre-conditions:** Evaluasi kinerja periode bersangkutan telah selesai dikalkulasi dan dipublikasikan.
* **Post-conditions:** Dokumen laporan resmi berformat PDF berhasil diekspor dan diunduh.
* **Main Flow:**
  1. Pengguna membuka halaman "Scorecard / Laporan Kinerja".
  2. Sistem menampilkan ringkasan visual kartu nilai (Skor Tugas, Skor KPI, Skor Akhir, Grade, dan Catatan Feedback Manajer).
  3. Pengguna menekan tombol "Export / Cetak Laporan PDF".
  4. Backend me-render template blade evaluasi menggunakan engine `Barryvdh\DomPDF`.
  5. File stream PDF dikirimkan ke browser dan otomatis diunduh oleh pengguna.

---

> [!TIP]
> Seluruh diagram dan tabel dokumentasi di atas telah disinkronisasikan 100% antara file visual [Pedro-KP-EvaluasiKinerja-12UC.drawio](file:///c:/Users/Microsoft/Documents/Ngoding/KP/Pedro-KP-EvaluasiKinerja-12UC.drawio), skema database PostgreSQL, dan kode program Laravel 11 + Next.js 14.
