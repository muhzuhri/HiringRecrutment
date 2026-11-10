"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CandidateProfile } from "@/types/candidate";
import { ShieldCheck, Menu, X, LayoutDashboard, Kanban, Briefcase, ClipboardCheck, LogOut, Sun, Moon, Award } from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";
import { useAdminTheme } from "./AdminThemeProvider";

interface AdminHeaderProps {
  userEmail: string;
  profile?: CandidateProfile | null;
}

export default function AdminHeader({ userEmail, profile }: AdminHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();
  const isInterviewer = profile?.role === "interviewer";
  const displayName = profile?.full_name || userEmail.split("@")[0] || (isInterviewer ? "Penilai Seleksi" : "Recruiter HR");

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
    <>
      <header className="bg-white dark:bg-[#0c2b29] border-b border-slate-200 dark:border-emerald-800/40 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm transition-colors">
        {/* Mobile Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-700 dark:text-emerald-300 hover:text-slate-900 transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700/50 text-xs font-bold text-slate-700 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Portal Sistem Aktif</span>
              <span className="sm:hidden">Portal Staf</span>
            </span>
          </div>
        </div>

        {/* Right Section: Theme Toggle + User Profile */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-100 dark:bg-[#061f1d] hover:bg-slate-200 dark:hover:bg-emerald-950 text-slate-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
          >
            {theme === "light" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Mode Gelap</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Mode Terang</span>
              </>
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-emerald-900/60">
            <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-emerald-700 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-slate-800 dark:text-white leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-emerald-400 font-medium leading-tight">{userEmail}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-72 bg-white dark:bg-[#0c2b29] border-r border-slate-200 dark:border-emerald-800/50 p-6 text-slate-800 dark:text-slate-100 flex flex-col justify-between h-full z-10 shadow-2xl animate-slide-in-left transition-colors">
            <div className="space-y-6">
              {/* Header & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-emerald-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs">
                    TH
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">TalentHub</h3>
                    <p className="text-[10px] text-slate-500 dark:text-emerald-400">Portal Staf Mobile</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#061f1d]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-emerald-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer & Logout */}
            <div className="pt-4 border-t border-slate-200 dark:border-emerald-800/40 space-y-3">
              <div className="bg-slate-100 dark:bg-[#061f1d] p-3 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-slate-500 dark:text-emerald-400">{userEmail}</p>
              </div>

              <form action={adminSignOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Portal Staf</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
