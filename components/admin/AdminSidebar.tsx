"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Briefcase,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  Award,
  Users,
  User,
  PanelLeftClose,
  X,
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";

interface AdminSidebarProps {
  role?: string;
  activeCandidateCount?: number;
  onClose?: () => void;
  isCollapsible?: boolean;
}

export default function AdminSidebar({
  role = "admin",
  activeCandidateCount = 0,
  onClose,
  isCollapsible = false,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isInterviewer = role === "interviewer" || role === "penilai";

  const NAV_ITEMS = isInterviewer
    ? [
        { href: "/admin/evaluations", label: "Penilaian Seleksi", icon: ClipboardCheck },
        { href: "/admin/profile", label: "Profil Saya", icon: User },
      ]
    : [
        { href: "/admin", label: "Dashboard & Analitik", icon: LayoutDashboard },
        {
          href: "/admin/kanban",
          label: "Papan Kanban",
          icon: Kanban,
          badgeCount: activeCandidateCount,
        },
        { href: "/admin/evaluations", label: "Penilaian Seleksi", icon: ClipboardCheck },
        { href: "/admin/jobs", label: "Manajemen Lowongan", icon: Briefcase },
        { href: "/admin/users", label: "Kelola Akun Staf", icon: Users },
        { href: "/admin/profile", label: "Profil Saya", icon: User },
      ];

  const isLinkActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-white/95 dark:bg-[#0c2b29]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-teal-800/40 flex flex-col justify-between p-4 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar transition-colors shadow-sm">
      <div className="space-y-4">
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={isInterviewer ? "/admin/evaluations" : "/admin"}
            className="flex items-center gap-2.5 group"
          >
            {/* Nexora Digital Official Logo */}
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-200/80 dark:border-teal-800/40 shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
              <img
                src="/nexora-logo.jpg"
                alt="Nexora Digital Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                  Nexora<span className="text-[#0F766E] dark:text-teal-400"> Digital</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-teal-300/80 font-semibold truncate">
                {isInterviewer ? "Portal Penilai" : "Portal HR Admin"}
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
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-3 border-t border-slate-100 dark:border-teal-800/40">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#0F766E] text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#061f1d]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-white" : "text-slate-400 dark:text-teal-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Badge Count on Kanban */}
                {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active
                        ? "bg-white text-[#0F766E]"
                        : "bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60"
                    }`}
                    title={`${item.badgeCount} kandidat aktif`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Role & SignOut */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-teal-800/40">
        <div className="bg-slate-50/80 dark:bg-[#061f1d] p-2.5 rounded-xl border border-slate-200/80 dark:border-teal-800/40 flex items-center gap-2.5">
          {isInterviewer ? (
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-teal-400 shrink-0" />
          )}
          <div className="text-[10px] truncate">
            <p className="font-bold text-slate-900 dark:text-white">
              {isInterviewer ? "Mode Penilai" : "Mode Admin HR"}
            </p>
            <p className="text-slate-500 dark:text-teal-300/70 font-medium">
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
