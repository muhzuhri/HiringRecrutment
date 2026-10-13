"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { LogOut, User, Briefcase, FileText, Home, Shield, Menu, X, CheckCircle2, Sparkles } from "lucide-react";
import { CandidateProfile } from "@/types/candidate";

interface CandidateHeaderProps {
  profile: CandidateProfile | null;
  userEmail: string;
}

export default function CandidateHeader({ profile, userEmail }: CandidateHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact navigation menu list in requested proportional order
  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: FileText, exactMatch: true },
    { href: "/dashboard/jobs", label: "Cari Lowongan", icon: Briefcase, exactMatch: false },
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
    if (item.exactMatch) {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard" || pathname.startsWith("/dashboard/applications");
      }
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c2b29]/95 backdrop-blur-md border-b border-emerald-800/40 text-slate-100 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* 1. LEFT: Brand & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-[#061f1d] border border-emerald-800/80 text-emerald-300 hover:text-white hover:border-emerald-500 transition-all focus:outline-none"
                aria-label="Buka Navigation Menu"
                id="candidate-mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/dashboard" className="flex items-center gap-3 group" id="candidate-logo-link">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                      Talent<span className="text-emerald-400">Hub</span>
                    </span>
                    <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Candidate
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 -mt-0.5">
                    Recruitment Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. CENTER: Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#061f1d]/90 p-1.5 rounded-2xl border border-emerald-900/60 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                        : "text-slate-300 hover:text-white hover:bg-emerald-900/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-emerald-400"}`} />
                    <span>{item.label}</span>

                    {/* Active indicator dot */}
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT: User Profile & Logout Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Admin Portal Badge (If user is Admin / Recruiter) */}
              {(profile?.role === "admin" || profile?.role === "recruiter") && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-sm"
                  title="Masuk ke Portal Admin HR"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Portal Admin</span>
                </Link>
              )}

              {/* User Avatar & Info Pill */}
              <div className="hidden sm:flex items-center gap-3 pl-2 sm:pl-3 border-l border-emerald-800/40">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-100 text-xs shadow-md">
                  {userInitials}
                </div>
                <div className="text-left leading-tight hidden lg:block">
                  <p className="text-xs font-bold text-white truncate max-w-[130px]">{fullName}</p>
                  <p className="text-[10px] text-emerald-300/80 truncate max-w-[130px]">{userEmail}</p>
                </div>
              </div>

              {/* Logout Button */}
              <form action={signOutAction}>
                <button
                  type="submit"
                  id="candidate-logout-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700/60 hover:bg-rose-950 hover:border-rose-700 text-slate-200 hover:text-rose-200 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm group"
                  title="Keluar dari akun Anda"
                >
                  <LogOut className="w-4 h-4 text-emerald-400 group-hover:text-rose-300 transition-colors" />
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-80 bg-[#0c2b29] border-r border-emerald-800/60 p-6 text-slate-100 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              
              {/* Mobile Header */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    TH
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">TalentHub Candidate</h3>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Portal Rekrutmen
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1.5">
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 mb-2">
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
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/60"
                          : "text-slate-300 hover:text-white hover:bg-[#061f1d]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-emerald-400"}`} />
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
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all hover:bg-amber-500/30"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Portal HR / Admin</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Footer & User Account Logout */}
            <div className="pt-6 border-t border-emerald-800/50 space-y-3">
              <div className="bg-[#061f1d] p-3.5 rounded-xl border border-emerald-800/50 text-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900 border border-emerald-600/50 flex items-center justify-center font-bold text-emerald-200 shrink-0">
                  {userInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white truncate">{fullName}</p>
                  <p className="text-[10px] text-emerald-300/80 truncate">{userEmail}</p>
                </div>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-bold transition-all cursor-pointer"
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
