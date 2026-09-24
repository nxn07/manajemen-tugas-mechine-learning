# 🔐 DOKUMEN HAK AKSES SPATIE RBAC & KREDENSIAL LOGIN LENGKAP
**Central Saga Enterprise Performance (SIM-KAP v2.0 Official)**

> [!NOTE]
> Dokumen resmi ini berisi rincian kredensial login seluruh peranan (*Roles* & *User Accounts*), hierarki tahta jabatan (Super Admin ➔ Admin Sekunder ➔ Manager ➔ Employee), status keaktifan akun, matriks hak akses **Spatie RBAC**, fitur proteksi akun master, Tempat Sampah (*Recycle Bin Recovery*), serta panduan alur kerja operasional (*SOP Workflow*) pada sistem **Central Saga**.

---

## 📍 1. URL Akses Sistem

* **Halaman Login**: [http://localhost:3000/login](http://localhost:3000/login)
* **Reset Password**: [http://localhost:3000/reset-password](http://localhost:3000/reset-password)
* **Dashboard Utama**: [http://localhost:3000](http://localhost:3000)
* **Manajemen Tugas & Tempat Sampah**: [http://localhost:3000/tasks](http://localhost:3000/tasks)
* **Evaluasi Kinerja KPI**: [http://localhost:3000/evaluations](http://localhost:3000/evaluations)
* **Manajemen User & RBAC**: [http://localhost:3000/users](http://localhost:3000/users)
* **Log Aktivitas System**: [http://localhost:3000/activity-logs](http://localhost:3000/activity-logs)
* **Pengaturan Profile & Sistem**: [http://localhost:3000/settings](http://localhost:3000/settings)
* **Backend API Server**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

---

## 👑 2. Hierarki Tahta Pengguna (Dari Tertinggi ke Terendah)

Sistem mengurutkan seluruh pengguna di tabel manajemen secara ketat berdasarkan hierarki tahta jabatan berikut:

| Peringkat | Tingkatan Jabatan | Simbol & Badge | Deskripsi & Hak Istimewa |
|:---:|:---|:---|:---|
| **1** | **Super Admin (Master)** | `👑 SUPER ADMIN` `👑 MASTER` | **Pemilik Sistem Pertama**. Akses penuh (`*`). Dilindungi sistem secara permanen (tidak dapat diedit, dinonaktifkan, atau dihapus oleh siapapun). |
| **2** | **Admin Sekunder** | `ADMIN` | **Admin Hasil Buatan**. Memiliki wewenang manajemen user, master data divisi, & KPI, namun **tidak dapat mengutak-atik Super Admin Utama**. |
| **3** | **Manager / Kadiv** | `MANAGER` | **Kepala Divisi / Pimpinan Unit**. Membuat tugas, review pengumpulan, evaluasi KPI bulanan, dan memindahkan tugas karyawan non-aktif. |
| **4** | **Employee / Staf** | `EMPLOYEE` | **Karyawan / Pelaksana**. Menerima tugas, submit bukti kerja, dan melihat lembar kartu evaluasi kinerja pribadi. |

---

## ⚡ 3. Ringkasan Cepat Email & Password Login (Urutan Tahta Tertinggi)

> [!TIP]
> **Password Bawaan Seluruh Akun**: `password`  
> *(Catatan: Password dapat diubah secara mandiri melalui menu [Reset Password](http://localhost:3000/reset-password) dengan konfirmasi OTP ke email testing default `putra.timur804@gmail.com` atau via Tab Profil Saya di Pengaturan)*

> [!IMPORTANT]
> **Validasi Autentikasi Ketat (Strict Credential Validation)**:
> Sistem **hanya mengizinkan login** bagi email dan password yang **benar-benar terdaftar dan sesuai**.
> Jika terjadi salah ketik (*typo*, misal `managert@gmail.com`) atau password salah, sistem akan **langsung memblokir login** dan menampilkan banner error: *"Gagal Masuk: Email tidak terdaftar di sistem"* atau *"Password salah"*.

| ID | Tingkat / Level Akses | Nama Pengguna | Email Login | Password Bawaan | Status Akun | Peran & Hak Istimewa |
|:--:|:---|:---|:---|:---|:---:|:---|
| 01 | 👑 **Super Admin (Master)** | Admin System | `admin@gmail.com` | `password` | 🟢 AKTIF | **Super Admin Master** (Akses Penuh `*`, Akun Terkunci) |
| 02 | 🛡️ **Admin Sekunder** | admin edo | `adminEdo@gmail.com` | `password` | 🟢 AKTIF | Admin Operasional & Pengelola Data Master |
| 03 | 👔 **Manager 1** | Manager Utama | `manager@gmail.com` | `password` | 🟢 AKTIF | Senior General Manager |
| 04 | 👔 **Manager 2** | Manager Operasional | `manager2@gmail.com` | `password` | 🟢 AKTIF | Operations Manager |
| 05 | 👤 **Employee 1** | Sarah Jenkins | `sarah@gmail.com` | `password` | 🟢 AKTIF | Finance Specialist |
| 06 | 👤 **Employee 2** | Michael Ross | `michael@gmail.com` | `password` | 🟢 AKTIF | IT Operations Lead |
| 07 | 👤 **Employee 3** | Natalie McDermott | `natalie@gmail.com` | `password` | 🟢 AKTIF | HR Specialist |
| 08 | 👤 **Employee 4** | Van Larkin | `van@gmail.com` | `password` | 🟢 AKTIF | Legal Counsel |
| 09 | 👤 **Employee 5** | Miss Felicity Runte | `felicity@gmail.com` | `password` | 🟢 AKTIF | Staff Specialist |
| 10 | 👤 **Employee 6** | Bertrand | `bertrand@gmail.com` | `password` | 🟢 AKTIF | Operations Staff |
| 11 | 👤 **Employee 7** | Anna Lee | `anna@gmail.com` | `password` | 🟢 AKTIF | Marketing Officer |
| 12 | 👤 **Employee 8** | David Tran | `david@gmail.com` | `password` | 🟢 AKTIF | Software Engineer |
| * | 👤 **User Baru** | *(User Terdaftar)* | `<email_user>` | `password` | 🟢 AKTIF | Karyawan / Staf Terdaftar |

---

## 🔑 4. Detail Rincian Hak Akses & Fitur Per Tingkatan

### A. Super Admin Utama vs Admin Sekunder vs Manager
| No | Peran (Role) | Email Login | Password | Nama Pengguna | Izin Akses Spesifik | Akses Fitur Utama |
|:--:|:---|:---|:---|:---|:---|:---|
| 1 | 👑 **SUPER ADMIN (MASTER)** | `admin@gmail.com` | `password` | Admin System | `tasks.*`, `users.*`, `evaluations.*`, `divisions.*`, `kpis.*` (Full `*`) | **Full Super Admin**: Kontrol penuh, tidak dapat diedit/dinonaktifkan/dihapus oleh siapa pun. |
| 2 | 🛡️ **ADMIN SEKUNDER** | `adminEdo@gmail.com` | `password` | admin edo | `users.manage`, `divisions.manage`, `kpi.manage`, `tasks.create`, `evaluations.create` | **Admin Operasional**: Kelola pengguna (kecuali Super Admin), master divisi & KPI, monitor seluruh tugas. |
| 3 | 👔 **MANAGER 1** | `manager@gmail.com` | `password` | Manager Utama | `tasks.create`, `tasks.submit`, `tasks.review`, `evaluations.create`, `users.delete` | **Akses Manager**: Assign tugas tim, review & persetujuan, pemindahan tugas karyawan non-aktif, evaluasi KPI bulanan. |
| 4 | 👔 **MANAGER 2** | `manager2@gmail.com` | `password` | Manager Operasional | `tasks.create`, `tasks.submit`, `tasks.review`, `evaluations.create`, `users.delete` | **Akses Manager**: Assign tugas tim, review & persetujuan, pemindahan tugas karyawan non-aktif, evaluasi KPI bulanan. |

> [!IMPORTANT]
> **Batasan Tampilan Role Manager**:  
> Saat pengguna login sebagai **MANAGER**, tabel `/users` **secara otomatis hanya menampilkan akun staf/pegawai (EMPLOYEE)**. Akun Admin dan sesama Manager disembunyikan dari tabel, dan Manager hanya dapat mendaftarkan akun ber-role `EMPLOYEE` guna menjaga privasi serta pembagian wewenang manajerial.

### B. Role Employee (Staf Operasional / Karyawan)
| No | Peran (Role) | Email Login | Password | Nama Pengguna | Jabatan Pegawai | Izin Akses Spesifik | Akses Fitur Utama |
|:--:|:---|:---|:---|:---|:---|:---|:---|
| 1 | 👤 **EMPLOYEE 1** | `sarah@gmail.com` | `password` | Sarah Jenkins | Finance Specialist | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 2 | 👤 **EMPLOYEE 2** | `michael@gmail.com` | `password` | Michael Ross | IT Operations | `tasks.submit`, `tasks.create` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 3 | 👤 **EMPLOYEE 3** | `natalie@gmail.com` | `password` | Natalie McDermott | HR Specialist | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 4 | 👤 **EMPLOYEE 4** | `van@gmail.com` | `password` | Van Larkin | Legal Counsel | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 5 | 👤 **EMPLOYEE 5** | `felicity@gmail.com` | `password` | Miss Felicity Runte | Staff Specialist | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 6 | 👤 **EMPLOYEE 6** | `bertrand@gmail.com` | `password` | Bertrand | Operations Staff | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 7 | 👤 **EMPLOYEE 7** | `anna@gmail.com` | `password` | Anna Lee | Marketing Officer | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |
| 8 | 👤 **EMPLOYEE 8** | `david@gmail.com` | `password` | David Tran | Software Engineer | `tasks.submit` | Mulai Kerja, Submit Bukti Dokumen, Filter Tugas Saya, Edit Profil |

---

## 🔒 5. Proteksi Keamanan Khusus (Security & Anti Self-Lockout)

1. 🛡️ **Proteksi Super Admin Utama (`admin@gmail.com`)**:
   - Akun Super Admin Utama ditandai dengan badge emas **`👑 SUPER ADMIN`** dan chip **`👑 MASTER`**.
   - Tombol aksi otomatis terkunci (**`🔒 Terkunci (Master)`**) sehingga tidak dapat diedit perannya, dinonaktifkan, atau dihapus oleh siapapun (termasuk admin sekunder).

2. 👤 **Penanda Akun Sendiri & Anti Self-Deactivation**:
   - Pengguna yang sedang login ditandai dengan badge biru **`👤 AKUN ANDA`** serta aksen garis tepi biru di tabel.
   - Kolom aksi terkunci dengan status **`🔒 Akun Anda (Terkunci)`** untuk mencegah pengguna menonaktifkan akunnya sendiri atau mengubah perannya sendiri secara tidak sengaja (*anti self-lockout*).

---

## 🗑️ 6. Tempat Sampah Penugasan (Recycle Bin) & Pemulihan (Recovery Engine)

Sistem **Central Saga** menyediakan fitur **Tempat Sampah Penugasan (*Recycle Bin*)** khusus untuk role **Admin & Manager**:

1. 🗑️ **Mekanisme Soft Delete**:
   - Saat Admin atau Manager menghapus tugas di `/tasks`, tugas **TIDAK HILANG PERMANEN**, melainkan dipindahkan ke **Tempat Sampah (Recycle Bin)** (`is_deleted: true`).
   - Aktivitas pencatatan pemindahan tercatat di Log Aktivitas (`TASK_MOVED_TO_TRASH`).

2. 🗃️ **Modal Executive Recycle Bin**:
   - Tombol **`[ 🗑️ Tempat Sampah (${trashedTasks.length}) ]`** tersedia di header kanan atas `/tasks` bagi Admin & Manager.
   - Menampilkan daftar tugas terhapus, penerima tugas, status sebelum dihapus, tanggal dihapus, dan nama yang menghapus.

3. 🔄 **Fitur Pemulihan (Task Recovery)**:
   - Klik **`[ 🔄 Pulihkan ]`**: Tugas otomatis **dikembalikan utuh secara instan (0ms)** ke tabel penugasan aktif!
   - Klik **`[ 🗑️ Hapus Permanen ]`** (Khusus Admin): Menghapus tugas secara permanen dari database sistem.

4. 🕒 **Fitur Pengurutan Waktu Diubah (Sorting Engine)**:
   - **Dropdown Toolbar**: Tersedia 2 opsi yaitu `🕒 Waktu Diubah: Paling Baru` (Desc) dan `🕒 Waktu Diubah: Paling Lama` (Asc).
   - **Header Kolom Interaktif**: Kolom **`STATUS & WAKTU DIUBAH`** dapat diklik langsung untuk membalik urutan (Terbaru 🔽 / Terlama 🔼).

---

## 🚫 7. Fitur Modal Nonaktifkan User & Pemindahan Tugas Instan (Reassignment Engine)

Sistem **Central Saga** menerapkan **Modal Interaktif Penonaktifan Akun & Pemindahan Tugas**:

1. ⛔ **Modal Cerdas Penonaktifan (`/users`)**:
   - Saat Admin atau Manager mengklik tombol **`[ ⛔ Nonaktifkan ]`** pada pegawai, modal **Nonaktifkan Akun & Pengalihan Tugas** akan muncul secara interaktif.
   - Modal secara otomatis menampilkan **seluruh daftar tugas aktif yang sedang dikerjakan** oleh pegawai tersebut (Judul, Tenggat Waktu/Deadline, Status, Bobot Poin).

2. 🔄 **Opsi Pemindahan Tugas ke Pegawai Lain**:
   - Jika pegawai memiliki tugas aktif, tersedia dropdown pemilih pegawai pengganti (**`Pindahkan Seluruh Tugas ke Pegawai Pengganti`**).
   - Klik **`[ 🔄 Nonaktifkan & Pindahkan Tugas ]`**:
     - Status akun diubah menjadi **`🔴 NON-AKTIF`** dan login diblokir.
     - Seluruh tugas **secara instan (0ms) berpindah ke pegawai yang dituju** (muncul di halaman tugas pegawai baru dan hilang dari pegawai lama).
   - Klik **`[ ⛔ Nonaktifkan Saja (Pending) ]`**:
     - Status akun diubah menjadi **`🔴 NON-AKTIF`** dan tugas diset berstatus `PENDING` untuk dialihkan di kemudian hari via menu `/tasks`.

3. 🔒 **Blokir Akses Login Real-Time**:
   - Akun berstatus `INACTIVE` **TIDAK BISA LOGIN** (ditolak dengan status 403 Forbidden).

4. 🕒 **Pembaruan Tanggal & Status Jejak Pengalihan di Tabel Tugas (`/tasks`)**:
   - Pada kolom **`STATUS & WAKTU DIUBAH`**, tanggal perubahan otomatis di-update ke **waktu real-time saat pemindahan dilakukan**.
   - Muncul badge khusus: **`🔄 Dipindahkan: <Nama Manager/Admin>`** dan catatan kepemilikan sebelumnya: **`(Dari: <Nama Pegawai Lama>)`**.
   - Detail pengalihan ini juga tercatat secara transparan pada modal **Detail Tugas**.

5. 🛡️ **Proteksi Edit RBAC pada Pengguna Non-Aktif (`/users`)**:
   - Pengguna dengan status **`🔴 NON-AKTIF`** otomatis **DILOCK & DIBLOKIR** dari pengubahan Role & Permission Spatie RBAC.
   - Tombol **`[ 🛡️ Edit RBAC & Status ]`** pada baris pengguna non-aktif akan dinonaktifkan (*disabled, opacity 60%, cursor not-allowed*).
   - Admin/Manager wajib mengaktifkan kembali akun pengguna tersebut via tombol **`[ ⚡ Aktifkan ]`** sebelum dapat mengubah Role & Hak Akses Spatie RBAC.

---

## 🛡️ 8. Matriks Hak Akses Spatie RBAC & Pembatasan Modal Role

| Kunci Permission | Fitur yang Diizinkan | EMPLOYEE | MANAGER | ADMIN | SUPER ADMIN (MASTER) |
|:---|:---|:--:|:--:|:--:|:--:|
| **`tasks.create`** | Membuat & assign tugas baru (`+ Assign New Task`) | ⚪ *(Dapat Dicentang)* | 🟢 Ya (Bawaan) | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`tasks.submit`** | Unggah berkas / link bukti penyelesaian tugas | 🟢 Ya (Bawaan) | 🟢 Ya (Bawaan) | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`tasks.review`** | Meninjau, menyetujui, atau meminta revisi tugas | ⚪ *(Dapat Dicentang)* | 🟢 Ya (Bawaan) | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`evaluations.create`** | Mengisi slider KPI & menerbitkan evaluasi bulanan | ❌ Tidak Tersedia | ⚪ *(Dapat Dicentang)* | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`evaluations.view_own`** | Melihat kartu skor evaluasi mandiri (*Private Mode*) | 🟢 Ya (Bawaan) | 🟢 Ya (Bawaan) | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`users.manage`** | Buka menu & edit modal Spatie RBAC `/users` | ❌ Tidak Tersedia | ❌ Tidak Tersedia | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`users.delete`** | Mengelola status keaktifan & nonaktifkan user | ❌ Tidak Tersedia | ⚪ *(Dapat Dicentang)* | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |
| **`divisions.manage`** | Mengelola master data divisi & departemen | ❌ Tidak Tersedia | ❌ Tidak Tersedia | 🟢 Ya | 🟢 Ya (Akses Penuh `*`) |

---

## 📜 9. Sistem Log Aktivitas Real-Time, Backup Excel & Pembersihan Data (`/activity-logs`)

1. **Pencatatan Otomatis Seluruh Aksi Penting**:
   - `SPATIE_RBAC_UPDATED`, `USER_DEACTIVATED`, `USER_ACTIVATED`, `TASK_CREATED`, `PROOF_SUBMITTED`, `TASK_REVIEWED`, `TASK_REASSIGNED`, `TASK_MOVED_TO_TRASH`, `TASK_RESTORED`, `EVALUATION_CREATED`, `USER_LOGIN`, `PASSWORD_RESET`.
2. **Pewaktu Hilang Otomatis 5 Detik**:
   - Penanda `✨ TERBARU` akan menyala selama 5 detik pertama kemudian hilang secara dinamis.
3. 📥 **Fitur Download Backup Excel (.csv Kompatibel UTF-8)**:
   - Tombol **`[ 📥 Download Backup Excel ]`** mengekspor seluruh rekaman audit trail ke dalam format spreadsheet Excel (`.csv` dengan UTF-8 BOM) yang mencakup kolom: *No, Waktu (Timestamp), Nama Pengguna, Aksi Audit, Modul Sistem, dan Detail Aktivitas*.
4. 🗑️ **Fitur Bersihkan Log & Modal Pengingat Backup Wajib**:
   - Tombol **`[ 🗑️ Bersihkan Log ]`** akan memunculkan **Modal Pengingat Keamanan**.
   - Modal memberikan opsi:
     - 🟢 **`[ 📥 Unduh Backup Excel & Bersihkan Log (Direkomendasikan) ]`**: Mengunduh arsip Excel otomatis terlebih dahulu sebelum riwayat dibersihkan.
     - 🔴 **`[ ⚠️ Bersihkan Saja (Tanpa Backup) ]`**: Menghapus data log secara langsung.
     - ⚪ **`[ Batal ]`**: Membatalkan pembersihan.
5. 🔒 **Pembatasan Hak Akses Tampilan Log Berdasarkan Role (Role-Based Log Visibility)**:
   - 👑 **ADMIN / SUPER ADMIN**: Memiliki akses penuh (*Full Audit Visibility*) untuk melihat **seluruh catatan aktivitas sistem**, termasuk aktivitas Admin, Manager, dan Employee.
   - 💼 **MANAGER**: Hanya dapat melihat **catatan aktivitas tim & karyawan** (misal: penugasan tugas, review tugas, pengumpulan bukti, evaluasi, login karyawan). Seluruh aktivitas yang dilakukan oleh **Admin level** otomatis disaring (*filtered out/hidden*) demi menjaga kerahasiaan operasional administratif.

---

## 📝 10. Fitur Alasan & Catatan Justifikasi Evaluasi Kinerja (`/evaluations`)

Sistem Evaluasi Kinerja Bulanan Central Saga menyediakan fitur **Catatan, Alasan & Kesimpulan Penilaian Lengkap**:

1. 🎯 **Input Wajib Alasan Skor Tugas (60%)**:
   - Di bawah pilihan pegawai dan nilai Skor Tugas, terdapat kolom input **`Alasan Pemberian Skor Tugas (60%) *`** (Wajib Diisi).
   - Penilai wajib memberikan alasan/justifikasi mengapa pegawai diberikan nilai skor tugas tersebut (misal: penyelesaian tepat waktu, keakuratan hasil laporan proyek, dll.).

2. ✍️ **Input Wajib Alasan pada Setiap Indikator KPI (40%)**:
   - Pada modal **Buat Evaluasi Kinerja Bulanan Baru**, setiap slider dari 4 indikator KPI memiliki kolom input alasan masing-masing:
     1. **Kedisiplinan & Ketepatan Waktu**: Input alasan kedisiplinan.
     2. **Kualitas Hasil Kerja**: Input alasan kualitas output kerja.
     3. **Kerjasama Tim & Komunikasi**: Input alasan koordinasi & komunikasi tim.
     4. **Inisiatif & Inovasi Kerja**: Input alasan inisiatif & inovasi.

3. 📋 **Input Wajib Kesimpulan & Rekomendasi Penilaian Akhir**:
   - Tepat di bagian bawah indikator KPI (di atas proyeksi skor akhir), terdapat kolom khusus **`5. Kesimpulan & Rekomendasi Penilaian Akhir *`** (Textarea).
   - Penilai wajib merangkum kesimpulan menyeluruh performa pegawai dan rekomendasi pembinaan/pengembangan karier.

4. ⚠️ **Validasi Ketat & Pemblokiran Penerbitan (Blocking Validation)**:
   - Jika ada **alasan skor tugas, alasan indikator KPI, atau kesimpulan penilaian yang belum diisi**, sistem akan:
     - Memunculkan banner peringatan merah: *"⚠️ Peringatan: Alasan Skor Tugas, seluruh 4 alasan KPI, dan Kesimpulan Penilaian wajib diisi sebelum evaluasi dapat diterbitkan!"*.
     - Menandai kolom yang kosong dengan border merah menyala (*highlight error*).
     - **Memblokir tombol `[ Terbitkan Evaluasi ]`** sehingga form tidak bisa di-submit secara sembarangan.

5. 👁️ **Modal Detail & Transparansi Alasan Penilaian Terstruktur**:
   - Pada tabel Evaluasi Kinerja, klik baris atau tombol **`[ 👁️ Alasan & Detail ]`** untuk membuka pop-up transparansi penilaian yang terbagi rapi menjadi 3 card khusus:
     - 🎯 **Card 1 (Skor Tugas 60%)**: Menampilkan nilai dan alasan penyelesaian tugas utama/proyek.
     - 📊 **Card 2 (Indikator KPI 40%)**: Menampilkan nilai rata-rata dan rincian ke-4 butir alasan KPI (*Kedisiplinan, Kualitas Kerja, Kerjasama Tim, Inisiatif/Inovasi*).
     - 📌 **Card 3 (Kesimpulan & Rekomendasi)**: Menampilkan kutipan kesimpulan menyeluruh dan rekomendasi pengembangan dari atasan.
