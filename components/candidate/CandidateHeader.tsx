"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { LogOut, User, Briefcase, FileText, CheckCircle2, Shield } from "lucide-react";
import { CandidateProfile } from "@/types/candidate";

interface CandidateHeaderProps {
  profile: CandidateProfile | null;
  userEmail: string;
}

export default function CandidateHeader({ profile, userEmail }: CandidateHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "My Applications", icon: FileText },
    { href: "/dashboard/jobs", label: "Cari Lowongan", icon: Briefcase },
    { href: "/dashboard/profile", label: "Profil & CV Saya", icon: User },
  ];

  const fullName = profile?.full_name || userEmail.split("@")[0] || "Kandidat";

  return (
    <header className="sticky top-0 z-40 bg-[#0c2b29] border-b border-emerald-800/40 text-slate-100 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  Talent<span className="text-emerald-400">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block -mt-1">
                  Candidate Portal
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/40 text-xs text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Aktif
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#061f1d] p-1.5 rounded-2xl border border-emerald-900/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname.startsWith("/dashboard/applications")
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                      : "text-slate-300 hover:text-white hover:bg-emerald-900/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-3">
            {(profile?.role === "admin" || profile?.role === "recruiter") && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Portal Admin</span>
              </Link>
            )}

            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-emerald-800/40">
              <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-600/50 flex items-center justify-center font-extrabold text-emerald-200 text-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-100 truncate max-w-[140px]">{fullName}</p>
                <p className="text-[11px] text-emerald-300/80 truncate max-w-[140px]">{userEmail}</p>
              </div>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/50 hover:bg-rose-950/50 hover:border-rose-700/50 text-slate-200 hover:text-rose-300 text-xs sm:text-sm font-semibold transition-all duration-200"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-emerald-900/60 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/applications")
                : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-emerald-900/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
