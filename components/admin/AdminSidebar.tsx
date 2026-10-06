"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Kanban, Briefcase, ShieldCheck, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

export default function AdminSidebar() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard & Analitik", icon: LayoutDashboard },
    { href: "/admin/kanban", label: "Papan Kanban Rekrutmen", icon: Kanban },
    { href: "/admin/jobs", label: "Manajemen Lowongan", icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-[#0c2b29] border-r border-emerald-800/40 hidden md:flex flex-col justify-between p-5 text-slate-100 sticky top-0 h-screen shrink-0 overflow-y-auto custom-scrollbar z-30">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-950/60">
            TH
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base tracking-tight">TalentHub</span>
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[9px] font-bold rounded uppercase">
                HR
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold">Recruitment Admin</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-4 border-t border-emerald-800/40">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                    : "text-slate-300 hover:text-white hover:bg-[#061f1d]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Role & SignOut */}
      <div className="space-y-3 pt-4 border-t border-emerald-800/40">
        <div className="bg-[#061f1d] p-3 rounded-xl border border-emerald-800/40 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-[11px] truncate">
            <p className="font-bold text-white">Mode Admin / HR</p>
            <p className="text-emerald-400 font-medium text-[10px]">Akses Penuh Terproteksi</p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
