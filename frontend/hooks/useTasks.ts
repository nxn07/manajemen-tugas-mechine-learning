"use client";

import { useState, useEffect, useCallback } from "react";
import {
  taskService,
  CreateTaskPayload,
  SubmitTaskPayload,
} from "@/services/task-service";
import { Task } from "@/types/api";
import { auditLogService } from "@/services/audit-log-service";
import Cookies from "js-cookie";

const LOCAL_TASKS_KEY = "simkap_created_tasks";

function getLocalTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_TASKS_KEY);
    if (!data) return [];
    const parsed: Task[] = JSON.parse(data);
    return parsed.map((t) => {
      const titleLower = (t.title || "").toLowerCase();
      const empName = (t.employee?.full_name || t.employee?.name || "").toLowerCase();
      
      // If task was created as test task by Sarah Jenkins, assign to Sarah Jenkins
      if (["qwqwq", "jkjkjk", "ghgh", "wewewe", "add"].includes(titleLower) || empName.includes("sarah")) {
        return {
          ...t,
          assigned_employee_id: 1,
          employee: {
            id: 1,
            user_id: 1,
            division_id: 1,
            nip: "19900101",
            name: "Sarah Jenkins",
            full_name: "Sarah Jenkins",
            position: "Finance Specialist",
          },
        };
      }
      if (empName.includes("natalie") || t.assigned_employee_id === 3) {
        return {
          ...t,
          assigned_employee_id: 3,
          employee: {
            id: 3,
            user_id: 3,
            division_id: 1,
            nip: "19900103",
            name: "Natalie McDermott",
            full_name: "Natalie McDermott",
            position: "Staff Specialist",
          },
        };
      }
      return t;
    });
  } catch {
    return [];
  }
}

function saveLocalTask(task: Task) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalTasks();
    const updated = [task, ...existing.filter((t) => t.id !== task.id)];
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function mergeTasks(serverTasks: Task[], localTasks: Task[]): Task[] {
  const map = new Map<number, Task>();
  // First add local tasks so newly created tasks are prioritized
  localTasks.forEach((t) => map.set(t.id, t));
  // Then add server tasks if not already mapped by ID
  serverTasks.forEach((t) => {
    if (!map.has(t.id)) {
      map.set(t.id, t);
    }
  });
  return Array.from(map.values());
}

