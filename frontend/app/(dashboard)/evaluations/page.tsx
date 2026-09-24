"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auditLogService } from "@/services/audit-log-service";
import { Toast } from "@/components/ui/Toast";
import { evaluationService } from "@/services/evaluation-service";
import { PerformanceEvaluation } from "@/types/api";
import { Award, TrendingUp, Calendar, Search, Filter, Plus, X, Lock, ShieldCheck, Sparkles, MessageSquare, Eye, CheckCircle2, FileText, AlertTriangle } from "lucide-react";

interface EvaluationItem {
  id: number;
  employee_name: string;
  position: string;
  division: string;
  task_score: number;
  kpi_score: number;
  final_score: number;
  grade: "A" | "B" | "C" | "D" | "E";
  period: string;
  feedback_notes?: string;
  conclusion_notes?: string;
  task_score_reason?: string;
  kpi_breakdown?: {
    k1: { name: string; score: number; reason: string };
    k2: { name: string; score: number; reason: string };
    k3: { name: string; score: number; reason: string };
    k4: { name: string; score: number; reason: string };
  };
}

export default function EvaluationsPage() {
  const { user } = useAuth();
  const rawRole = (user?.role || user?.roles?.[0] || "ADMIN").toUpperCase();
  const isEmployee = rawRole === "EMPLOYEE";
  const isAdminOrManager = !isEmployee;
  const currentUserName = user?.name || "Sarah Jenkins";

  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDetailEval, setSelectedDetailEval] = useState<EvaluationItem | null>(null);

  // Form State inside Modal
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("Haskell Tromp II");
  const [taskScoreInput, setTaskScoreInput] = useState(88);
  const [k1, setK1] = useState(85); // Kedisiplinan
  const [k2, setK2] = useState(90); // Kualitas Kerja
  const [k3, setK3] = useState(85); // Kerjasama
  const [k4, setK4] = useState(80); // Inovasi

  // Per-Indicator Reasons & Conclusion
  const [k1Reason, setK1Reason] = useState("");
  const [k2Reason, setK2Reason] = useState("");
  const [k3Reason, setK3Reason] = useState("");
  const [k4Reason, setK4Reason] = useState("");
  const [taskScoreReason, setTaskScoreReason] = useState("");
  const [conclusionNotes, setConclusionNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string | null;
  }>({
    type: "success",
    message: null,
  });

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const rawData = await evaluationService.getAll();
      const mapped: EvaluationItem[] = rawData.map((e: PerformanceEvaluation) => {
        const empName = e.employee?.full_name || e.employee?.name || "Pegawai Central Saga";
        const pos = e.employee?.position || "Specialist Staff";
        const div = e.employee?.division?.name || "Operasional Central Saga";
        const scoreVal = Number(e.score) || 85.0;
        const taskSc = scoreVal;
        const kpiSc = scoreVal;
        const finalSc = taskSc * 0.6 + kpiSc * 0.4;
        const gr = calculateGrade(finalSc);

        return {
          id: e.id,
          employee_name: empName,
          position: pos,
          division: div,
          task_score: taskSc,
          kpi_score: kpiSc,
          final_score: finalSc,
          grade: gr,
          period: "Agustus 2026",
          feedback_notes: e.feedback_notes || "Kinerja sangat memuaskan dan memenuhi seluruh kriteria KPI.",
        };
      });

      setEvaluations(mapped);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  // Calculate live average KPI score and final score
  const avgKpiScore = (k1 + k2 + k3 + k4) / 4;
  const calculatedFinalScore = taskScoreInput * 0.6 + avgKpiScore * 0.4;

  const calculateGrade = (score: number): "A" | "B" | "C" | "D" | "E" => {
    if (score >= 85) return "A";
    if (score >= 75) return "B";
    if (score >= 65) return "C";
    if (score >= 50) return "D";
    return "E";
  };

  const currentGrade = calculateGrade(calculatedFinalScore);

  const filtered = evaluations.filter((item) => {
    if (isEmployee) {
      const isOwn =
        item.employee_name.toLowerCase().includes(currentUserName.toLowerCase()) ||
        currentUserName.toLowerCase().includes(item.employee_name.toLowerCase());
      if (!isOwn) return false;
    }

    const matchesSearch =
      item.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      item.position.toLowerCase().includes(search.toLowerCase()) ||
      item.division.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = selectedGrade === "ALL" || item.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT VALIDATION: All 4 KPI reasons and Conclusion must be filled!
    if (
      !k1Reason.trim() ||
      !k2Reason.trim() ||
      !k3Reason.trim() ||
      !k4Reason.trim() ||
      !conclusionNotes.trim()
    ) {
      setValidationError("⚠️ Peringatan: Seluruh 4 alasan indikator KPI dan Kesimpulan Penilaian wajib diisi sebelum evaluasi dapat diterbitkan!");
      setToast({
        type: "error",
        message: "Mohon lengkapi seluruh alasan KPI dan kesimpulan penilaian!",
      });
      return;
    }

    setValidationError(null);

    try {
      const compositeNotes = `• Kedisiplinan & Ketepatan Waktu (${k1}): ${k1Reason.trim()}\n• Kualitas Hasil Kerja (${k2}): ${k2Reason.trim()}\n• Kerjasama Tim & Komunikasi (${k3}): ${k3Reason.trim()}\n• Inisiatif & Inovasi Kerja (${k4}): ${k4Reason.trim()}\n\n📌 Kesimpulan & Rekomendasi:\n${conclusionNotes.trim()}`;

      await evaluationService.create({
        task_id: 1,
        employee_id: 1,
        score: calculatedFinalScore,
        feedback_notes: compositeNotes,
      });

      const newEval: EvaluationItem = {
        id: Date.now(),
        employee_name: selectedEmployeeName,
        position: "Specialist Staff",
        division: "Central Saga Unit",
        task_score: taskScoreInput,
        kpi_score: avgKpiScore,
        final_score: calculatedFinalScore,
        grade: currentGrade,
        period: "Agustus 2026",
        feedback_notes: compositeNotes,
        conclusion_notes: conclusionNotes.trim(),
        task_score_reason: taskScoreReason.trim(),
        kpi_breakdown: {
          k1: { name: "Kedisiplinan & Ketepatan Waktu", score: k1, reason: k1Reason.trim() },
          k2: { name: "Kualitas Hasil Kerja", score: k2, reason: k2Reason.trim() },
          k3: { name: "Kerjasama Tim & Komunikasi", score: k3, reason: k3Reason.trim() },
          k4: { name: "Inisiatif & Inovasi Kerja", score: k4, reason: k4Reason.trim() },
        },
      };

      setEvaluations((prev) => [newEval, ...prev]);
      setIsCreateOpen(false);
      // Reset form
      setK1Reason("");
      setK2Reason("");
      setK3Reason("");
      setK4Reason("");
      setTaskScoreReason("");
      setConclusionNotes("");
      setValidationError(null);

      auditLogService.logActivity(
        user?.name,
        "EVALUATION_CREATED",
        "App\\Models\\PerformanceEvaluation",
        `Pengguna '${user?.name || "Manager"}' (${user?.role || "MANAGER"}) menerbitkan evaluasi kinerja baru untuk '${selectedEmployeeName}' (Skor: ${calculatedFinalScore.toFixed(1)}, Grade: ${currentGrade})`
      );
      setToast({
        type: "success",
        message: `Hasil Evaluasi Kinerja Pegawai '${selectedEmployeeName}' (Skor: ${calculatedFinalScore.toFixed(
          1
        )} - Grade ${currentGrade}) Berhasil Diterbitkan!`,
      });
    } catch {
      setToast({
        type: "error",
        message: "Gagal menerbitkan evaluasi.",
      });
    }
  };

  const getGradeBadge = (grade: string) => {
    const styles: Record<string, string> = {
      A: "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs hover:scale-110 transition-transform",
      B: "bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs hover:scale-110 transition-transform",
      C: "bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs hover:scale-110 transition-transform",
      D: "bg-orange-50 text-orange-800 border border-orange-300 shadow-2xs hover:scale-110 transition-transform",
      E: "bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs hover:scale-110 transition-transform",
    };

    return (
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
          styles[grade] || "bg-slate-100 text-slate-800 border border-slate-300"
        }`}
      >
        {grade}
      </span>
    );
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Evaluasi Kinerja Pegawai
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs uppercase tracking-wider">
              Formula: Task (60%) + KPI (40%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistem penilaian kinerja bulanan berbasis perpaduan skor tugas proyek dan capaian KPI departemen.
          </p>
        </div>

        {/* Action Button: Hanya Admin & Manager yang bisa membuat evaluasi baru */}
        {isAdminOrManager && (
          <button
            onClick={() => {
              setIsCreateOpen(true);
              setValidationError(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-black shadow-md border border-blue-950 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Evaluasi Bulanan</span>
          </button>
        )}
      </div>

      {/* Privacy Notice Banner for Employee */}
      {isEmployee && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hak Akses Terproteksi (Private Mode): Anda hanya dapat melihat kartu evaluasi kinerja Anda sendiri. Evaluasi pegawai lain bersifat rahasia.</span>
          </div>
        </div>
      )}

      {/* Formula Explanation Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/15 shadow-xs">
          <Award className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-white">
            Rumus Formula Skor Akhir SIM-KAP
          </h4>
          <p className="text-xs text-blue-100 font-medium mt-0.5">
            <span className="font-extrabold text-emerald-400">Final Score</span> = (Skor Tugas × 60%) + (Skor Kriteria KPI × 40%). Grade: A (≥85), B (75-84.9), C (65-74.9), D (50-64.9), E (&lt;50).
          </p>
        </div>
      </div>

      {/* Toolbar Search & Grade Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pegawai, jabatan, atau divisi..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-extrabold border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800 cursor-pointer shadow-2xs transition-all"
            >
              <option value="ALL">Semua Grade (All Grades)</option>
              <option value="A">Grade A (Sangat Baik / &gt;=85)</option>
              <option value="B">Grade B (Baik / 75-84)</option>
              <option value="C">Grade C (Cukup / 65-74)</option>
              <option value="D">Grade D (Kurang / 50-64)</option>
              <option value="E">Grade E (Sangat Kurang / &lt;50)</option>
            </select>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-black shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Total {filtered.length} Evaluasi
          </span>
        </div>
      </div>

      {/* ULTRA-ESTETIK EXECUTIVE TABLE VIEW */}
      <div className="bg-white border border-slate-300 rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                <th className="py-4 px-4 w-12 border-r border-white/20 text-center">NO.</th>
                <th className="py-4 px-5 border-r border-white/20">PEGAWAI</th>
                <th className="py-4 px-5 border-r border-white/20">DIVISI</th>
                <th className="py-4 px-5 border-r border-white/20">PERIODE</th>
                <th className="py-4 px-5 text-center border-r border-white/20">SKOR TUGAS (60%)</th>
                <th className="py-4 px-5 text-center border-r border-white/20">SKOR KPI (40%)</th>
                <th className="py-4 px-5 text-center border-r border-white/20">SKOR AKHIR</th>
                <th className="py-4 px-5 text-center border-r border-white/20">GRADE</th>
                <th className="py-4 px-4 text-center">AKSI & ALASAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs font-semibold">
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedDetailEval(item)}
                  className="even:bg-slate-50/70 hover:bg-blue-50/50 transition-all duration-150 cursor-pointer group"
                >
                  {/* # NO. Column */}
                  <td className="py-4.5 px-4 text-slate-500 font-bold border-r border-slate-300 text-center">
                    {String(idx + 1).padStart(2, "0")}
                  </td>

                  {/* Pegawai Name + Avatar */}
                  <td className="py-4.5 px-5 border-r border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {item.employee_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{item.employee_name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{item.position}</p>
                      </div>
                    </div>
                  </td>

                  {/* Divisi Column */}
                  <td className="py-4.5 px-5 text-slate-800 font-bold border-r border-slate-300">
                    {item.division}
                  </td>

                  {/* Periode Column */}
                  <td className="py-4.5 px-5 text-slate-600 border-r border-slate-300">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {item.period}
                    </span>
                  </td>

                  {/* Skor Tugas */}
                  <td className="py-4.5 px-5 text-center font-black text-slate-900 text-sm border-r border-slate-300">
                    {item.task_score.toFixed(1)}
                  </td>

                  {/* Skor KPI */}
                  <td className="py-4.5 px-5 text-center font-black text-slate-900 text-sm border-r border-slate-300">
                    {item.kpi_score.toFixed(1)}
                  </td>

                  {/* Skor Akhir */}
                  <td className="py-4.5 px-5 text-center border-r border-slate-300">
                    <span className="inline-flex items-center gap-1.5 font-black text-blue-900 text-sm bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-300 shadow-2xs group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4 text-blue-700" />
                      {item.final_score.toFixed(1)}
                    </span>
                  </td>

                  {/* Grade */}
                  <td className="py-4.5 px-5 text-center border-r border-slate-300">
                    <div className="flex justify-center">
                      {getGradeBadge(item.grade)}
                    </div>
                  </td>

                  {/* Aksi & Alasan Detail */}
                  <td className="py-4.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetailEval(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold rounded-xl border border-blue-200 shadow-2xs transition-all cursor-pointer"
                      title="Klik untuk melihat alasan penilaian & detail evaluasi"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Alasan & Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup: Buat Evaluasi Kinerja Bulanan Baru */}
      {isCreateOpen && isAdminOrManager && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-300 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Buat Evaluasi Kinerja Bulanan Baru
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Kalkulasi skor otomatis Task (60%) + KPI (40%)</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Banner if Validation Fails */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 font-bold animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-rose-800">Alasan Belum Lengkap!</p>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">{validationError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1">Pilih Pegawai *</label>
                <select
                  value={selectedEmployeeName}
                  onChange={(e) => setSelectedEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-extrabold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="Haskell Tromp II">Haskell Tromp II (Backend)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Finance)</option>
                  <option value="Michael Ross">Michael Ross (IT Ops)</option>
                  <option value="Natalie McDermott">Natalie McDermott (UI/UX)</option>
                  <option value="Van Larkin">Van Larkin (QA)</option>
                  <option value="Miss Felicity Runte">Miss Felicity Runte (HR)</option>
                </select>
              </div>

              {/* Penilaian Skor Tugas (60%) - Slider & Alasan Identik dengan Indikator KPI */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-3 shadow-2xs">
                <h4 className="font-black text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Penilaian Skor Tugas Proyek & Harian (60%)</span>
                  <span className="text-blue-800 font-black">Nilai: {taskScoreInput}</span>
                </h4>

                <div className="space-y-1.5 p-2.5 bg-white border rounded-xl shadow-2xs border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Skor Hasil Penyelesaian Tugas:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{taskScoreInput}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={taskScoreInput}
                    onChange={(e) => setTaskScoreInput(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <input
                      type="text"
                      value={taskScoreReason}
                      onChange={(e) => {
                        setTaskScoreReason(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Tuliskan alasan nilai skor tugas (60%) * (Wajib)"
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        validationError && !taskScoreReason.trim()
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                          : "border-slate-300 bg-slate-50/60 text-slate-800"
                      }`}
                    />
                    {validationError && !taskScoreReason.trim() && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">* Alasan skor tugas wajib diisi!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sliders for KPI Criteria + Individual Reason per Indicator */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-4 shadow-2xs">
                <h4 className="font-black text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Penilaian KPI Indikator (40%)</span>
                  <span className="text-blue-800 font-black">Rata-rata: {avgKpiScore.toFixed(1)}</span>
                </h4>

                {/* Indikator 1: Kedisiplinan */}
                <div className="space-y-1.5 p-2.5 bg-white border rounded-xl shadow-2xs border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">1. Kedisiplinan & Ketepatan Waktu:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{k1}</span>
                  </div>
                  <input type="range" min="0" max="100" value={k1} onChange={(e) => setK1(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  <div>
                    <input
                      type="text"
                      value={k1Reason}
                      onChange={(e) => {
                        setK1Reason(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Tuliskan alasan nilai kedisiplinan & ketepatan waktu * (Wajib)"
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        validationError && !k1Reason.trim()
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                          : "border-slate-300 bg-slate-50/60 text-slate-800"
                      }`}
                    />
                    {validationError && !k1Reason.trim() && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">* Alasan kedisiplinan wajib diisi!</p>
                    )}
                  </div>
                </div>

                {/* Indikator 2: Kualitas Kerja */}
                <div className="space-y-1.5 p-2.5 bg-white border rounded-xl shadow-2xs border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">2. Kualitas Hasil Kerja:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{k2}</span>
                  </div>
                  <input type="range" min="0" max="100" value={k2} onChange={(e) => setK2(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  <div>
                    <input
                      type="text"
                      value={k2Reason}
                      onChange={(e) => {
                        setK2Reason(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Tuliskan alasan nilai kualitas hasil kerja * (Wajib)"
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        validationError && !k2Reason.trim()
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                          : "border-slate-300 bg-slate-50/60 text-slate-800"
                      }`}
                    />
                    {validationError && !k2Reason.trim() && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">* Alasan kualitas kerja wajib diisi!</p>
                    )}
                  </div>
                </div>

                {/* Indikator 3: Kerjasama Tim */}
                <div className="space-y-1.5 p-2.5 bg-white border rounded-xl shadow-2xs border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">3. Kerjasama Tim & Komunikasi:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{k3}</span>
                  </div>
                  <input type="range" min="0" max="100" value={k3} onChange={(e) => setK3(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  <div>
                    <input
                      type="text"
                      value={k3Reason}
                      onChange={(e) => {
                        setK3Reason(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Tuliskan alasan nilai kerjasama tim & komunikasi * (Wajib)"
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        validationError && !k3Reason.trim()
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                          : "border-slate-300 bg-slate-50/60 text-slate-800"
                      }`}
                    />
                    {validationError && !k3Reason.trim() && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">* Alasan kerjasama tim wajib diisi!</p>
                    )}
                  </div>
                </div>

                {/* Indikator 4: Inisiatif & Inovasi */}
                <div className="space-y-1.5 p-2.5 bg-white border rounded-xl shadow-2xs border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">4. Inisiatif & Inovasi Kerja:</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">{k4}</span>
                  </div>
                  <input type="range" min="0" max="100" value={k4} onChange={(e) => setK4(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  <div>
                    <input
                      type="text"
                      value={k4Reason}
                      onChange={(e) => {
                        setK4Reason(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Tuliskan alasan nilai inisiatif & inovasi kerja * (Wajib)"
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        validationError && !k4Reason.trim()
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                          : "border-slate-300 bg-slate-50/60 text-slate-800"
                      }`}
                    />
                    {validationError && !k4Reason.trim() && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">* Alasan inisiatif wajib diisi!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kesimpulan & Rekomendasi Penilaian Akhir */}
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-2xl space-y-2 shadow-2xs">
                <label className="block font-black text-slate-900 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    5. Kesimpulan & Rekomendasi Penilaian Akhir *
                  </span>
                  <span className="text-[10.5px] text-blue-700 font-bold">Wajib Diisi</span>
                </label>
                <textarea
                  rows={2}
                  value={conclusionNotes}
                  onChange={(e) => {
                    setConclusionNotes(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Tuliskan kesimpulan menyeluruh kinerja pegawai dan rekomendasi pengembangan/apresiasi * (Wajib)..."
                  className={`w-full px-3.5 py-2 border rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs resize-none ${
                    validationError && !conclusionNotes.trim()
                      ? "border-rose-500 bg-rose-50/50 text-rose-900 placeholder-rose-400"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
                {validationError && !conclusionNotes.trim() && (
                  <p className="text-[10px] text-rose-600 font-bold">* Kesimpulan penilaian wajib diisi!</p>
                )}
              </div>

              {/* Projected Final Score Box */}
              <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[11px] font-black text-blue-950">Proyeksi Skor Akhir</p>
                  <p className="text-[10px] text-blue-800 font-bold">Formula: (Tugas 60%) + (KPI 40%)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-blue-950">{calculatedFinalScore.toFixed(1)}</span>
                  {getGradeBadge(currentGrade)}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl border border-blue-950 shadow-md cursor-pointer"
                >
                  Terbitkan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Evaluasi & Alasan Penilai */}
      {selectedDetailEval && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-300 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Detail Evaluasi & Alasan Penilaian
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Pegawai: <strong className="text-slate-800">{selectedDetailEval.employee_name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailEval(null)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile & Period */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">Jabatan & Divisi</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedDetailEval.position}</p>
                <p className="text-[11px] text-slate-500 font-medium">{selectedDetailEval.division}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[11px] text-slate-400 font-bold">Periode Evaluasi</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedDetailEval.period}</p>
                <p className="text-[11px] text-emerald-700 font-bold">Status: Terverifikasi</p>
              </div>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <p className="text-[10px] text-blue-900 font-bold">Tugas (60%)</p>
                <p className="text-base font-black text-blue-950 mt-1">{selectedDetailEval.task_score.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <p className="text-[10px] text-indigo-900 font-bold">KPI (40%)</p>
                <p className="text-base font-black text-indigo-950 mt-1">{selectedDetailEval.kpi_score.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-slate-900 text-white border border-slate-950 rounded-xl flex flex-col items-center justify-center">
                <p className="text-[10px] text-slate-300 font-bold">Skor Akhir</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-black text-amber-400">{selectedDetailEval.final_score.toFixed(1)}</span>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-400 text-slate-900">
                    Grade {selectedDetailEval.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* Alasan & Catatan Penilai: Terstruktur Rapi untuk Tugas (60%), KPI (40%), dan Kesimpulan */}
            <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
              {/* 1. Alasan Skor Tugas (60%) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-black text-blue-950">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    1. Alasan Penilaian Skor Tugas (60%):
                  </span>
                  <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md text-[11px] font-bold border border-blue-300">
                    Skor: {selectedDetailEval.task_score.toFixed(1)}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-blue-100 rounded-xl">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedDetailEval.task_score_reason ||
                      (selectedDetailEval.feedback_notes?.includes("Alasan Skor Tugas")
                        ? selectedDetailEval.feedback_notes.split("\n")[0].replace(/^.*?:s*/, "")
                        : "Seluruh penugasan proyek utama berhasil diselesaikan dengan ketepatan waktu dan standar kerja yang baik.")}
                  </p>
                </div>
              </div>

              {/* 2. Alasan Indikator KPI (40%) */}
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-2xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    2. Alasan Penilaian Indikator KPI (40%):
                  </span>
                  <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md text-[11px] font-bold border border-indigo-200">
                    Rata-rata: {selectedDetailEval.kpi_score.toFixed(1)}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700 font-medium">
                  {selectedDetailEval.kpi_breakdown ? (
                    <div className="space-y-1.5">
                      <p><strong className="text-slate-900">• Kedisiplinan & Ketepatan Waktu ({selectedDetailEval.kpi_breakdown.k1.score}):</strong> {selectedDetailEval.kpi_breakdown.k1.reason}</p>
                      <p><strong className="text-slate-900">• Kualitas Hasil Kerja ({selectedDetailEval.kpi_breakdown.k2.score}):</strong> {selectedDetailEval.kpi_breakdown.k2.reason}</p>
                      <p><strong className="text-slate-900">• Kerjasama Tim & Komunikasi ({selectedDetailEval.kpi_breakdown.k3.score}):</strong> {selectedDetailEval.kpi_breakdown.k3.reason}</p>
                      <p><strong className="text-slate-900">• Inisiatif & Inovasi Kerja ({selectedDetailEval.kpi_breakdown.k4.score}):</strong> {selectedDetailEval.kpi_breakdown.k4.reason}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {selectedDetailEval.feedback_notes
                        ?.split("\n")
                        .filter((line) => line.startsWith("•") || (!line.includes("Alasan Skor Tugas") && !line.includes("Kesimpulan")))
                        .map((line, lIdx) => (
                          <p key={lIdx} className="leading-relaxed">
                            {line}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Kesimpulan & Rekomendasi Akhir */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>3. Kesimpulan & Rekomendasi Penilaian Akhir:</span>
                </div>
                <div className="p-2.5 bg-white border border-amber-100 rounded-xl">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium italic">
                    "{selectedDetailEval.conclusion_notes ||
                      (selectedDetailEval.feedback_notes?.includes("Kesimpulan & Rekomendasi:")
                        ? selectedDetailEval.feedback_notes.split("Kesimpulan & Rekomendasi:")[1]?.trim()
                        : "Pegawai menunjukkan kinerja yang konsisten dan direkomendasikan untuk terus mempertahankan dedikasi kerja.")}"
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDetailEval(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-950 shadow-md cursor-pointer"
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
