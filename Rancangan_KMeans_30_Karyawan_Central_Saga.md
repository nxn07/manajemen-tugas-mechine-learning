# Rancangan Penerapan K-Means pada Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan

## PT Central Saga Mandala

## 1. Judul Penelitian

**Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan Berbasis Web pada PT Central Saga Mandala**

Apabila penerapan machine learning ingin disebutkan secara langsung dalam judul, alternatif yang lebih spesifik adalah:

> **Penerapan K-Means Clustering pada Sistem Informasi Manajemen Kinerja dan Penugasan Karyawan Berbasis Web di PT Central Saga Mandala**

## 2. Metode Machine Learning yang Digunakan

Penelitian menggunakan **K-Means Clustering**, yaitu metode *unsupervised machine learning* yang mengelompokkan data berdasarkan kemiripan karakteristik.

Dalam penelitian ini, K-Means digunakan untuk mengelompokkan **kondisi kinerja dan beban kerja karyawan**. Hasil pengelompokan kemudian menjadi salah satu bahan pertimbangan manajer dalam memberikan tugas kepada karyawan.

K-Means tidak digunakan untuk memecat, menghukum, atau menentukan keputusan akhir secara otomatis. Keputusan penugasan tetap dilakukan oleh manajer atau pihak yang berwenang.

## 3. Jumlah Data yang Digunakan

Penelitian menggunakan data **30 karyawan PT Central Saga Mandala**.

Jumlah tersebut dipilih sebagai jumlah minimal praktis untuk penelitian clustering sederhana dengan tiga kelompok. K-Means sebenarnya tidak memiliki ketentuan resmi bahwa data harus berjumlah tepat 30. Pemilihan 30 karyawan merupakan keputusan operasional penelitian dengan mempertimbangkan:

1. Ketersediaan data karyawan di perusahaan.
2. Penelitian hanya menggunakan tiga cluster sederhana.
3. Setiap cluster diharapkan mempunyai anggota yang cukup untuk dianalisis.
4. Penelitian bersifat eksploratif dan bertujuan membantu pengambilan keputusan.
5. Seluruh data berasal dari objek penelitian yang sama sehingga lebih relevan daripada menggunakan data perusahaan lain.
6. Kualitas hasil diuji secara kuantitatif dan divalidasi oleh pihak perusahaan.

Dengan tiga cluster, perbandingan awalnya adalah:

$$
\frac{30\ \text{karyawan}}{3\ \text{cluster}} = 10\ \text{karyawan per cluster}
$$

Perhitungan tersebut hanya gambaran awal. K-Means tidak menjamin setiap cluster akan berisi tepat 10 karyawan karena pembagian dilakukan berdasarkan kemiripan data, bukan pemerataan jumlah anggota.

## 4. Alasan Menggunakan 30 Karyawan

### 4.1 Sesuai dengan kondisi objek penelitian

Penelitian dilakukan pada PT Central Saga Mandala sehingga data aktual perusahaan lebih penting daripada menggunakan dataset besar yang tidak menggambarkan kondisi perusahaan.

### 4.2 Cukup untuk penelitian eksploratif

Data 30 karyawan dapat digunakan untuk menemukan pola awal kondisi karyawan. Namun, hasil penelitian tidak boleh diklaim berlaku untuk semua perusahaan atau populasi karyawan secara umum.

### 4.3 Jumlah cluster dibuat sederhana

Penelitian direncanakan menggunakan tiga cluster agar hasilnya mudah dipahami dan tidak menghasilkan kelompok yang terlalu kecil.

### 4.4 Semua karyawan dapat diamati

Jika perusahaan memiliki 30 karyawan yang relevan dan seluruhnya digunakan, penelitian dapat menggunakan pendekatan **sampel jenuh atau total sampling**, yaitu seluruh anggota populasi yang memenuhi kriteria dijadikan sampel.

### 4.5 Evaluasi tidak hanya bergantung pada jumlah data

Kelayakan hasil clustering juga ditentukan melalui:

- kualitas dan kelengkapan data;
- pemilihan variabel yang relevan;
- proses normalisasi;
- nilai *Silhouette Score*;
- perbandingan jumlah cluster menggunakan *Elbow Method*; dan
- validasi hasil oleh HR, supervisor, atau pimpinan perusahaan.

## 5. Batasan dan Kejujuran Akademik

Karena hanya menggunakan 30 karyawan, penelitian perlu menyatakan beberapa batasan:

1. Hasil cluster menggambarkan kondisi internal PT Central Saga Mandala.
2. Hasil tidak dapat langsung digeneralisasi ke perusahaan lain.
3. Perubahan satu atau beberapa data dapat memengaruhi susunan cluster.
4. Hasil K-Means merupakan pendukung keputusan, bukan keputusan mutlak.
5. Penelitian perlu mencantumkan periode pengambilan data.
6. Data buatan atau data Kaggle tidak boleh diakui sebagai data asli perusahaan.

