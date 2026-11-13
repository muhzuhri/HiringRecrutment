"use client";

import React from "react";
import Link from "next/link";
import { CandidateProfile } from "@/types/candidate";
import {
  Menu,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Award,
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";
import { useAdminTheme } from "./AdminThemeProvider";

interface AdminHeaderProps {
  userEmail: string;
  profile?: CandidateProfile | null;
  activeCandidateCount?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function AdminHeader({
  userEmail,
  profile,
  activeCandidateCount = 0,
  sidebarOpen = true,
  onToggleSidebar,
}: AdminHeaderProps) {
  const { theme, toggleTheme } = useAdminTheme();

  const isInterviewer = profile?.role === "interviewer" || profile?.role === "penilai";
  const displayName =
    profile?.full_name ||
    userEmail.split("@")[0] ||
    (isInterviewer ? "Penilai Seleksi" : "HR Recruiter");

  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-[#132238] border-b border-slate-800/80 text-white shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* 1. LEFT: Mobile Toggle + Brand Logo (Mobile) / Portal Badge (Desktop) */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
                title="Buka Menu Sidebar"
                aria-label="Toggle Sidebar"
              >
                <Menu className="w-5 h-5 text-teal-400" />
              </button>
            )}

            {/* Brand Logo on Mobile */}
            <Link
              href={isInterviewer ? "/admin/evaluations" : "/admin"}
              className="flex items-center gap-2 group md:hidden"
            >
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-white p-0.5 border border-slate-700 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/nexora-logo.jpg"
                  alt="Nexora Digital Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Nexora<span className="text-teal-400"> Digital</span>
              </span>
            </Link>

            {/* Portal Badge Status on Desktop */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-teal-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>{isInterviewer ? "Portal Penilai & Assessor Seleksi" : "Portal HR & Recruitment Management"}</span>
            </div>
          </div>

          {/* 2. RIGHT: Compact Controls (Tema, Avatar Mini, & Keluar Icon Saja) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle - Icon Saja */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
              title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
              aria-label="Ubah Tema"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* User Avatar Circle - Icon/Initials Saja Tanpa Nama Teks */}
            <div
              className="w-8 h-8 rounded-full bg-[#0F766E] border border-teal-400/40 flex items-center justify-center font-bold text-white text-xs shadow-xs select-none"
              title={`${displayName} (${userEmail})`}
            >
              {userInitials || "ST"}
            </div>

            {/* Logout Button - Logo Icon Saja */}
            <form action={adminSignOutAction}>
              <button
                type="submit"
                className="p-2 rounded-full bg-slate-800/90 border border-slate-700 hover:bg-rose-950/80 hover:border-rose-700 hover:text-rose-200 text-slate-200 transition-all duration-200 cursor-pointer shadow-sm group"
                title="Keluar dari portal staf"
                aria-label="Keluar dari portal staf"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-300 transition-colors" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