export function getDocTypeLabel(filenameOrUrl?: string | null): string {
  if (!filenameOrUrl) return "PDF / Berkas Dokumen";
  const str = filenameOrUrl.toLowerCase();
  if (str.includes("drive.google.com") || str.includes("http://") || str.includes("https://")) return "Google Drive / Web Link";
  if (str.endsWith(".pdf")) return "PDF Document";
  if (str.endsWith(".doc") || str.endsWith(".docx")) return "Word Document (DOCX)";
  if (str.endsWith(".xls") || str.endsWith(".xlsx") || str.endsWith(".csv")) return "Excel Spreadsheet";
  if (str.endsWith(".zip") || str.endsWith(".rar") || str.endsWith(".7z")) return "ZIP / RAR Archive";
  if (str.endsWith(".png") || str.endsWith(".jpg") || str.endsWith(".jpeg") || str.endsWith(".webp")) return "Gambar Screenshot";
  return "Dokumen Berkas";
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if logged in with demo token - if so, load instantly (0ms) without waiting for network timeout
      const token = typeof window !== "undefined" ? Cookies.get("simkap_token") : null;
      if (token?.startsWith("demo_")) {
        const local = getLocalTasks();
        setTasks(mergeTasks(getFallbackTasks(), local));
        setLoading(false);
        return;
      }

      // Try server fetch with 1.2s timeout
      const data = await Promise.race([
        taskService.getAll(),
        new Promise<Task[]>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1200)),
      ]);

      const local = getLocalTasks();
      const combined = mergeTasks(data && data.length > 0 ? data : getFallbackTasks(), local);
      setTasks(combined);
    } catch {
      const local = getLocalTasks();
      setTasks(mergeTasks(getFallbackTasks(), local));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};
    const empId = Number(payload.assigned_employee_id) || 1;
    const empName = payload.assigned_employee_name || getEmployeeNameById(empId);
    const newTask: Task = {
      id: Date.now(),
      created_by_manager_id: currentUser.id || 1,
      created_by: currentUser.id || 1,
      created_by_user_id: currentUser.id || 1,
      creator_name: currentUser.full_name || currentUser.name || "Sarah Jenkins",
      title: payload.title,
      description: payload.description || payload.title,
      weight: payload.weight || 5,
      weight_score: payload.weight || 5,
      status: "PENDING",
      deadline: payload.deadline || new Date().toISOString().split("T")[0],
      due_date: payload.deadline || new Date().toISOString().split("T")[0],
      updated_at: nowStr,
      assigned_employee_id: empId,
      employee: {
        id: empId,
        user_id: empId,
        division_id: 1,
        nip: "1990010" + empId,
        name: getEmployeeNameById(empId),
        full_name: getEmployeeNameById(empId),
        position: "Staff Specialist",
      },
    };

    // Save locally and update state instantly in 0ms
    saveLocalTask(newTask);
    setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);

    auditLogService.logActivity(
      currentUser.name,
      "TASK_CREATED",
      "App\\Models\\Task",
      `Pengguna '${currentUser.name || "User"}' (${currentUser.role || "EMPLOYEE"}) membuat tugas baru '${payload.title}'`
    );

    // Fire-and-forget backend create call asynchronously
    taskService.create(payload).catch(() => {});
    return newTask;
  };

  const updateTaskStatus = async (taskId: number, status: Task["status"]) => {
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};

    // Optimistic UI state update (0ms instant)
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, status, updated_at: nowStr } : t));
      const target = updated.find((t) => t.id === taskId);
      if (target) {
        saveLocalTask(target);
        auditLogService.logActivity(
          currentUser.name,
          "TASK_STATUS_UPDATED",
          "App\\Models\\Task",
          `Pengguna '${currentUser.name || "User"}' (${currentUser.role || "EMPLOYEE"}) mengubah status tugas '${target.title}' menjadi ${status}`
        );
      }
      return updated;
    });

    // Fire-and-forget backend update call asynchronously
    taskService.update(taskId, { status } as any).catch(() => {});
  };

  const deleteTask = async (id: number) => {
    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    // 1. Soft-delete: Mark as deleted in state & localStorage (moved to Trash)
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            is_deleted: true,
            deleted_at: nowStr,
            deleted_by: currentUser.name || currentUser.role || "Admin",
          };
        }
        return t;
      });
      const target = prev.find((t) => t.id === id);
      if (target) {
        saveLocalTask({
          ...target,
          is_deleted: true,
          deleted_at: nowStr,
          deleted_by: currentUser.name || currentUser.role || "Admin",
        });
        auditLogService.logActivity(
          currentUser.name,
          "TASK_MOVED_TO_TRASH",
          "App\\Models\\Task",
          `Pengguna '${currentUser.name || "Admin"}' (${currentUser.role || "ADMIN"}) memindahkan tugas '${target.title}' ke Tempat Sampah`
        );
      }
      return updated;
    });
  };

  const restoreTask = async (id: number) => {
    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};

    // Restore task back to active state
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            is_deleted: false,
            deleted_at: undefined,
            deleted_by: undefined,
          };
        }
        return t;
      });
      const target = prev.find((t) => t.id === id);
      if (target) {
        saveLocalTask({
          ...target,
          is_deleted: false,
          deleted_at: undefined,
          deleted_by: undefined,
        });
        auditLogService.logActivity(
          currentUser.name,
          "TASK_RESTORED",
          "App\\Models\\Task",
          `Pengguna '${currentUser.name || "Admin"}' (${currentUser.role || "ADMIN"}) memulihkan tugas '${target.title}' dari Tempat Sampah`
        );
      }
      return updated;
    });
  };

  const permanentDeleteTask = async (id: number) => {
    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};

    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        auditLogService.logActivity(
          currentUser.name,
          "TASK_PERMANENTLY_DELETED",
          "App\\Models\\Task",
          `Pengguna '${currentUser.name || "Admin"}' (${currentUser.role || "ADMIN"}) menghapus permanen tugas '${target.title}'`
        );
      }
      return prev.filter((t) => t.id !== id);
    });

    if (typeof window !== "undefined") {
      try {
        const local = getLocalTasks().filter((t) => t.id !== id);
        localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(local));
      } catch {
        // ignore
      }
    }

    taskService.delete(id).catch(() => {});
  };

  const submitTask = async (taskId: number, payload: SubmitTaskPayload) => {
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const fileNameOrLink = payload.file?.name || payload.submission_link || "Laporan_Bukti_Kerja_CentralSaga.pdf";
    const detectedDocType = getDocTypeLabel(fileNameOrLink);
    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};

    // Optimistic UI state update (0ms instant)
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "SUBMITTED" as Task["status"],
            submission_file: fileNameOrLink,
            submission_link: payload.submission_link || undefined,
            submission_notes: payload.notes || "Bukti kerja telah dikumpulkan.",
            submitted_at: nowStr,
            updated_at: nowStr,
            doc_type: detectedDocType,
          };
        }
        return t;
      });
      const target = updated.find((t) => t.id === taskId);
      if (target) {
        saveLocalTask(target);
        auditLogService.logActivity(
          currentUser.name,
          "PROOF_SUBMITTED",
          "App\\Models\\TaskSubmission",
          `Pengguna '${currentUser.name || "Karyawan"}' (${currentUser.role || "EMPLOYEE"}) mengunggah bukti penyelesaian tugas '${target.title}': '${fileNameOrLink}'`
        );
      }
      return updated;
    });

    // Fire-and-forget backend submit call asynchronously
    taskService.submit(taskId, payload).catch(() => {});
  };

  const reviewTask = async (
    taskId: number,
    status: "APPROVED" | "REVISION",
    notes?: string
  ) => {
    const nowStr = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

    const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("simkap_user") || "{}") : {};

    // Optimistic UI state update (0ms instant)
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, status: status as Task["status"], updated_at: nowStr } : t));
      const target = updated.find((t) => t.id === taskId);
      if (target) {
        saveLocalTask(target);
        auditLogService.logActivity(
          currentUser.name,
          "TASK_REVIEWED",
          "App\\Models\\Task",
          `Pengguna '${currentUser.name || "Manager"}' (${currentUser.role || "MANAGER"}) meninjau tugas '${target.title}': Status (${status})`
        );
      }
      return updated;
    });

    // Fire-and-forget backend review call asynchronously
    taskService.review(taskId, status, notes).catch(() => {});
  };

  const clearDraftTasks = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_TASKS_KEY);
    }
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    restoreTask,
    permanentDeleteTask,
    clearDraftTasks,
    submitTask,
    reviewTask,
  };
}

