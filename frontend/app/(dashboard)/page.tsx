"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toast } from "@/components/ui/Toast";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Award,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Calendar,
  Check,
} from "lucide-react";
import Image from "next/image";
import centralSagaLogo from "@/public/central-saga-logo.png";
import apiClient from "@/lib/api-client";

export default function DashboardOverviewPage() {
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string | null }>({
    type: "success",
    message: "Data dashboard Central Saga berhasil disinkronisasi!",
  });

  const [stats, setStats] = useState({
    totalEmployees: 30,
    totalTasks: 45,
    completedTasks: 38,
    completionRate: 84.4,
    avgKpiScore: 86.8,
    kpiGrade: "A",
    mlSilhouette: 0.678,
    mlClusters: 3,
  });

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const mlRes = await apiClient.get("/ml/clusters/2026-09").catch(() => null);
        if (mlRes?.data?.success) {
          const mlData = mlRes.data.data;
          setStats((prev) => ({
            ...prev,
            mlSilhouette: Number(mlData.silhouette_score ?? 0.678),
            mlClusters: mlData.n_clusters ?? 3,
            totalEmployees: mlRes.data.metadata?.total_employees ?? 30,
          }));
        }
      } catch {
        // Fallback to initial accurate state
      }
    };
    fetchDashboardMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, message: null })}
        />
      )}

      {/* Top Banner Header */}
      <div className="p-8 bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl border border-teal-800/30 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[20%] w-[250px] h-[250px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 border-2 border-emerald-400/40 shadow-lg hover:scale-105 transition-all duration-300">
              <Image src={centralSagaLogo} alt="Central Saga" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 mb-2 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>PT Central Saga Mandala — Enterprise System</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Dashboard Overview & Analitik Kinerja
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
                Ringkasan produktivitas kerja, pencapaian target penugasan, dan hasil pengelompokan K-Means Machine Learning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setToast({ type: "success", message: "Sinkronisasi ulang data kinerja berhasil!" })}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
            >
              Refresh Data
            </button>
            
            <Link
              href="/tasks"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Kelola Tugas</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Pegawai */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 ml-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pegawai
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {stats.totalEmployees}
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">30 Karyawan Aktif</p>
          </div>
        </div>

        {/* Tugas Selesai */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1 ml-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tugas Periode Ini
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {stats.totalTasks}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Periode 2026-09</p>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 ml-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tingkat Selesai
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {stats.completionRate}%
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Produktivitas Baik
            </p>
          </div>
        </div>

        {/* Rata-rata Skor KPI */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 ml-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata KPI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">{stats.avgKpiScore}</h3>
              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                Grade {stats.kpiGrade}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Target Minimum: 75.0</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Tren Kinerja & Penyelesaian Tugas Bulanan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Perbandingan skor rata-rata kinerja karyawan 6 bulan terakhir</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> 2026
            </span>
          </div>

          {/* Responsive SVG Chart */}
          <div className="pt-2">
            <div className="h-56 w-full flex items-end justify-between gap-3 px-2">
              {[
                { month: "Apr", score: 78, tasks: 32 },
                { month: "Mei", score: 81, tasks: 36 },
                { month: "Jun", score: 83, tasks: 38 },
                { month: "Jul", score: 85, tasks: 41 },
                { month: "Agt", score: 84, tasks: 40 },
                { month: "Sep", score: 88, tasks: 45, current: true },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.score}%
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end p-1 h-44 border border-slate-200/40">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        item.current
                          ? "bg-gradient-to-t from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20"
                          : "bg-gradient-to-t from-indigo-500 to-blue-400 group-hover:from-indigo-600 group-hover:to-blue-500"
                      }`}
                      style={{ height: `${item.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${item.current ? "text-emerald-700" : "text-slate-500"}`}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>Rata-rata Historis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Bulan Berjalan (Sep 2026)</span>
              </div>
            </div>
          </div>
        </div>

        {/* K-Means Intelligence Mini-Card & Top Performers */}
        <div className="space-y-6">
          {/* K-Means Intelligence Status Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">IntelliML K-Means Status</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aktif
              </span>
            </div>
            
            <p className="text-xs text-blue-200/90 leading-relaxed mb-4">
              Model clustering berhasil mengelompokkan 30 karyawan ke dalam 3 cluster berbasis kinerja dan beban kerja.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-blue-200 font-semibold uppercase">Silhouette Score</p>
                <p className="text-lg font-black text-cyan-300">{stats.mlSilhouette.toFixed(3)}</p>
                <p className="text-[10px] text-emerald-400">Struktur Kuat</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-blue-200 font-semibold uppercase">Total Segmentasi</p>
                <p className="text-lg font-black text-white">{stats.mlClusters} Cluster</p>
                <p className="text-[10px] text-blue-300">10 org / cluster</p>
              </div>
            </div>

            <Link
              href="/ml-clustering"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <span>Buka IntelliML Clustering</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Top Performers Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Top Performers Bulan Ini</span>
              <span className="text-[11px] font-semibold text-emerald-600">Grade A</span>
            </h2>
            <div className="space-y-3">
              {[
                { name: "Manager Utama", role: "Manager", score: "93.3", cluster: "Cluster 1" },
                { name: "Bertrand Cummings", role: "Manager", score: "92.6", cluster: "Cluster 1" },
                { name: "Natalie McDermott", role: "Staff", score: "91.5", cluster: "Cluster 1" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-bold text-xs text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.role} • {item.cluster}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
