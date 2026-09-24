# 🤖 Modul Machine Learning - SIM Kinerja PT Central Saga Mandala

Modul ini mengimplementasikan algoritma **K-Means Clustering** tanpa ketergantungan framework eksternal yang rumit, dirancang khusus untuk memproses dan mengelompokkan data kinerja karyawan secara otomatis dan objektif.

---

## 📁 Struktur Direktori

```text
machine_learning/
├── config/
│   └── ml_config.py          # Konfigurasi parameter (k=3, bobot fitur, threshold)
├── src/
│   ├── __init__.py           # Inisialisasi package ML
│   ├── data_loader.py        # Pengambil data dari SQLite / JSON
│   ├── preprocessor.py       # Normalisasi data (StandardScaler z-score)
│   ├── kmeans_engine.py      # Pelatihan K-Means & perhitungan Silhouette Score
│   └── interpreter.py        # Penerjemah centroid menjadi label kinerja manusiawi
├── tests/
│   └── test_clustering.py    # Unit test otomatis
├── run_clustering.py         # Entry point CLI runner
├── requirements.txt          # Dependensi Python (scikit-learn, numpy, pandas)
└── README.md                 # Dokumentasi ini
```

---

## 📊 8 Fitur Metrik Kinerja yang Dianalisis

1. **`attendance_percentage`**: Persentase kehadiran bulanan.
2. **`tasks_completed_percentage`**: Rasio tugas selesai dibanding total penugasan.
3. **`on_time_percentage`**: Rasio tugas selesai tepat waktu sebelum batas deadline.
4. **`quality_score`**: Rata-rata nilai kualitas tugas dari manajer/reviewer.
5. **`discipline_score`**: Skor kedisiplinan dan absensi tepat waktu.
6. **`active_tasks_count`**: Beban kerja aktif saat ini.
7. **`late_tasks_count`**: Jumlah tugas yang terlambat diserahkan.
8. **`avg_resolution_days`**: Rata-rata durasi penyelesaian tugas (hari).

---

## 🔬 Metodologi Algoritma

1. **Normalisasi Data (StandardScaler)**:
   $$z = \frac{x - \mu}{\sigma}$$
   Menyamakan skala dari seluruh fitur agar fitur dengan rentang besar tidak mendominasi fitur lainnya.
2. **K-Means Clustering ($k=3$)**:
   Inisialisasi menggunakan metode `k-means++` untuk konvergensi optimal dan menghindari lokal minima.
3. **Validasi Model (Silhouette Score)**:
   $$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$
   Menilai kualitas pemisahan dan kerapatan klaster.
4. **Klasterisasi Otomatis**:
   - **Klaster Kinerja Tinggi (High Performers)**: Skor kualitas, ketepatan waktu, dan penyelesaian tugas tertinggi.
   - **Klaster Kinerja Sedang (Medium Performers)**: Memenuhi standar kinerja rata-rata.
   - **Klaster Kinerja Rendah (Low Performers)**: Tingkat keterlambatan tinggi, perlu pembinaan lebih lanjut.

---

## 🚀 Cara Menjalankan

### 1. Eksekusi Menggunakan Database SQLite (Default Sistem)
```bash
python machine_learning/run_clustering.py --source sqlite --clusters 3 --period 2026-09
```

### 2. Simpan Hasil ke File JSON
```bash
python machine_learning/run_clustering.py --source sqlite --clusters 3 --output hasil_clustering.json
```

### 3. Eksekusi dari File JSON Input
```bash
python machine_learning/run_clustering.py --source json --input storage/app/ml_input.json --clusters 3
```

### 4. Menjalankan Unit Test
```bash
python machine_learning/tests/test_clustering.py
```