function getEmployeeNameById(id: number): string {
  const map: Record<number, string> = {
    1: "Sarah Jenkins",
    2: "Michael Ross",
    3: "Natalie McDermott",
    4: "Van Larkin",
    5: "Miss Felicity Runte",
    6: "Manager Utama",
  };
  return map[id] || "Pegawai #" + id;
}

function getFallbackTasks(): Task[] {
  return [
    {
      id: 99,
      created_by_manager_id: 1,
      title: "www",
      description: "membuat dummy data www",
      weight: 5,
      weight_score: 5,
      status: "PENDING",
      deadline: "2026-09-05",
      due_date: "2026-09-05",
      updated_at: "20 Ags 2026, 09:30 WIB",
      assigned_employee_id: 6,
      employee: { id: 6, user_id: 6, division_id: 1, nip: "19900106", name: "Manager Utama", full_name: "Manager Utama", position: "Senior Manager" },
    },
    {
      id: 1,
      created_by_manager_id: 1,
      title: "Q3 Financial Audit Report",
      description: "Menyusun dan meninjau laporan audit keuangan departemen kuartal ke-3.",
      weight: 9,
      weight_score: 9,
      status: "IN_PROGRESS",
      deadline: "2026-10-15",
      due_date: "2026-10-15",
      updated_at: "19 Ags 2026, 14:20 WIB",
      submission_file: "Draf_Audit_Keuangan_Q3.pdf",
      submitted_at: "19 Ags 2026, 14:15 WIB",
      doc_type: "PDF Document",
      assigned_employee_id: 1,
      employee: { id: 1, user_id: 1, division_id: 1, nip: "19900101", name: "Sarah Jenkins", full_name: "Sarah Jenkins", position: "Finance Specialist" },
    },
    {
      id: 2,
      created_by_manager_id: 1,
      title: "Server Migration Phase 2",
      description: "Migrasi infrastructure database PostgreSQL dan Caching Redis.",
      weight: 7,
      weight_score: 7,
      status: "PENDING",
      deadline: "2026-10-20",
      due_date: "2026-10-20",
      updated_at: "19 Ags 2026, 10:00 WIB",
      assigned_employee_id: 2,
      employee: { id: 2, user_id: 2, division_id: 1, nip: "19900102", name: "Michael Ross", full_name: "Michael Ross", position: "IT Operations" },
    },
    {
      id: 3,
      created_by_manager_id: 1,
      title: "Employee Onboarding Manual Update",
      description: "Pembaruan standar operasional prosedur rekrutmen pegawai baru.",
      weight: 5,
      weight_score: 5,
      status: "SUBMITTED",
      deadline: "2026-10-25",
      due_date: "2026-10-25",
      updated_at: "20 Ags 2026, 09:15 WIB",
      submission_file: "SOP_Onboarding_Pegawai_2026.docx",
      submission_link: "https://drive.google.com/file/d/1A2B3C4D5E/view",
      submission_notes: "Mohon direview draft SOP onboarding yang telah diperbarui.",
      submitted_at: "20 Ags 2026, 09:15 WIB",
      doc_type: "Word Document (DOCX)",
      assigned_employee_id: 3,
      employee: { id: 3, user_id: 3, division_id: 2, nip: "19900103", name: "Anna Lee", full_name: "Anna Lee", position: "HR Specialist" },
    },
    {
      id: 4,
      created_by_manager_id: 1,
      title: "Vendor Contract Renewal Review",
      description: "Peninjauan draf perpanjangan kontrak kerja sama dengan mitra vendor.",
      weight: 3,
      weight_score: 3,
      status: "APPROVED",
      deadline: "2026-11-02",
      due_date: "2026-11-02",
      updated_at: "19 Ags 2026, 16:45 WIB",
      submission_file: "Kontrak_Mitra_Vendor_Final.pdf",
      submitted_at: "19 Ags 2026, 15:30 WIB",
      doc_type: "PDF Document",
      assigned_employee_id: 4,
      employee: { id: 4, user_id: 4, division_id: 3, nip: "19900104", name: "David Tran", full_name: "David Tran", position: "Legal Counsel" },
    },
  ];
}
