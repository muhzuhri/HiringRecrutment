"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Kanban, Briefcase, ClipboardCheck, ShieldCheck, LogOut, Award } from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";

interface AdminSidebarProps {
  role?: string;
}

export default function AdminSidebar({ role = "admin" }: AdminSidebarProps) {
  const pathname = usePathname();

  const isInterviewer = role === "interviewer";

  const NAV_ITEMS = isInterviewer
    ? [
        { href: "/admin/evaluations", label: "Penilaian Seleksi (Penilai)", icon: ClipboardCheck },
      ]
    : [
        { href: "/admin", label: "Dashboard & Analitik", icon: LayoutDashboard },
        { href: "/admin/kanban", label: "Papan Kanban Rekrutmen", icon: Kanban },
        { href: "/admin/evaluations", label: "Penilaian Seleksi (Penilai)", icon: ClipboardCheck },
        { href: "/admin/jobs", label: "Manajemen Lowongan", icon: Briefcase },
      ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0c2b29] border-r border-slate-200 dark:border-emerald-800/40 hidden md:flex flex-col justify-between p-4 text-slate-800 dark:text-slate-100 sticky top-0 h-screen shrink-0 overflow-y-auto custom-scrollbar z-30 transition-colors">
      <div className="space-y-5">
        {/* Brand Logo */}
        <Link href={isInterviewer ? "/admin/evaluations" : "/admin"} className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            TH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">TalentHub</span>
              <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-700/50 text-[9px] font-bold rounded uppercase">
                {isInterviewer ? "PENILAI" : "HR"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-emerald-400 font-semibold">
              {isInterviewer ? "Portal Penilai & Assessor" : "Admin Rekrutmen"}
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-3 border-t border-slate-200 dark:border-emerald-800/40">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#061f1d]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-emerald-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Role & SignOut */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-emerald-800/40">
        <div className="bg-slate-50 dark:bg-[#061f1d] p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center gap-2.5">
          {isInterviewer ? (
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-emerald-400 shrink-0" />
          )}
          <div className="text-[10px] truncate">
            <p className="font-bold text-slate-900 dark:text-white">
              {isInterviewer ? "Mode Penilai" : "Mode Admin HR"}
            </p>
            <p className="text-slate-500 dark:text-emerald-400 font-medium">
              {isInterviewer ? "Input Nilai & Evaluasi" : "Akses Penuh Terproteksi"}
            </p>
          </div>
        </div>

        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Portal Staf</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
