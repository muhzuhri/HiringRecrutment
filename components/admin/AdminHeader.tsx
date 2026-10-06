"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CandidateProfile } from "@/types/candidate";
import { ShieldCheck, Menu, X, LayoutDashboard, Kanban, Briefcase, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

interface AdminHeaderProps {
  userEmail: string;
  profile?: CandidateProfile | null;
}

export default function AdminHeader({ userEmail, profile }: AdminHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = profile?.full_name || userEmail.split("@")[0] || "Recruiter HR";

  const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard & Analitik", icon: LayoutDashboard },
    { href: "/admin/kanban", label: "Papan Kanban Rekrutmen", icon: Kanban },
    { href: "/admin/jobs", label: "Manajemen Lowongan", icon: Briefcase },
  ];

  return (
    <>
      <header className="bg-[#0c2b29] border-b border-emerald-800/40 sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
        {/* Mobile Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-emerald-300 hover:text-white transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">HR Portal System Active</span>
              <span className="sm:hidden">HR Portal</span>
            </span>
          </div>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-bold text-white">{displayName}</p>
            <p className="text-[10px] text-emerald-400 font-semibold">{userEmail}</p>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-72 bg-[#0c2b29] border-r border-emerald-800/50 p-6 text-slate-100 flex flex-col justify-between h-full z-10 shadow-2xl animate-slide-in-left">
            <div className="space-y-6">
              {/* Header & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
                    TH
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">TalentHub Admin</h3>
                    <p className="text-[10px] text-emerald-400">Mode HR Mobile</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-900/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
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

            {/* Mobile Footer & Logout */}
            <div className="pt-4 border-t border-emerald-800/40 space-y-3">
              <div className="bg-[#061f1d] p-3 rounded-xl border border-emerald-800/40 text-xs">
                <p className="font-bold text-white">{displayName}</p>
                <p className="text-[10px] text-emerald-400">{userEmail}</p>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Sistem</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
