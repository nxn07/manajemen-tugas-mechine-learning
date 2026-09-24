"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auditLogService } from "@/services/audit-log-service";
import { Toast } from "@/components/ui/Toast";
import { divisionService } from "@/services/division-service";
import { Division } from "@/types/api";
import { Building2, Plus, Users, Search, X, Trash2 } from "lucide-react";

interface MemberItem {
  id: number;
  name: string;
  position: string;
  nik: string;
  email: string;
}

export default function DivisionsPage() {
  const { user } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDivisionForDetail, setSelectedDivisionForDetail] = useState<Division | null>(null);

  // Form State
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string | null;
  }>({
    type: "success",
    message: null,
  });

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const data = await divisionService.getAll();
      setDivisions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDivisions();
  }, []);

  const mockMembers: Record<number, MemberItem[]> = {
    1: [
      { id: 1, name: "Manager Utama", position: "Senior Manager", nik: "19900101", email: "manager@gmail.com" },
      { id: 2, name: "Haskell Tromp II", position: "Backend Developer", nik: "19900102", email: "haskell@gmail.com" },
      { id: 3, name: "Michael Ross", position: "IT Operations", nik: "19900103", email: "michael@gmail.com" },
    ],
    2: [
      { id: 4, name: "Miss Felicity Runte", position: "HR Specialist", nik: "19900104", email: "felicity@gmail.com" },
      { id: 5, name: "Anna Lee", position: "Recruiter Specialist", nik: "19900105", email: "anna@gmail.com" },
    ],
    3: [
      { id: 6, name: "Sarah Jenkins", position: "Finance Specialist", nik: "19900106", email: "sarah@gmail.com" },
    ],
    4: [
      { id: 7, name: "Natalie McDermott", position: "UI/UX Designer", nik: "19900107", email: "natalie@gmail.com" },
    ],
  };

  const filtered = divisions.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    try {
      const created = await divisionService.create({
        code: newCode.toUpperCase(),
        name: newName,
        description: newDescription || "Unit kerja departemen Central Saga.",
      });

      setDivisions((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
      setIsCreateOpen(false);
      setNewCode("");
      setNewName("");
      setNewDescription("");
      auditLogService.logActivity(
        user?.name,
        "DIVISION_CREATED",
        "App\\Models\\Division",
        `Pengguna '${user?.name || "Admin"}' (${user?.role || "ADMIN"}) membuat divisi baru '${newName}' (${newCode.toUpperCase()})`
      );
      setToast({
        type: "success",
        message: `Divisi baru '${newCode}' (${newName}) berhasil ditambahkan!`,
      });
    } catch {
      setToast({
        type: "error",
        message: "Gagal membuat divisi baru.",
      });
    }
  };

  const handleDeleteDivision = async (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus divisi ${name}?`)) {
      try {
        await divisionService.delete(id);
        setDivisions((prev) => prev.filter((d) => d.id !== id));
        auditLogService.logActivity(
          user?.name,
          "DIVISION_DELETED",
          "App\\Models\\Division",
          `Pengguna '${user?.name || "Admin"}' (${user?.role || "ADMIN"}) menghapus divisi '${name}'`
        );
        setToast({
          type: "success",
          message: `Divisi '${name}' berhasil dihapus!`,
        });
      } catch {
        setToast({
          type: "error",
          message: `Gagal menghapus divisi '${name}'.`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Popup */}
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, message: null })}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Master Data Divisi Central Saga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Kelola struktur departemen dan unit kerja di lingkungan organisasi
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 border border-blue-950"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Divisi Baru</span>
        </button>
      </div>

      {/* Search Bar (Sleek Single-Frame Floating Toolbar) */}
      <div className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau kode divisi..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Divisions Grid (ULTRA-AESTHETIC EXECUTIVE CARDS - 100% MATCH WITH KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border border-slate-300 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Ambient Background Sheen */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />

            <div>
              {/* Header Row: Code Badge & Quick Action Buttons */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white shadow-xs tracking-wider uppercase">
                  {item.code}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDeleteDivision(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 hover:border-rose-300 cursor-pointer active:scale-95 shadow-2xs"
                    title="Hapus Divisi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Icon Section */}
              <div className="flex items-start gap-3.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                    {item.description || "Unit kerja departemen Central Saga."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Info & Action Button (Matching KPI Card Footer!) */}
            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Divisi Resmi Terdaftar
              </span>
              <button
                onClick={() => setSelectedDivisionForDetail(item)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer"
              >
                <span>Lihat Detail Anggota</span>
                <Users className="w-3.5 h-3.5 text-blue-300" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup: Tambah Divisi Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Tambah Divisi Baru
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDivision} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Divisi (misal: DIV-QA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="DIV-QA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Divisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Quality Assurance & Audit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Unit Kerja
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Penjaminan mutu kualitas software..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-md border border-blue-950"
                >
                  Simpan Divisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Drawer: Detail Anggota Divisi */}
      {selectedDivisionForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Detail Anggota Divisi: {selectedDivisionForDetail.name} ({selectedDivisionForDetail.code})
                </h3>
                <p className="text-xs text-slate-400 font-medium">Daftar pegawai terdaftar di divisi ini</p>
              </div>
              <button onClick={() => setSelectedDivisionForDetail(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(mockMembers[selectedDivisionForDetail.id] || []).length > 0 ? (
                mockMembers[selectedDivisionForDetail.id].map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px]">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{m.position} • NIK: {m.nik}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{m.email}</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-slate-400 font-medium">
                  Belum ada pegawai terdaftar di divisi ini.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedDivisionForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
