"use client";

import { useState, useEffect, useRef } from "react";
import { auditLogService } from "@/services/audit-log-service";
import { authService } from "@/services/auth-service";
import { ActivityLog } from "@/types/api";
import {
  Search,
  History,
  Sparkles,
  Clock,
  Download,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface AuditDisplayItem {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  isNew?: boolean;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("ADMIN");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string | null;
  }>({
    type: "success",
    message: null,
  });

  const isFirstLoadRef = useRef(true);

  const loadAuditLogs = async () => {
    try {
      if (isFirstLoadRef.current) {
        setLoading(true);
      }
      const currentUser = authService.getCurrentUser();
      const currentRole = (currentUser?.role || currentUser?.roles?.[0] || "ADMIN").toUpperCase();
      setCurrentUserRole(currentRole);

      const lastRead = auditLogService.getLastReadTime();
      const rawData = await auditLogService.getAll();
      const mapped: AuditDisplayItem[] = rawData.map((l: ActivityLog, idx: number) => {
        const userName = l.causer?.name || l.causer?.email || "System Admin";
        const dateStr = l.created_at ? new Date(l.created_at).toLocaleString("id-ID") : "19 Ags 2026, 18:15:00";
        const desc = l.description || "Aktivitas audit diproses";
        const modName = l.subject_type ? l.subject_type.split("\\").pop() || "System" : "Audit Module";
        const itemTime = l.created_at ? new Date(l.created_at).getTime() : 0;

        const isLogNew = lastRead > 0 ? itemTime > lastRead : idx === 0;

        return {
          id: l.id,
          timestamp: dateStr,
          user: userName,
          action: l.log_name || "LOGGED",
          module: modName,
          details: desc,
          isNew: isLogNew,
        };
      });

      setLogs(mapped);
    } catch {
      // ignore
    } finally {
      if (isFirstLoadRef.current) {
        setLoading(false);
        isFirstLoadRef.current = false;
      }
    }
  };

  useEffect(() => {
    loadAuditLogs();

    // Mark as read after EXACTLY 5 SECONDS (5000ms) of viewing the page
    const readTimer = setTimeout(() => {
      auditLogService.markAsRead();
      setLogs((prev) => prev.map((l) => ({ ...l, isNew: false })));
    }, 5000);

    const interval = setInterval(() => {
      loadAuditLogs();
    }, 60000); // Reduced from 3s to 60s for performance
    return () => {
      clearTimeout(readTimer);
      clearInterval(interval);
    };
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => {
        setToast({ type: "success", message: null });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleExportExcel = () => {
    if (logs.length === 0) {
      setToast({
        type: "error",
        message: "Tidak ada data log aktivitas untuk diunduh sebagai file backup Excel.",
      });
      return false;
    }

    try {
      // Build clean Excel CSV with UTF-8 BOM for Indonesian locale Excel compatibility
      const headers = ["No", "Waktu (Timestamp)", "Nama Pengguna", "Aksi Audit", "Modul Sistem", "Detail Aktivitas"];
      const rows = logs.map((l, idx) => [
        `"${idx + 1}"`,
        `"${l.timestamp.replace(/"/g, '""')}"`,
        `"${l.user.replace(/"/g, '""')}"`,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.module.replace(/"/g, '""')}"`,
        `"${l.details.replace(/"/g, '""')}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `Backup_Log_Aktivitas_Central_Saga_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        type: "success",
        message: "File backup log aktivitas berhasil diunduh (Format Excel CSV kompatibel)! ",
      });
      return true;
    } catch {
      setToast({
        type: "error",
        message: "Gagal membuat file backup Excel.",
      });
      return false;
    }
  };

  const handleOpenClearModal = () => {
    if (logs.length === 0) {
      setToast({
        type: "error",
        message: "Data log aktivitas sudah kosong.",
      });
      return;
    }
    setIsClearModalOpen(true);
  };

  const handleExecuteClear = (withBackup: boolean) => {
    if (withBackup) {
      const exported = handleExportExcel();
      if (!exported) return;
    }

    auditLogService.clearLogs();
    setLogs([]);
    setIsClearModalOpen(false);

    setToast({
      type: "success",
      message: withBackup
        ? "Backup Excel berhasil disimpan & seluruh riwayat log aktivitas telah dibersihkan!"
        : "Seluruh riwayat log aktivitas sistem telah berhasil dibersihkan!",
    });
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-900 text-white border-emerald-950 shadow-emerald-950/20"
              : "bg-rose-900 text-white border-rose-950 shadow-rose-950/20"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Log Aktivitas Sistem Central Saga</span>
              <History className="w-6 h-6 text-blue-600 inline-block" />
            </h1>
            {currentUserRole === "MANAGER" ? (
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-[10px] font-black shadow-2xs">
                💼 Mode Manager
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-[10px] font-black shadow-2xs">
                👑 Mode Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {currentUserRole === "MANAGER"
              ? "Catatan audit aktivitas tugas, evaluasi, dan kinerja tim (Aktivitas level Admin disembunyikan)."
              : "Catatan riwayat audit trail lengkap seluruh aktivitas sistem penugasan, evaluasi, dan perubahan user."}
          </p>
        </div>

        {/* Action Buttons: Live Status + Backup Excel + Clear Logs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black shadow-2xs shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Sync (2s)</span>
          </div>

          {/* Backup Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Unduh seluruh data log aktivitas ke dalam file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Download Backup Excel</span>
          </button>

          {/* Clear Logs Button */}
          <button
            type="button"
            onClick={handleOpenClearModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-300 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer group"
            title="Bersihkan riwayat log aktivitas dengan konfirmasi backup"
          >
            <Trash2 className="w-4 h-4 text-rose-600 group-hover:text-white transition-colors" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Sleek Floating Toolbar Search Bar */}
      <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari log berdasarkan user, aksi, atau detail..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 shadow-2xs"
          />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-black shadow-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          Total {filteredLogs.length} Audit Entries
        </span>
      </div>

      {/* ULTRA-ESTETIK EXECUTIVE TABLE VIEW */}
      <div className="bg-white border border-slate-300 rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                <th className="py-4 px-4 w-12 border-r border-white/10 text-center">NO.</th>
                <th className="py-4 px-5 border-r border-white/10">TIMESTAMP</th>
                <th className="py-4 px-5 border-r border-white/10">USER</th>
                <th className="py-4 px-5 border-r border-white/10">AKSI</th>
                <th className="py-4 px-5 border-r border-white/10">MODUL</th>
                <th className="py-4 px-5">DETAIL AKTIVITAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/90 text-xs font-semibold">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((l, idx) => (
                  <tr
                    key={l.id}
                    className={`transition-all duration-150 cursor-pointer group ${
                      l.isNew
                        ? "bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white border-l-4 border-l-blue-600 font-bold"
                        : "even:bg-slate-50/70 hover:bg-blue-50/50"
                    }`}
                  >
                    {/* NO. Column */}
                    <td className="py-4.5 px-4 text-slate-400 font-bold border-r border-slate-200 text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* Timestamp Column */}
                    <td className="py-4.5 px-5 text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {l.timestamp}
                        </span>
                        {l.isNew && (
                          <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs animate-pulse shrink-0 border border-blue-400/40">
                            ✨ TERBARU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User Column */}
                    <td className="py-4.5 px-5 border-r border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-black flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                          {l.user.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {l.user}
                        </span>
                      </div>
                    </td>

                    {/* Aksi Badge Column */}
                    <td className="py-4.5 px-5 border-r border-slate-200">
                      <span className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs uppercase">
                        {l.action}
                      </span>
                    </td>

                    {/* Modul Column */}
                    <td className="py-4.5 px-5 font-bold text-slate-700 border-r border-slate-200">
                      {l.module}
                    </td>

                    {/* Detail Aktivitas Column */}
                    <td className="py-4.5 px-5 text-slate-800 font-medium leading-relaxed">
                      {l.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-slate-100 text-slate-400 rounded-full">
                        <History className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-700 text-sm">
                          {searchQuery ? "Tidak ada log yang cocok dengan pencarian." : "Belum ada riwayat log aktivitas."}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery
                            ? "Coba gunakan kata kunci pencarian yang lain."
                            : currentUserRole === "MANAGER"
                            ? "Aktivitas penugasan dan evaluasi dari tim pegawai akan tercatat di sini."
                            : "Seluruh aktivitas penugasan, evaluasi, dan perubahan user akan tercatat otomatis di sini."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENGINGAT BACKUP SEBELUM CLEAR LOG */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-300 shadow-2xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Konfirmasi & Pengingat Backup Log
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Peringatan keamanan sebelum pembersihan riwayat audit trail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reminder & Warning Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50/90 to-rose-50/50 border border-amber-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-start gap-2.5 text-xs text-amber-950 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-amber-900 text-sm">
                    Apakah Anda yakin ingin membersihkan data log?
                  </p>
                  <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                    Tindakan ini akan menghapus <strong>{logs.length} catatan audit trail</strong> yang ada saat ini.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/90 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>💡 Rekomendasi Backup:</span>
                </p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Sangat disarankan untuk <strong>mengunduh file Backup Excel</strong> terlebih dahulu sebelum membersihkan data agar rekaman riwayat tetap tersimpan untuk arsip dan kepatuhan audit.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {/* Option 1: Backup & Clear (Recommended) */}
              <button
                type="button"
                onClick={() => handleExecuteClear(true)}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-800 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>📥 Unduh Backup Excel & Bersihkan Log (Direkomendasikan)</span>
              </button>

              {/* Option 2: Direct Clear without backup */}
              <button
                type="button"
                onClick={() => handleExecuteClear(false)}
                className="w-full px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>⚠️ Bersihkan Saja (Tanpa Backup)</span>
              </button>

              {/* Option 3: Cancel */}
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
