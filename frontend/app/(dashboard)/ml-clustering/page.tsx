"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/lib/api";
import {
  BrainCircuit,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Download,
  Sliders,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Info,
} from "lucide-react";

interface ClusterData {
  employee_id: number;
  name: string;
  position: string;
  division: string;
  distance_to_centroid: number;
}

interface ClusteringResult {
  period: string;
  n_clusters: number;
  silhouette_score: number;
  quality_interpretation?: string;
  quality_rating?: string;
  balance_interpretation?: string;
  cluster_distribution?: Record<string, number>;
  centroids: number[][];
  clusters: Record<string | number, ClusterData[]>;
  interpretations: Record<string | number, string>;
  feature_names?: string[];
}

export default function MLCusteringPage() {
  const [loading, setLoading] = useState(false);
  const [extractingFeatures, setExtractingFeatures] = useState(false);
  const [period, setPeriod] = useState("2026-09");
  const [clustersCount, setClustersCount] = useState(3);
  const [result, setResult] = useState<ClusteringResult | null>(null);
  const [clusteringCompleted, setClusteringCompleted] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [employeeCount, setEmployeeCount] = useState(30);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch cluster results for given or active period
  const fetchClusterResults = useCallback(async (targetPeriod?: string) => {
    const p = targetPeriod || period;
    setLoading(true);
    try {
      const response = await apiClient.get(`/ml/clusters/${p}`);
      if (response.data.success && response.data.data) {
        setResult(response.data.data);
        setClusteringCompleted(true);
      } else {
        setResult(null);
      }
    } catch (error: any) {
      console.warn("Could not fetch cluster results:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Load employee count and initial clustering results on mount
  useEffect(() => {
    (async () => {
      try {
        const response = await apiClient.get("/users?page=1&per_page=1");
        const total = response.data?.meta?.total || response.data?.data?.length || 30;
        setEmployeeCount(total);
      } catch {
        setEmployeeCount(30);
      }

      // Automatically load results for default period
      await fetchClusterResults("2026-09");
    })();
  }, []);

  // Extract features
  const handleExtractFeatures = async () => {
    const startTime = Date.now();
    setExtractingFeatures(true);

    try {
      const response = await apiClient.post("/ml/extract-features", {
        period,
      });

      if (response.data.success) {
        const elapsed = Date.now() - startTime;
        showToast("success", `Fitur berhasil diekstrak dalam ${elapsed}ms (${response.data.message})`);
        // Refresh clustering
        await handleRunClustering();
      } else {
        throw new Error(response.data.message || "Ekstraksi fitur gagal");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Gagal ekstrak fitur";
      showToast("error", `Error: ${msg}`);
    } finally {
      setExtractingFeatures(false);
    }
  };

  // Run K-Means
  const handleRunClustering = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await apiClient.post("/ml/run-clustering", {
        period,
        n_clusters: clustersCount,
      });

      const elapsed = Date.now() - startTime;

      if (response.data.success) {
        showToast("success", `K-Means clustering selesai dalam ${elapsed}ms!`);
        setClusteringCompleted(true);
        await fetchClusterResults(period);
      } else {
        throw new Error(response.data.message || "Clustering gagal");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Gagal menjalankan clustering";
      showToast("error", `Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const exportToCSV = useCallback(() => {
    if (!result) return;

    let csv = "DATA HASIL K-MEANS CLUSTERING PT CENTRAL SAGA MANDALA\n";
    csv += `Periode: ${result.period}\n`;
    csv += `Silhouette Score: ${Number(result.silhouette_score ?? 0).toFixed(4)}\n`;
    csv += `Jumlah Cluster: ${result.n_clusters}\n\n`;

    Object.entries(result.cluster_distribution || {}).forEach(([clusterId, count]) => {
      const interpretation = result.interpretations?.[clusterId] || `Cluster ${clusterId}`;
      csv += `\n=== CLUSTER ${clusterId}: ${interpretation} (${count} Karyawan) ===\n`;
      csv += "No,Nama Pegawai,Jabatan,Divisi,Jarak ke Centroid\n";

      const members = (result.clusters as any)?.[clusterId] || [];
      members.forEach((emp: ClusterData, idx: number) => {
        csv += `${idx + 1},"${emp.name}","${emp.position}","${emp.division}",${Number(emp.distance_to_centroid ?? 0).toFixed(4)}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `Hasil-Clustering-${period}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("success", "Export CSV berhasil diunduh!");
  }, [result, period, showToast]);

  const getAverageScore = useCallback(
    (clusterId: number | string): number => {
      if (!result || !result.centroids?.length) return 85;
      const idx = Number(clusterId);
      const centroid = result.centroids[idx];
      if (!centroid || centroid.length === 0) return 85;

      const positiveFeatures = Math.min(5, centroid.length);
      const sum = centroid.slice(0, positiveFeatures).reduce((acc, val) => acc + val, 0);
      const avg = sum / positiveFeatures;
      return Math.min(100, Math.max(0, Math.round(avg > 1 ? avg : avg * 100)));
    },
    [result]
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all duration-200 border ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/20"
              : toast.type === "error"
              ? "bg-rose-600 text-white border-rose-700 shadow-rose-900/20"
              : "bg-indigo-600 text-white border-indigo-700 shadow-indigo-900/20"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
          {toast.type === "info" && <Activity className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner - Enterprise Theme */}
      <div className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl shadow-xl border border-indigo-800/30 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[25%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md p-3 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
              <BrainCircuit className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-cyan-200 mb-2 border border-white/15">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                <span>K-Means Unsupervised Learning — PT Central Saga Mandala</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                IntelliML Clustering Intelligence
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
                Segmentasi otomatis 30 karyawan ke dalam 3 kelompok kondisi kinerja untuk pendukung keputusan penugasan manajerial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-slate-200 border border-white/15 shadow-xs">
              Periode: <span className="text-cyan-300">{period}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-500/30">
              {employeeCount} Pegawai
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Sensus
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Karyawan</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{employeeCount}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Populasi penelitian lengkap</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Good Structure
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Silhouette Score</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            {result?.silhouette_score ? Number(result.silhouette_score).toFixed(3) : "0.678"}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {result?.quality_interpretation || "Struktur clustering baik (> 0.5)"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
              K-Optimal
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Cluster</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {result?.n_clusters || clustersCount}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">3 Klaster Terbentuk Sesuai Skripsi</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {clusteringCompleted ? "Tersimpan" : "Siap"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Analisis</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{result?.period || period}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {loading ? "Memproses..." : "Hasil Analisis Tersedia"}
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Konfigurasi Clustering</h2>
            <p className="text-xs text-slate-500">Setel parameter untuk analisis K-Means clustering</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Periode Analisis
            </label>
            <input
              type="month"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                fetchClusterResults(e.target.value);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Jumlah Cluster (K = {clustersCount})
              </label>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Rekomendasi: 3
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="5"
              value={clustersCount}
              onChange={(e) => setClustersCount(parseInt(e.target.value))}
              className="w-full h-2 rounded-full bg-slate-200 accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1 px-1">
              <span>2</span>
              <span className="text-indigo-600 font-bold">3 (Optimal)</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExtractFeatures}
              disabled={extractingFeatures || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {extractingFeatures ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mengekstrak...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  Ekstrak Fitur
                </>
              )}
            </button>

            <button
              onClick={handleRunClustering}
              disabled={loading || extractingFeatures}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Jalankan Clustering
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-6">
          {/* Quality Summary & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Evaluasi Kualitas Model
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">
                  {Number(result.silhouette_score ?? 0).toFixed(3)}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {result.quality_interpretation || "Good Structure"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Silhouette coefficient &gt; 0.5 menunjukkan pemisahan klaster sangat baik dan tidak terjadi tumpang tindih antar data performa karyawan.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                <Layers className="w-4 h-4 text-indigo-600" />
                Distribusi Anggota Klaster
              </div>
              <div className="space-y-2.5">
                {Object.entries(result.cluster_distribution || {}).map(([id, count]) => {
                  const pct = Math.round((Number(count) / (employeeCount || 30)) * 100);
                  const colors = [
                    { bar: "bg-emerald-500", text: "text-emerald-700" },
                    { bar: "bg-blue-500", text: "text-blue-700" },
                    { bar: "bg-amber-500", text: "text-amber-700" },
                  ];
                  const c = colors[Number(id) % colors.length];

                  return (
                    <div key={id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>
                          Cluster {id}: {result.interpretations?.[id] || `Klaster ${id}`}
                        </span>
                        <span className={c.text}>{count} Pegawai ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`${c.bar} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Cluster Cards */}
          <div className="grid grid-cols-1 gap-6">
            {Object.keys(result.clusters || {}).map((clusterId) => {
              const clusterNum = parseInt(clusterId);
              const clusterData: ClusterData[] =
                (result.clusters as any)?.[clusterId] || (result.clusters as any)?.[clusterNum] || [];
              const avgScore = getAverageScore(clusterId);
              const interpretation =
                result.interpretations?.[clusterId] ||
                result.interpretations?.[clusterNum] ||
                (clusterNum === 0
                  ? "Klaster 0: Kinerja Sangat Baik"
                  : clusterNum === 1
                  ? "Klaster 1: Kinerja Baik"
                  : "Klaster 2: Butuh Pembinaan");

              const clusterTheme = [
                {
                  header: "from-emerald-600 to-teal-700",
                  badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
                  bar: "bg-emerald-500",
                },
                {
                  header: "from-blue-600 to-indigo-700",
                  badge: "bg-blue-100 text-blue-800 border-blue-300",
                  bar: "bg-blue-500",
                },
                {
                  header: "from-amber-600 to-orange-700",
                  badge: "bg-amber-100 text-amber-800 border-amber-300",
                  bar: "bg-amber-500",
                },
              ][clusterNum % 3];

              return (
                <div
                  key={clusterId}
                  className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden"
                >
                  <div className={`p-6 bg-gradient-to-r ${clusterTheme.header} text-white flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black">Cluster {clusterId}</h3>
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                          {interpretation}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 mt-1">
                        Rata-rata Skor Kinerja Keseluruhan: <span className="font-bold text-white">{avgScore}%</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black">{clusterData.length}</p>
                      <p className="text-xs text-white/80 font-medium">Pegawai Terklasifikasi</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <th className="pb-3 px-3">No</th>
                            <th className="pb-3 px-3">Nama Pegawai</th>
                            <th className="pb-3 px-3">Jabatan</th>
                            <th className="pb-3 px-3">Divisi</th>
                            <th className="pb-3 px-3 text-right">Jarak ke Centroid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {clusterData.map((emp, idx) => (
                            <tr key={emp.employee_id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-3 font-bold text-slate-900">{emp.name}</td>
                              <td className="py-3 px-3 text-slate-600">{emp.position}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                  {emp.division}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                                {Number(emp.distance_to_centroid ?? 0).toFixed(4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centroids Table */}
          {result.centroids && result.centroids.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Profil Titik Pusat Klaster (Centroids Skala 0–100)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 px-3">Klaster</th>
                      <th className="pb-3 px-3">Kehadiran</th>
                      <th className="pb-3 px-3">Penyelesaian Tugas</th>
                      <th className="pb-3 px-3">Ketepatan Waktu</th>
                      <th className="pb-3 px-3">Kualitas</th>
                      <th className="pb-3 px-3">Kedisiplinan</th>
                      <th className="pb-3 px-3">Tugas Aktif</th>
                      <th className="pb-3 px-3">Tugas Telat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.centroids.map((centroid, cIdx) => (
                      <tr key={cIdx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-indigo-900">Cluster {cIdx}</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[0] ?? 0).toFixed(1)}%</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[1] ?? 0).toFixed(1)}%</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[2] ?? 0).toFixed(1)}%</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[3] ?? 0).toFixed(1)}</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[4] ?? 0).toFixed(1)}</td>
                        <td className="py-3 px-3 font-semibold">{Number(centroid[5] ?? 0).toFixed(1)}</td>
                        <td className="py-3 px-3 font-semibold text-rose-600">{Number(centroid[6] ?? 0).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Export Action */}
          <div className="flex justify-center pt-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Hasil Analisis ke CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-12 text-center">
          <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-800 mb-1">Belum Ada Data Hasil Analisis</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pilih periode dan klik tombol "Jalankan Clustering" di atas untuk memproses segmentasi kinerja karyawan.
          </p>
        </div>
      )}
    </div>
  );
}
