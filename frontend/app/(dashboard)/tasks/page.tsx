"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user-service";
import { User, Task } from "@/types/api";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { SubmitTaskModal } from "@/components/tasks/SubmitTaskModal";
import { ReviewTaskModal } from "@/components/tasks/ReviewTaskModal";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { Toast } from "@/components/ui/Toast";
import { useTasks } from "@/hooks/useTasks";
import {
  Plus,
  Trash2,
  PlayCircle,
  FileCheck,
  RotateCcw,
  UserCheck,
  Eye,
  Edit3,
  Loader2,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  CheckSquare,
  AlertCircle,
  Briefcase,
  Search,
  Filter,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";

export default function TasksPage() {
  const { user } = useAuth();
  const rawRole = (user?.role || user?.roles?.[0] || "ADMIN").toUpperCase();
  const isEmployee = rawRole === "EMPLOYEE";
  const isAdminOrManager = !isEmployee;

  const userPermissions = user?.permissions || [];
  const canCreateTask = isAdminOrManager || userPermissions.includes("tasks.create") || userPermissions.includes("*");
  const canReviewTask = isAdminOrManager || userPermissions.includes("tasks.review") || userPermissions.includes("*");

  const {
    tasks,
    loading,
    refetch,
    deleteTask,
    permanentDeleteTask,
    clearDraftTasks,
    createTask,
    submitTask,
    reviewTask,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [employeeFilter, setEmployeeFilter] = useState<"MY_TASKS" | "ALL_TASKS">("ALL_TASKS");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string | null }>({
    type: "success",
    message: null,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitTaskTarget, setSubmitTaskTarget] = useState<{ id: number; title: string; taskData?: Task | null } | null>(
    null
  );
  const [reviewTaskTarget, setReviewTaskTarget] = useState<Task | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);

  const metrics = useMemo(() => {
    const active = tasks.filter((t) => !t.is_deleted);
    return {
      pending: active.filter((t) => t.status === "PENDING").length,
      inProgress: active.filter((t) => t.status === "IN_PROGRESS").length,
      awaitingApproval: active.filter((t) => t.status === "SUBMITTED").length,
      approved: active.filter((t) => t.status === "APPROVED" || t.status === "COMPLETED").length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.is_deleted) return false;

      const empName = (task.employee?.full_name || task.employee?.name || "").toLowerCase().trim();
      const loggedUserName = (user?.full_name || user?.name || "Sarah Jenkins").toLowerCase().trim();

      const isAssignedToMe = Boolean(
        empName && loggedUserName && (empName.includes(loggedUserName) || loggedUserName.includes(empName))
      );
      const matchesEmployeeFilter =
        !isEmployee || employeeFilter === "ALL_TASKS" || (employeeFilter === "MY_TASKS" && isAssignedToMe);
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "ALL" || task.status === selectedStatus;

      return matchesEmployeeFilter && matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, selectedStatus, isEmployee, employeeFilter, user]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: "bg-amber-50 border-amber-200 text-amber-800", text: "text-amber-700", label: "Pending" },
      IN_PROGRESS: { bg: "bg-blue-50 border-blue-200 text-blue-800", text: "text-blue-700", label: "In Progress" },
      SUBMITTED: { bg: "bg-purple-50 border-purple-200 text-purple-800", text: "text-purple-700", label: "Submitted" },
      APPROVED: { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", text: "text-emerald-700", label: "Approved" },
      COMPLETED: { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", text: "text-emerald-700", label: "Completed" },
      REVISION: { bg: "bg-orange-50 border-orange-200 text-orange-800", text: "text-orange-700", label: "Revisi" },
      REJECTED: { bg: "bg-rose-50 border-rose-200 text-rose-800", text: "text-rose-700", label: "Rejected" },
    };
    const b = badges[status] || badges.PENDING;
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${b.bg}`}>
        {b.label}
      </span>
    );
  };

  const formatTaskCode = (id: number) => {
    if (id > 100000) {
      return `TSK-${String(id).slice(-4)}`;
    }
    return `TSK-${String(id).padStart(3, "0")}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Memuat data penugasan karyawan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, message: null })}
        />
      )}

      {/* Header Banner - Enterprise Theme */}
      <div className="p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl shadow-xl border border-indigo-800/30 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[25%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md p-3 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
              <Briefcase className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-cyan-200 mb-2 border border-white/15">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                <span>Manajemen Penugasan Kinerja — PT Central Saga Mandala</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Manajemen Tugas & Penugasan
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
                Kelola penugasan kerja operasional, pengumpulan bukti hasil kerja, dan evaluasi persetujuan atasan secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {canCreateTask && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Tugaskan Tugas Baru
              </button>
            )}

            <button
              onClick={() => {
                clearDraftTasks();
                setToast({ type: "success", message: "Data draft lokal berhasil dibersihkan!" });
              }}
              title="Bersihkan draft lokal pengujian"
              className="p-3 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-2xl border border-white/15 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black rounded-lg bg-amber-50 text-amber-800 px-2 py-0.5 border border-amber-200">
              PENDING
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Belum Dikerjakan</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{metrics.pending}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Menunggu dikerjakan</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black rounded-lg bg-blue-50 text-blue-800 px-2 py-0.5 border border-blue-200">
              IN PROGRESS
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sedang Berjalan</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{metrics.inProgress}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Progres dalam pengerjaan</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black rounded-lg bg-purple-50 text-purple-800 px-2 py-0.5 border border-purple-200">
              SUBMITTED
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Review</p>
          <p className="text-3xl font-black text-purple-700 mt-1">{metrics.awaitingApproval}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Butuh validasi atasan</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black rounded-lg bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-200">
              APPROVED
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas Selesai</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{metrics.approved}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Disetujui & memenuhi target</p>
        </div>
      </div>

      {/* Employee Scope Filter (khusus akun pegawai) */}
      {isEmployee && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Mode Pegawai ({user?.name || "Pegawai"}):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEmployeeFilter("ALL_TASKS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                employeeFilter === "ALL_TASKS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              Semua Tugas Tim
            </button>
            <button
              onClick={() => setEmployeeFilter("MY_TASKS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                employeeFilter === "MY_TASKS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              Tugas Saya Saja
            </button>
          </div>
        </div>
      )}

      {/* Main Task List Table / Container */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul tugas, deskripsi, atau nama pegawai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending (Belum)</option>
              <option value="IN_PROGRESS">In Progress (Berjalan)</option>
              <option value="SUBMITTED">Submitted (Menunggu Review)</option>
              <option value="APPROVED">Approved (Selesai)</option>
              <option value="REVISION">Revisi</option>
            </select>
          </div>
        </div>

        {/* Task Items */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Tidak ada tugas ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const empName = task.employee?.full_name || task.employee?.name || "Belum Ditugaskan";
              const empPos = task.employee?.position || "Staf Operasional";
              const empDiv = task.employee?.division?.name || "Divisi Operasional";
              const deadlineStr = formatDate(task.deadline || task.due_date);
              const weightVal = task.weight || task.weight_score || 5;

              return (
                <div
                  key={task.id}
                  className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Task Info & Assignee */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {formatTaskCode(task.id)}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{task.title}</h4>
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {task.description || "Tidak ada deskripsi detail penugasan."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      {/* Assignee Pill */}
                      <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {empName.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{empName}</span>
                        <span className="text-[11px] text-slate-400">({empPos})</span>
                      </div>

                      {/* Weight Badge */}
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        Bobot: <b className="text-slate-800">{weightVal}%</b>
                      </span>

                      {/* Deadline */}
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: <b className="text-slate-700">{deadlineStr}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                    {/* 1. Detail Button */}
                    <button
                      onClick={() => setSelectedDetailTask(task)}
                      title="Lihat Detail Tugas"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>

                    {/* 2. Submit Bukti Button (Untuk Pegawai / Pengisi Tugas jika PENDING, IN_PROGRESS, atau REVISION) */}
                    {(task.status === "PENDING" || task.status === "IN_PROGRESS" || task.status === "REVISION") && (
                      <button
                        onClick={() =>
                          setSubmitTaskTarget({
                            id: task.id,
                            title: task.title,
                            taskData: task,
                          })
                        }
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit Bukti
                      </button>
                    )}

                    {/* 3. Review Atasan Button (Khusus Manager / Admin saat status SUBMITTED) */}
                    {task.status === "SUBMITTED" && canReviewTask && (
                      <button
                        onClick={() => setReviewTaskTarget(task)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Review Atasan
                      </button>
                    )}

                    {/* 4. Delete / Trash Button (Khusus Admin / Manager atau untuk membersihkan data testing) */}
                    {canCreateTask && (
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus tugas '${task.title}'?`)) {
                            await permanentDeleteTask(task.id);
                            setToast({ type: "success", message: "Tugas berhasil dihapus!" });
                          }
                        }}
                        title="Hapus Tugas"
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload) => {
          await createTask(payload);
          setIsCreateOpen(false);
          setToast({ type: "success", message: "Tugas baru berhasil dibuat!" });
        }}
      />

      <SubmitTaskModal
        isOpen={!!submitTaskTarget}
        onClose={() => setSubmitTaskTarget(null)}
        taskId={submitTaskTarget?.id ?? null}
        taskTitle={submitTaskTarget?.title}
        taskData={submitTaskTarget?.taskData}
        onSubmit={async (taskId, payload) => {
          await submitTask(taskId, payload);
          setSubmitTaskTarget(null);
          setToast({ type: "success", message: "Bukti pengerjaan tugas berhasil dikirim!" });
        }}
      />

      <ReviewTaskModal
        isOpen={!!reviewTaskTarget}
        onClose={() => setReviewTaskTarget(null)}
        taskId={reviewTaskTarget?.id ?? null}
        taskTitle={reviewTaskTarget?.title}
        taskData={reviewTaskTarget}
        onSubmit={async (taskId, status, notes) => {
          await reviewTask(taskId, status, notes);
          setReviewTaskTarget(null);
          setToast({ type: "success", message: "Hasil peninjauan tugas berhasil disimpan!" });
        }}
      />

      <TaskDetailModal
        isOpen={!!selectedDetailTask}
        onClose={() => setSelectedDetailTask(null)}
        task={selectedDetailTask}
      />
    </div>
  );
}