## 6. Variabel yang Digunakan

Variabel K-Means harus berbentuk numerik dan memiliki hubungan dengan kinerja atau beban kerja.

| No. | Variabel | Bentuk Data | Contoh |
|---:|---|---|---:|
| 1 | Persentase kehadiran | Persentase | 95% |
| 2 | Persentase tugas selesai | Persentase | 90% |
| 3 | Persentase tugas tepat waktu | Persentase | 85% |
| 4 | Nilai kualitas pekerjaan | Skala 0–100 | 88 |
| 5 | Nilai kedisiplinan | Skala 0–100 | 90 |
| 6 | Jumlah tugas aktif | Jumlah | 4 |
| 7 | Jumlah tugas terlambat | Jumlah | 2 |
| 8 | Rata-rata durasi penyelesaian | Hari | 3 |

Nama, ID karyawan, alamat, nomor telepon, agama, dan informasi sensitif lainnya tidak digunakan dalam perhitungan K-Means. ID karyawan hanya digunakan untuk menghubungkan hasil cluster dengan data pada aplikasi.

## 7. Sumber Data

Data utama dapat diperoleh dari:

1. Rekap absensi karyawan.
2. Riwayat tugas yang diberikan.
3. Status tugas selesai atau belum selesai.
4. Ketepatan penyelesaian terhadap tenggat waktu.
5. Penilaian kualitas hasil pekerjaan oleh atasan.
6. Formulir evaluasi kedisiplinan.
7. Jumlah tugas aktif pada periode penilaian.

Jika riwayat digital belum lengkap, perusahaan dapat menggunakan rekap manual, dokumen pekerjaan, dan formulir penilaian supervisor untuk membentuk dataset awal.

Dataset Kaggle hanya digunakan untuk latihan kode, pengujian awal aplikasi, atau pembanding. Dataset tersebut tidak dijadikan data utama PT Central Saga Mandala.

## 8. Struktur Dataset

Contoh struktur data:

| ID | Kehadiran | Tugas Selesai | Tepat Waktu | Kualitas | Kedisiplinan | Tugas Aktif | Terlambat |
|---|---:|---:|---:|---:|---:|---:|---:|
| K001 | 95 | 90 | 88 | 87 | 92 | 3 | 1 |
| K002 | 87 | 82 | 80 | 85 | 84 | 6 | 2 |
| K003 | 96 | 94 | 93 | 91 | 95 | 2 | 0 |

Dataset final berisi 30 baris apabila satu baris mewakili satu karyawan pada satu periode penilaian.

## 9. Rancangan Cluster

Tiga cluster awal yang diharapkan adalah:

| Cluster | Interpretasi | Penggunaan dalam penugasan |
|---|---|---|
| Cluster 1 | Kinerja tinggi dan beban kerja rendah | Dapat menjadi kandidat utama untuk tugas baru |
| Cluster 2 | Kinerja baik tetapi beban kerja tinggi | Dipertimbangkan setelah beban kerja berkurang |
| Cluster 3 | Kinerja perlu ditingkatkan | Diberikan tugas sesuai kemampuan dengan pendampingan |

Nama dan makna cluster tersebut tidak ditentukan sebelum proses sebagai jawaban yang dipaksakan. Setelah K-Means menghasilkan kelompok, peneliti melihat nilai rata-rata pusat cluster (*centroid*) dan memberikan interpretasi bersama pihak perusahaan.

## 10. Hubungan Clustering dengan Penugasan

Hasil K-Means tidak langsung menentukan karyawan untuk sebuah tugas. Sistem melakukan dua tahap:

1. **Clustering:** mengidentifikasi kondisi kinerja dan beban kerja karyawan.
2. **Penyaringan kandidat:** memeriksa kesesuaian keahlian, divisi, jabatan, beban kerja, dan kebutuhan tugas.

Contoh: apabila terdapat tugas desain, sistem terlebih dahulu memilih karyawan yang memiliki keahlian desain. Setelah itu, sistem menampilkan kondisi cluster dan beban kerja setiap kandidat. Manajer tetap menentukan keputusan akhirnya.

## 11. Tahapan Pengolahan Machine Learning

1. Mengumpulkan data 30 karyawan.
2. Membersihkan data kosong, ganda, atau tidak konsisten.
3. Memilih variabel numerik yang relevan.
4. Melakukan normalisasi menggunakan *StandardScaler* atau *MinMaxScaler*.
5. Menggunakan *Elbow Method* untuk melihat kandidat jumlah cluster.
6. Menjalankan K-Means dengan beberapa nilai jumlah cluster.
7. Menghitung *Silhouette Score*.
8. Memilih jumlah cluster yang paling masuk akal secara matematis dan operasional.
9. Membaca nilai centroid setiap cluster.
10. Memvalidasi interpretasi cluster bersama pihak perusahaan.
11. Menampilkan hasil clustering pada aplikasi web.

