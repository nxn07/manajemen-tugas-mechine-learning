"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    <aside className="w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 h-screen sticky top-0 overflow-y-auto flex flex-col justify-between p-4 shrink-0 border-r border-white/5 z-40">
      {/* Modern Gradient Background */}
      
      <div>
        {/* Enhanced Brand Header with Logo Glow */}
        <div className="px-3 py-5 mb-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 border-2 border-emerald-500/40 ring-2 ring-emerald-500/20 animate-pulse-glow hover:animate-none transition-all hover:scale-105">
            <Image src={centralSagaLogo} alt="Central Saga" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-tight">
              Central Saga
            </h1>
            <p className="text-[10px] font-extrabold text-emerald-400 tracking-widest uppercase">
              Enterprise Performance
            </p>
          </div>
        </div>

        {/* Navigation Menu - Modernized */}
        <nav className="space-y-1">
          {menuItems
            .filter((item) => {
              if (!item.roles) return true;

              // FIX: Better role extraction with proper validation
              const extractRoleName = (r: unknown): string => {
                if (r === null || r === undefined) return "";
                if (typeof r === "string") {
                  const trimmed = r.trim().toUpperCase();
                  return trimmed ? trimmed : "";
                }
                if (typeof r === "object" && "name" in r && typeof r.name === "string") {
                  const trimmed = r.name.trim().toUpperCase();
                  return trimmed ? trimmed : "";
                }
                const str = String(r);
                return str.trim().toUpperCase() || "";
              };

              const getRawRoles = () => {
                if (Array.isArray(user?.roles) && user.roles.length > 0) return user.roles.filter(r => r && r.trim());
                if (user?.role && user.role.trim()) return [user.role];
                return ["ADMIN", "MANAGER", "EMPLOYEE"] as string[];
              };

              const userRoles = getRawRoles().map(extractRoleName).filter(r => r !== "");
              
              // If no valid roles found, show all menu items (defensive)
              if (userRoles.length === 0) return true;
              
              const hasRoleMatch = item.roles.some((r: any) => {
                const roleName = typeof r === "string" ? r.toUpperCase() : String(r).toUpperCase();
                return userRoles.includes(roleName);
              });

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
                  className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 pl-4"
                      : "text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:translate-x-1"
                  }`}
                >
                  {/* Active Left Accent Bar */}
                  {isActive && (
                    <span className="absolute left-0 w-1 h-full bg-emerald-400 rounded-r-lg" />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon 
                      className={`w-4.5 h-4.5 transition-all duration-300 ${
                        isActive ? "text-white drop-shadow-lg" : "text-slate-500 group-hover:text-emerald-400 group-hover:scale-110"
                      }`} 
                    />
                    <span className={`tracking-wide transition-all duration-300 ${isActive ? "" : "group-hover:tracking-wide"}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {isAuditLog && logCount > 0 && (
                    <span
                      className={`relative z-10 px-2 py-0.5 text-[10px] font-black rounded-full shadow-lg transition-all ${
                        isActive
                          ? "bg-white text-emerald-700"
                          : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
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

      {/* Glassmorphic User Footer */}
      <div className="pt-4 border-t border-white/10">
        {/* User Profile Card - Glass Effect */}
        <div className="px-3 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-sm flex items-center gap-3 mb-3">
          {/* Avatar Container - Circular */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500/30 shrink-0 shadow-md">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.slice(0, 2).toUpperCase() || "CS"}
              </div>
            )}
            {/* Status Dot - Online Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          
          {/* User Info */}
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="font-bold text-white truncate text-sm">
              {user?.name || "Admin System"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || "admin@gmail.com"}
            </p>
          </div>
        </div>

        {/* Logout Button - Red Gradient */}
        <button
          onClick={() => authService.logout()}
          className="group relative flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer active:scale-95 overflow-hidden"
        >
          {/* Shimmer Effect */}
          <span className="absolute inset-0 animate-shimmer pointer-events-none opacity-30" />
          
          {/* Background Gradient */}
          <span className="absolute inset-0 bg-gradient-to-r from-rose-600 via-orange-600 to-rose-600" />
          
          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Keluar (Logout)</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
