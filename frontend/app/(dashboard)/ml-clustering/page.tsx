"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Footer from "@/components/shared/Footer";
import apiClient from "@/lib/api";
import { BrainCircuit, TrendingUp, Users, Target, BarChart3, Activity, CheckCircle2, AlertCircle, Play, RefreshCw, Download } from "lucide-react";
import Link from "next/link";

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
  balance_interpretation?: string;
  cluster_distribution?: Record<string, number>;
  centroids: number[][];
  clusters: {
    0: ClusterData[];
    1: ClusterData[];
    2: ClusterData[];
  };
  interpretations: Record<number, string>;
}

export default function MLCusteringPage() {
  const [loading, setLoading] = useState(false);
  const [extractingFeatures, setExtractingFeatures] = useState(false);
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [clustersCount, setClustersCount] = useState(3);
  const [result, setResult] = useState<ClusteringResult | null>(null);
  const [clusteringCompleted, setClusteringCompleted] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  
  // Refs for avoiding re-renders
  const startTimeRef = useRef<number>(Date.now());

  // Instant toast notification - no delay
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch ALL data immediately on mount - NO DELAY
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    (async () => {
      try {
        console.log(`🚀 ${new Date().toLocaleTimeString()} - Fetching employee count...`);
        
        const response = await apiClient.get("/users?page=1&per_page=1");
        const total = response.data?.meta?.total || response.data?.data?.length || 0;
        setEmployeeCount(total);
        
        const loadTime = Date.now() - startTimeRef.current;
        console.log(`✅ Employee count loaded in ${loadTime}ms: ${total}`);
        
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Could not fetch employee count: ${errorMsg}`);
        // Don't crash if this fails
      }
    })();
  }, []);

  // Extract features with instant feedback
  const handleExtractFeatures = async () => {
    const startTime = Date.now();
    setExtractingFeatures(true);
    setLastError(null);
    
    try {
      console.log(`🔍 Extracting features for period ${period} at ${new Date().toLocaleTimeString()}`);
      
      const response = await apiClient.post("/ml/extract-features", {
        period,
      });

      if (response.data.success) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ Feature extraction done in ${elapsed}ms`);
        
        showToast("success", `✅ Fitur berhasil diekstrak dalam ${elapsed}ms! (${response.data.message})`);
        setResult(null);
        setClusteringCompleted(false);
      } else {
        throw new Error(response.data.message || 'Feature extraction failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED';
      
      if (isNetworkError) {
        showToast(
          "error",
          `Backend tidak bisa diakses!\n\nPastikan Laravel running:\n· podman-compose up -d\n\nRetry otomatis...`
        );
        
        // Auto retry after 2 seconds
        await new Promise(r => setTimeout(r, 2000));
        handleExtractFeatures(); // Retry
      } else {
        showToast("error", `Error: ${errorMessage}`);
      }
      
      setLastError(errorMessage);
    } finally {
      setExtractingFeatures(false);
    }
  };

  // Run K-Means with progress tracking
  const handleRunClustering = async () => {
    setLoading(true);
    setLastError(null);
    
    const startTime = Date.now();
    console.log(`🤖 Running K-Means clustering at ${new Date().toLocaleTimeString()}`);
    
    try {
      const response = await apiClient.post("/ml/run-clustering", {
        period,
        n_clusters: clustersCount,
      });

      const elapsed = Date.now() - startTime;
      console.log(`✅ Clustering completed in ${elapsed}ms`);

      if (response.data.success) {
        showToast("success", `✨ K-means clustering selesai dalam ${elapsed}ms!`);
        setClusteringCompleted(true);
        
        // Fetch results immediately
        setTimeout(() => fetchClusterResults(), 500);
      } else {
        throw new Error(response.data.message || 'Clustering failed');
      }
    } catch (error: unknown) {
      const elapsed = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Clustering failed after ${elapsed}ms:`, errorMessage);
      
      showToast("error", `Gagal menjalankan clustering setelah ${elapsed}ms:\n${errorMessage}`);
      setLastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Optimized result fetching
  const fetchClusterResults = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/ml/clusters/${period}`);

      if (response.data.success) {
        setResult(response.data.data);
        showToast("success", "Hasil clustering ditemukan!");
      } else {
        setResult(null);
        showToast("info", "Belum ada data clustering untuk periode ini");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setResult(null);
        showToast("info", "Belum ada data clustering untuk periode ini");
      } else {
        showToast("error", "Gagal mengambil hasil clustering");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fast CSV export
  const exportToCSV = useCallback(() => {
    if (!result) return;

    const startTime = performance.now();
    
    let csvContent = "DATA HASIL K-MEANS CLUSTERING\n";
    csvContent += `Periode: ${result.period}\n`;
    csvContent += `Silhouette Score: ${result.silhouette_score}\n`;
    csvContent += `Jumlah Cluster: ${result.n_clusters}\n\n`;

    result.cluster_distribution?.forEach((count, clusterId) => {
      csvContent += `\nCLUSTER ${clusterId} (${result.interpretations[clusterId] || 'N/A'})\n`;
      csvContent += `Jumlah Anggota: ${count}\n`;
      csvContent += "\nDetail Karyawan:\n";
      csvContent += "No,Nama,Kepantern,Bagian,Distance ke Centroid\n";

      result.clusters[clusterId]?.forEach((emp: ClusterData, idx: number) => {
        csvContent += `${idx + 1},${emp.name},${emp.position},${emp.division},${emp.distance_to_centroid.toFixed(4)}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clustering-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const exportTime = Math.round(performance.now() - startTime);
    console.log(`✅ CSV exported in ${exportTime}ms`);
    showToast("success", "Export selesai!");
  }, [result, period, showToast]);

  // Memoized calculation
  const getAverageScore = useCallback((clusterId: number): number => {
    if (!result || !result.centroids.length) return 0;
    const centroid = result.centroids[clusterId];
    if (!centroid || centroid.length === 0) return 0;
    
    const positiveFeatures = Math.min(5, centroid.length);
    const sum = centroid.slice(0, positiveFeatures).reduce((acc, val) => acc + val, 0);
    return Math.round((sum / positiveFeatures) * 100) / 100;
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-900"
              : toast.type === "error"
              ? "bg-red-50 border-2 border-red-500 text-red-900"
              : "bg-blue-50 border-2 border-blue-500 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
            {toast.type === "info" && <Activity className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-900 text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-lg p-3 flex items-center justify-center border border-white/20 shadow-2xl">
                <BrainCircuit className="w-12 h-12 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  IntelliML Clustering Intelligence
                </h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Sistem Machine Learning untuk mengelompokkan karyawan berdasarkan kinerja dan beban kerja.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 transition-all group self-start md:self-center"
            >
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Users className="w-10 h-10 text-blue-600" />}
            title="Total Karyawan"
            value={employeeCount.toString()}
            subtitle="Data real-time"
            color="blue"
            loading={employeeCount === 0}
            onClick={fetchClusterResults}
          />

          <StatCard 
            icon={<BarChart3 className="w-10 h-10 text-emerald-600" />}
            title="Kualitas Model"
            value={(result?.silhouette_score || "N/A").toString()}
            subtitle={result?.quality_interpretation || "Menunggu hasil"}
            color="emerald"
          />

          <StatCard 
            icon={<Target className="w-10 h-10 text-violet-600" />}
            title="Kategori Karyawan"
            value={(result?.n_clusters || clustersCount).toString()}
            subtitle="High, Medium, Low"
            color="violet"
          />

          <StatCard 
            icon={<RefreshCw className="w-10 h-10 text-orange-600" />}
            title="Status Periode"
            value={result?.period || period}
            subtitle={clusteringCompleted ? "✓ Selesai" : loading ? "Processing..." : "Belum ada"}
            color="orange"
          />
        </div>

        {/* Configuration Panel */}
        <ConfigurationPanel
          period={period}
          setPeriod={setPeriod}
          clustersCount={clustersCount}
          setClustersCount={setClustersCount}
          extractingFeatures={extractingFeatures}
          onExtractFeatures={handleExtractFeatures}
          onRunClustering={handleRunClustering}
          loading={loading}
          clusteringCompleted={clusteringCompleted}
        />

        {/* Results Section */}
        {result && (
          <ResultsSection result={result} employeeCount={employeeCount} getAverageScore={getAverageScore} exportToCSV={exportToCSV} />
        )}

        {/* Empty State */}
        {!result && !loading && !extractingFeatures && (
          <EmptyState />
        )}
      </div>

      <Footer />
    </div>
  );
}

// Helper Components for Better Performance
function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color,
  loading = false,
  onClick
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, string> = {
    blue: "border-l-4 border-blue-500",
    emerald: "border-l-4 border-emerald-500",
    violet: "border-l-4 border-violet-500",
    orange: "border-l-4 border-orange-500",
  };

  return (
    <div className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-gray-100 ${colorClasses[color]} hover:-translate-y-1 cursor-pointer ${onClick ? 'hover:cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>{icon}</div>
        {onClick && (
          <TrendingUp className="w-6 h-6 text-gray-400 opacity-50" onClick={onClick} />
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className={`text-3xl font-bold ${loading ? 'animate-pulse text-gray-300' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}

function ConfigurationPanel({
  period,
  setPeriod,
  clustersCount,
  setClustersCount,
  extractingFeatures,
  onExtractFeatures,
  onRunClustering,
  loading,
  clusteringCompleted
}: any) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konfigurasi Clustering</h2>
          <p className="text-gray-500 text-sm">Setel parameter untuk analisis clustering</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Periode Analisis</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Cluster ({clustersCount})</label>
          <input
            type="range"
            min="2"
            max="5"
            value={clustersCount}
            onChange={(e) => setClustersCount(parseInt(e.target.value))}
            className="w-full h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>

        <div className="flex items-end gap-3">
          {!clusteringCompleted && !loading && (
            <button
              onClick={onExtractFeatures}
              disabled={extractingFeatures}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extractingFeatures ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Ekstraksi Fitur...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  Ekstrak Fitur
                </>
              )}
            </button>
          )}

          <button
            onClick={onRunClustering}
            disabled={loading || extractingFeatures}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Jalankan Clustering
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsSection({ result, employeeCount, getAverageScore, exportToCSV }: any) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kualitas Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
            <div className="flex items-start gap-4">
              <SparklesIcon className="w-8 h-8 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm text-emerald-700 font-semibold mb-1">Silhouette Score</p>
                <p className="text-4xl font-bold text-emerald-900">
                  {parseFloat(result.silhouette_score.toFixed(3))}
                </p>
                <p className="text-sm text-emerald-600 mt-2">{result.quality_interpretation}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
            <div className="flex items-start gap-4">
              <UsersIcon className="w-8 h-8 text-violet-600 mt-1" />
              <div>
                <p className="text-sm text-violet-700 font-semibold mb-1">Distribusi Anggota</p>
                <div className="space-y-2">
                  {Object.entries(result.cluster_distribution || {}).map(([id, count]: any) => (
                    <div key={id} className="flex items-center gap-3">
                      <div className="flex-1 bg-violet-200 rounded-full h-3">
                        <div
                          className="bg-violet-600 h-3 rounded-full transition-all"
                          style={{ width: `${(count / employeeCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-violet-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.keys(result.clusters).map((clusterId: any) => {
          const clusterNum = parseInt(clusterId);
          const clusterData = result.clusters[clusterNum];
          const avgScore = getAverageScore(clusterNum);

          return (
            <div key={clusterId} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      Cluster {clusterId}
                      <TargetIcon className="w-6 h-6" />
                    </h3>
                    <p className="text-blue-100 mt-1">{result.interpretations[clusterNum]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{clusterData.length}</p>
                    <p className="text-blue-100 text-sm">Anggota</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Skor Kinerja Rata-Rata</span>
                    <span className="text-lg font-bold text-blue-600">{avgScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Posisi</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bagian</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Distance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clusterData.map((emp: ClusterData, idx: number) => (
                        <tr key={emp.employee_id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{emp.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{emp.division}</td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-gray-600">
                            {emp.distance_to_centroid.toFixed(4)}
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

      <div className="flex justify-center pt-4">
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-6 h-6" />
          Export Results to CSV
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100">
      <BrainCircuit className="w-24 h-24 text-gray-300 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data Clustering</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Lakukan ekstraksi fitur terlebih dahulu, kemudian jalankan K-Means clustering untuk mendapatkan hasil analisis.
      </p>
    </div>
  );
}

// Simple SVG Icons replacement
function ArrowRightIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function TargetIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
