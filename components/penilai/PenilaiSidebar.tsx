"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  User,
  LogOut,
  Award,
  X,
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";

interface PenilaiSidebarProps {
  userName?: string;
  onClose?: () => void;
  isCollapsible?: boolean;
}

export default function PenilaiSidebar({
  userName = "Penilai Seleksi",
  onClose,
  isCollapsible = false,
}: PenilaiSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/penilai", label: "Penilaian Seleksi", icon: ClipboardCheck },
    { href: "/penilai/profile", label: "Profil Saya", icon: User },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/penilai") {
      return pathname === "/penilai";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-white/95 dark:bg-[#132238]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-4 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar transition-colors shadow-sm">
      <div className="space-y-4">
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/penilai"
            prefetch={true}
            className="flex items-center gap-2.5 group"
          >
            {/* Nexora Digital Official Logo */}
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-200/80 dark:border-slate-800/80 shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
              <img
                src="/nexora-icon-trans.png"
                alt="Nexora Digital"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                  Nexora<span className="text-[#0F766E] dark:text-teal-400"> Digital</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-teal-300/80 font-semibold truncate">
                Portal Penilai
              </p>
            </div>
          </Link>

          {/* Close Button for Mobile Drawer */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? "bg-[#0F766E] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-teal-300"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Mode Penilai Badge & Logout */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        {/* Mode Penilai Role Pill */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <Award className="w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-[11px] leading-tight truncate">Mode Penilai</p>
            <p className="text-[10px] opacity-80 leading-tight truncate">
              Input Nilai & Evaluasi
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40 transition-all cursor-pointer"
          >
            <div className="h-6 w-6 rounded-full bg-slate-900 dark:bg-black text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              N
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Keluar Portal Staf</span>
            </div>
          </button>
        </form>
      </div>
    </aside>
  );
}
