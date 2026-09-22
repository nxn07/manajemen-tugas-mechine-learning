# K-Means Clustering Frontend - Guide

## Overview

Dashboard interaktif untuk visualisasi dan manajemen hasil K-Means Clustering karyawan di SIM Kinerja PT Central Saga Mandala.

## Fitur Utama

### 1. **Dashboard Real-time**
- Statistik kuantitas (jumlah karyawan, kualitas model, jumlah cluster)
- Update langsung dari backend API
- Loading states yang smooth

### 2. **Kontrol Periode & Cluster**
- Pilih periode evaluasi (YYYY-MM format)
- Sesuaikan jumlah cluster (2-5 clusters)
- Ekstrak fitur karyawan sebelum clustering
- Run K-Means dengan satu klik

### 3. **Visualisasi Cluster**
- Tabel detail per cluster dengan informasi lengkap
- Interpretasi otomatis: "High Performers", "Moderate Performers", dll
- Distance calculation ke centroid
- Rata-rata skor per cluster

### 4. **Quality Metrics**
- Silhouette Score visualization (indikator kualitas clustering)
- Davies-Bouldin Index (cluster separation)
- Calinski-Harabasz Score (cluster compactness)
- Distribusi karyawan per cluster

### 5. **Export & Download**
- Export hasil ke CSV
- Detail lengkap setiap karyawan dalam cluster
- Format mudah dibaca dan di-share

## Cara Menggunakan

### Langkah 1: Ekstrak Fitur
1. Pilih periode evaluasi (month/year picker)
2. Klik tombol "Ekstrak Fitur"
3. Tunggu proses selesai (~2-5 detik)
4. Sistem menghitung 8 fitur untuk setiap karyawan

### Langkah 2: Jalankan Clustering
1. Pilih jumlah cluster (recommended: 3)
2. Klik "Run Clustering"
3. Sistem menjalankan algoritma K-Means
4. Tunggu hasil (silhouette score ditampilkan)

### Langkah 3: Lihat Hasil
1. Cluster ditampilkan dalam card terpisah
2. Setiap cluster punya label interpretasi otomatis
3. Tabel menampilkan semua karyawan beserta distance ke centroid
4. Rata-rata skor dihitung dari features utama

### Langkah 4: Export (Opsional)
1. Klik icon download di header cluster
2. File CSV otomatis terdownload
3. Buka dengan Excel atau spreadsheet app

## Struktur Data

### Input API
```json
{
  "period": "2026-09",
  "n_clusters": 3
}
```

### Output API
```json
{
  "period": "2026-09",
  "silhouette_score": 0.523,
  "quality_interpretation": "Good/Reasonable clustering",
  "n_clusters": 3,
  "cluster_distribution": {
    "0": 10,
    "1": 12,
    "2": 8
  },
  "clusters": {
    "0": [
      {
        "employee_id": 1,
        "name": "John Doe",
        "position": "Backend Developer",
        "division": "IT & Software",
        "distance_to_centroid": 1.2345
      }
    ]
  },
  "interpretations": {
    "0": "High performers",
    "1": "Moderate performers",
    "2": "Developing performers"
  }
}
```

## Technical Details

### Framework
- Next.js 14+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React icons

### State Management
- React useState hooks
- Client-side only components
- Direct API calls via axios

### Performance Optimization
- Optimistic UI updates
- Loading states for better UX
- Toast notifications feedback
- Smooth animations

## Access Control

Menu "IntelliML Cluster" tersedia untuk role:
- ✅ ADMIN
- ✅ MANAGER  
- ❌ EMPLOYEE

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Issue: "Belum ada data clustering"
**Solusi:** 
1. Pastikan sudah klik "Ekstrak Fitur" terlebih dahulu
2. Verify database punya >= 5 employees dengan task history
3. Check Python environment accessible dari server

### Issue: Low Silhouette Score (< 0.3)
**Solusi:**
1. Coba dengan jumlah cluster berbeda (2 atau 4)
2. Kumpulkan lebih banyak historical data
3. Review feature quality (missing values, etc)

### Issue: Export Failed
**Solusi:**
1. Check browser popup blocker setting
2. Manual: Call API endpoint directly via curl/postman
3. Clear browser cache dan refresh

## Development

### Local Testing
```bash
cd frontend
npm run dev
# Visit http://localhost:3000/ml-clustering
```

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Future Enhancements

Planned features:
- 📊 Interactive charts (Recharts/ECharts)
- 📈 Historical comparison (multi-month view)
- 🔔 Email notification when clustering complete
- 📑 PDF report generation
- 💾 Auto-schedule monthly clustering
- 🎨 Color coding based on performance tiers

---

**Last Updated:** September 22, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
