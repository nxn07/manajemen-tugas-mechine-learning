"use client";

import Image from "next/image";
import centralSagaLogo from "@/public/central-saga-logo.png";
import { Server, ChevronRight, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/60 backdrop-blur-xl">
      {/* Main Content */}
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Column: Brand & Copyright */}
          <div className="flex items-center gap-4">
            {/* Logo Container */}
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center border-2 border-emerald-500/30 shadow-md ring-2 ring-emerald-500/10 transition-all group-hover:scale-110 group-hover:shadow-lg cursor-pointer">
                <Image src={centralSagaLogo} alt="Central Saga" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-xs bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Central Saga — Enterprise Performance
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-300 shadow-sm">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                © {new Date().getFullYear()} Central Saga Mandala. SIM-KAP. All rights reserved.
              </p>
            </div>
          </div>

          {/* Center Column: Quick Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="/settings" className="group inline-flex items-center gap-1.5 px-3 py-1.5 hover:text-teal-700 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-teal-600 after:transition-all hover:after:w-full">
              Pengaturan
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="/activity-logs" className="group inline-flex items-center gap-1.5 px-3 py-1.5 hover:text-blue-700 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full">
              Log Aktivitas
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Right Column: Server Status & Social Icons */}
          <div className="flex items-center gap-4">
            {/* Server Health Badge */}
            <div className="group relative px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl border border-emerald-200/60 shadow-sm">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Server className="w-4 h-4 text-emerald-600 drop-shadow-sm" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-emerald-900 text-[11px]">PostgreSQL 16.2</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">● Active</span>
                </div>
              </div>
            </div>

            {/* Social Media Icons - Using Generic Link Icon Instead of Github/Linkedin */}
            <div className="flex items-center gap-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all shadow-sm cursor-pointer active:scale-90" title="Social Media">
                {/* Generic link icon placeholder for social */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </a>
              
              <a href="#" className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all shadow-sm cursor-pointer active:scale-90" title="Email Us">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border Gradient Accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
    </footer>
  );
}
