"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth-service";
import { auditLogService } from "@/services/audit-log-service";
import centralSagaLogo from "@/public/central-saga-logo.png";
import {
  LayoutDashboard,
  CheckSquare,
  Award,
  Building2,
  Target,
  Users,
  History,
  Settings,
  LogOut,
  BrainCircuit,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Manajemen Tugas", href: "/tasks", icon: CheckSquare, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Evaluasi Kinerja", href: "/evaluations", icon: Award, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { name: "Master Divisi", href: "/divisions", icon: Building2, roles: ["ADMIN"], permission: "divisions.manage" },
  { name: "Kriteria KPI", href: "/kpis", icon: Target, roles: ["ADMIN"], permission: "kpis.manage" },
  { name: "Manajemen User", href: "/users", icon: Users, roles: ["ADMIN", "MANAGER"], permission: "users.delete" },
  { name: "Log Aktivitas", href: "/activity-logs", icon: History, roles: ["ADMIN", "MANAGER"] },
  { name: "IntelliML Cluster", href: "/ml-clustering", icon: BrainCircuit, roles: ["ADMIN", "MANAGER"] },
  { name: "Pengaturan & Profil", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [logCount, setLogCount] = useState<number>(0);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = () => {
      if (user?.email && typeof window !== "undefined") {
        const cleanEmail = user.email.trim().toLowerCase();
        const saved = localStorage.getItem(`simkap_user_avatar_${cleanEmail}`);
        if (saved) setAvatar(saved);
      }
    };
    loadAvatar();

    const handleStorage = () => loadAvatar();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("simkap_user_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("simkap_user_updated", handleStorage);
    };
  }, [user]);

  useEffect(() => {
    // Lazy load audit log count - only on initial mount, then every 30 seconds
    const fetchUnreadCount = async () => {
      try {
        const count = await auditLogService.getUnreadCount();
        setLogCount(count);
      } catch {
        // ignore errors
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Poll every 30 seconds instead of 1.5 seconds (reduce from 40/sec to 2/min)
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen sticky top-0 overflow-y-auto flex flex-col justify-between p-4 shrink-0 border-r border-slate-800 z-40">
      <div>
        {/* Brand Header with Official Central Saga Green Logo & Name */}
        <div className="px-3 py-4 mb-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0 border-2 border-emerald-500/40 ring-2 ring-emerald-500/20">
            <Image src={centralSagaLogo} alt="Central Saga" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              Central Saga
            </h1>
            <p className="text-[10px] font-extrabold text-emerald-400 tracking-wide uppercase">
              Enterprise Performance
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems
            .filter((item) => {
              if (!item.roles) return true;

              const extractRoleName = (r: any): string => {
                if (!r) return "";
                if (typeof r === "string") return r.toUpperCase();
                if (typeof r === "object" && r.name) return String(r.name).toUpperCase();
                return String(r).toUpperCase();
              };

              const getRawRoles = () => {
                if (Array.isArray(user?.roles) && user.roles.length > 0) return user.roles;
                if (user?.role) return [user.role];
                return ["ADMIN", "MANAGER", "EMPLOYEE"];
              };

              const userRoles = getRawRoles().map(extractRoleName);
              const hasRoleMatch = item.roles.some((r) => userRoles.includes(r.toUpperCase()));

              const userPerms = user?.permissions || [];
              const hasPermMatch = item.permission
                ? userPerms.includes(item.permission) || userPerms.includes("*")
                : false;

              if (item.permission) {
                return hasRoleMatch || hasPermMatch;
              }

              return hasRoleMatch;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAuditLog = item.name === "Log Aktivitas";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {isAuditLog && logCount > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full shadow-2xs transition-all ${
                        isActive
                          ? "bg-white text-blue-700"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {logCount}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-xs flex items-center gap-2 text-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs overflow-hidden border border-blue-400/30 shrink-0">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase() || "CS"
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-slate-200 truncate text-[11px]">
              {user?.name || "Admin System"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || "admin@gmail.com"}
            </p>
          </div>
        </div>

        <button
          onClick={() => authService.logout()}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