## 12. Evaluasi Model

### 12.1 Elbow Method

Digunakan untuk membandingkan nilai *Within-Cluster Sum of Squares* pada beberapa pilihan jumlah cluster. Metode ini membantu menemukan titik ketika penambahan cluster tidak lagi memberikan penurunan variasi yang besar.

### 12.2 Silhouette Score

Digunakan untuk melihat tingkat kedekatan anggota dalam cluster yang sama dan pemisahannya dari cluster lain. Nilainya berada pada rentang -1 sampai 1. Nilai yang lebih tinggi secara umum menunjukkan pemisahan cluster yang lebih baik.

### 12.3 Validasi pihak perusahaan

HR, supervisor, atau pimpinan diminta menilai:

- apakah karakteristik setiap cluster dapat dipahami;
- apakah anggota cluster memiliki kondisi yang masuk akal;
- apakah hasil cluster membantu proses penugasan; dan
- apakah rekomendasi tidak bertentangan dengan kondisi operasional.

## 13. Paragraf Alasan Pemilihan 30 Karyawan

Paragraf berikut dapat digunakan dalam proposal atau laporan:

> Penelitian ini menggunakan data 30 karyawan PT Central Saga Mandala sebagai objek pengolahan K-Means Clustering. Jumlah tersebut dipilih berdasarkan ketersediaan populasi yang sesuai dengan ruang lingkup penelitian dan digunakan untuk membentuk tiga kelompok kondisi kinerja dan beban kerja karyawan. K-Means tidak menetapkan jumlah minimum data secara mutlak, sehingga kelayakan hasil tidak hanya ditentukan oleh jumlah objek, tetapi juga oleh kualitas variabel, proses normalisasi, evaluasi cluster, dan kesesuaian hasil dengan kondisi perusahaan. Karena jumlah data relatif terbatas, hasil penelitian diposisikan sebagai analisis eksploratif dan pendukung keputusan internal, bukan sebagai model yang dapat digeneralisasi untuk seluruh perusahaan. Kualitas cluster dievaluasi menggunakan Elbow Method, Silhouette Score, serta validasi dari pihak PT Central Saga Mandala.

## 14. Jawaban Singkat Jika Ditanya Dosen

**Pertanyaan:** Mengapa hanya menggunakan 30 karyawan?

**Jawaban:**

> Penelitian menggunakan 30 karyawan karena jumlah tersebut sesuai dengan populasi yang tersedia dan ruang lingkup PT Central Saga Mandala. Seluruh data yang memenuhi kriteria digunakan sehingga pendekatannya dapat disebut total sampling apabila 30 orang tersebut merupakan seluruh populasi sasaran. K-Means tidak mempunyai batas minimum resmi, tetapi karena datanya terbatas, penelitian dibatasi sebagai analisis eksploratif. Hasilnya tidak langsung digeneralisasi dan tetap diuji menggunakan Elbow Method, Silhouette Score, serta validasi pihak perusahaan.

**Pertanyaan:** Apakah tiga cluster pasti masing-masing berisi 10 orang?

**Jawaban:**

> Tidak. Angka 10 orang hanya perbandingan rata-rata dari 30 data dan tiga cluster. K-Means membagi data berdasarkan kemiripan, sehingga jumlah anggota setiap cluster dapat berbeda.

**Pertanyaan:** Mengapa tidak menggunakan prediksi kinerja?

**Jawaban:**

> Prediksi kinerja membutuhkan data historis dan target hasil yang lebih banyak. Dengan kondisi data perusahaan yang masih terbatas, clustering lebih realistis karena tidak memerlukan label hasil sebelumnya.

## 15. Kesimpulan

Penerapan machine learning yang direkomendasikan adalah **K-Means Clustering dengan data 30 karyawan**. Algoritma digunakan untuk mengelompokkan kondisi kinerja dan beban kerja karyawan sebagai informasi pendukung penugasan.

Penggunaan 30 karyawan dapat diterima untuk penelitian internal yang bersifat eksploratif selama peneliti:

- tidak menyatakan bahwa 30 merupakan batas minimum resmi K-Means;
- menggunakan data asli dan berkualitas;
- membatasi jumlah cluster;
- melakukan normalisasi data;
- mengevaluasi hasil secara kuantitatif;
- meminta validasi pihak perusahaan; dan
- menjelaskan bahwa keputusan akhir tetap berada pada manajer.
