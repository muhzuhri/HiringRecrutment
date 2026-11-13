"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import {
  LogOut,
  User,
  Briefcase,
  FileText,
  Shield,
  Menu,
  X,
  Sparkles,
  ClipboardList,
  Sun,
  Moon,
} from "lucide-react";
import { CandidateProfile } from "@/types/candidate";
import { useTheme } from "@/components/theme/ThemeProvider";

interface CandidateHeaderProps {
  profile: CandidateProfile | null;
  userEmail: string;
}

export default function CandidateHeader({ profile, userEmail }: CandidateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation menu list including new "Daftar Lamaran Saya"
  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: FileText, exactMatch: true },
    { href: "/dashboard/jobs", label: "Cari Lowongan", icon: Briefcase, exactMatch: false },
    { href: "/dashboard/applications", label: "Lamaran Saya", icon: ClipboardList, exactMatch: false },
    { href: "/dashboard/profile", label: "Profil", icon: User, exactMatch: false },
  ];

  const fullName = profile?.full_name || userEmail.split("@")[0] || "Kandidat";
  const userInitials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isLinkActive = (item: (typeof navItems)[0]) => {
    if (item.href === "/dashboard/applications") {
      return pathname.startsWith("/dashboard/applications");
    }
    if (item.exactMatch) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#132238] border-b border-slate-800/80 text-white shadow-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* 1. LEFT: Brand & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all focus:outline-none cursor-pointer"
                aria-label="Buka Navigation Menu"
                id="candidate-mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/dashboard" className="flex items-center gap-3 group" id="candidate-logo-link">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-white p-1 border border-teal-800/40 shadow-md group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
                  <img
                    src="/nexora-logo.jpg"
                    alt="Nexora Digital Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                      Nexora<span className="text-teal-400"> Digital</span>
                    </span>
                    <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-teal-300 border border-slate-700">
                      Candidate
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
                    Recruitment Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. CENTER: Main Navigation Links (RuangAman Pill Bar) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-full border border-slate-700/80 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                      active
                        ? "bg-[#0d9488] text-white shadow-md shadow-teal-950/50"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT: Theme Toggle + User Profile + Logout */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
                aria-label="Ubah Tema"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden lg:inline text-[11px]">Mode Gelap</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden lg:inline text-[11px]">Mode Terang</span>
                  </>
                )}
              </button>

              {/* User Avatar & Name Pill */}
              

              {/* Logout Button */}
              <form action={signOutAction}>
                <button
                  type="submit"
                  id="candidate-logout-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 hover:bg-rose-950/80 hover:border-rose-700 hover:text-rose-200 text-slate-200 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm group"
                  title="Keluar dari akun Anda"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-300 transition-colors" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </header>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-80 bg-white dark:bg-[#0c2b29] border-r border-slate-200 dark:border-emerald-800/60 p-6 text-slate-900 dark:text-slate-100 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto transition-colors">
            <div className="space-y-6">
              
              {/* Mobile Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-emerald-800/50">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={fullName}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-teal-500 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#1e3a5f] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                      {userInitials || "N"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{fullName}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Portal Kandidat
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Switcher in Mobile Drawer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-emerald-300">Tema Tampilan</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700/60 text-xs font-bold text-slate-800 dark:text-white"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                      <span>Mode Gelap</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mode Terang</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 uppercase tracking-wider px-3 mb-2">
                  Navigasi Utama
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#061f1d]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-500 dark:text-emerald-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Admin Portal Button in Mobile Menu if applicable */}
              {(profile?.role === "admin" || profile?.role === "recruiter") && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300 text-xs font-bold transition-all hover:bg-amber-500/20"
                  >
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Portal HR / Admin</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Footer & User Account Logout */}
            <div className="pt-6 border-t border-slate-200 dark:border-emerald-800/50 space-y-3">
              <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 rounded-xl border border-slate-200 dark:border-emerald-800/50 text-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-emerald-900 border border-slate-300 dark:border-emerald-600/50 flex items-center justify-center font-bold text-slate-800 dark:text-emerald-200 shrink-0">
                  {userInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{fullName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-300/80 truncate">{userEmail}</p>
                </div>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:border-rose-800/60 dark:text-rose-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
