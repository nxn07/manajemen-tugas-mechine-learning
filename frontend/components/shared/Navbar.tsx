"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth-service";
import { User } from "@/types/api";
import { Shield, Briefcase, UserCheck, LogOut, Search, Bell } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load user data on mount and when storage updates
  useEffect(() => {
    const loadUserData = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser?.email && typeof window !== "undefined") {
        const cleanEmail = currentUser.email.trim().toLowerCase();
        const savedAvatar = localStorage.getItem(`simkap_user_avatar_${cleanEmail}`);
        if (savedAvatar) {
          setAvatar(savedAvatar);
        } else {
          setAvatar(null);
        }
      }
    };

    loadUserData();

    const handleUpdate = () => loadUserData();
    window.addEventListener("simkap_user_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("simkap_user_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Add keyboard shortcut for search (/ to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        const searchInput = document.getElementById("navbar-search") as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Dashboard Overview";
      case "/tasks":
        return "Manajemen Penugasan";
      case "/evaluations":
        return "Evaluasi Kinerja";
      case "/divisions":
        return "Master Divisi";
      case "/kpis":
        return "Kriteria KPI";
      case "/users":
        return "Manajemen User & RBAC";
      case "/activity-logs":
        return "Log Aktivitas";
      case "/settings":
        return "Pengaturan Sistem";
      default:
        return "Dashboard Kinerja";
    }
  };

  const getRoleBadge = (roleName?: string) => {
    const r = roleName?.toUpperCase() || "ADMIN";
    if (r === "ADMIN") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-rose-100 to-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-sm">
          <Shield className="w-3 h-3 text-rose-600" /> ADMIN
        </span>
      );
    } else if (r === "MANAGER") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1 shadow-sm">
          <Briefcase className="w-3 h-3 text-blue-600" /> MANAGER
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 shadow-sm">
          <UserCheck className="w-3 h-3 text-emerald-600" /> EMPLOYEE
        </span>
      );
    }
  };

  // Determine status color based on time (simplified - always online for now)
  const getStatusColor = () => {
    return "bg-emerald-500"; // Can be expanded to check last activity
  };

  return (
    <>
      {/* Modern Gradient Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs flex items-center justify-between px-6">
        {/* Left Section - Page Title */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">
              {getPageTitle(pathname)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
              Central Saga Enterprise Performance
            </span>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              id="navbar-search"
              type="text"
              placeholder="Search tasks, employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/90 border border-slate-200/60 rounded-full text-xs focus:bg-white focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all hover:bg-slate-100 hover:border-slate-300 placeholder:text-slate-400"
            />
            <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-200/80 rounded">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-teal-600 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 group"
            title="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:animate-pulse" />
            {/* Future: Add notification count badge here */}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all px-3 py-2 group cursor-pointer active:scale-95"
            >
              {/* Avatar with Status Dot */}
              <div className="relative w-9 h-9 shrink-0">
                <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-500/20 shadow-md`}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                      {user?.name?.slice(0, 2).toUpperCase() || "CS"}
                    </div>
                  )}
                </div>
                {/* Online Status Indicator */}
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor()}`} />
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {user?.name || "Admin System"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                  {user?.email || "admin@gmail.com"}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu - Glassmorphic */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden animate-fade-in-up-small z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-bold text-sm text-slate-900">{user?.name || "Admin System"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || "admin@gmail.com"}</p>
                  <div className="mt-1">
                    {getRoleBadge(user?.role)}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 transition-all flex items-center gap-2"
                  >
                    <SettingsIcon /> Pengaturan Profil
                  </button>
                  <button
                    onClick={() => {
                      router.push("/activity-logs");
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 transition-all flex items-center gap-2"
                  >
                    <HistoryIcon /> Log Aktivitas
                  </button>
                </div>

                {/* Logout Button */}
                <div className="px-4 py-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close dropdown */}
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </>
  );
}

// Simple icon components
const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
