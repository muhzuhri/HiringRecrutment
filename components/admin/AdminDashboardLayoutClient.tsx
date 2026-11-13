"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import RuangAmanBackground from "@/components/candidate/RuangAmanBackground";
import { CandidateProfile } from "@/types/candidate";

interface AdminDashboardLayoutClientProps {
  userEmail: string;
  profile?: CandidateProfile | null;
  activeCandidateCount?: number;
  children: React.ReactNode;
}

export default function AdminDashboardLayoutClient({
  userEmail,
  profile,
  activeCandidateCount = 0,
  children,
}: AdminDashboardLayoutClientProps) {
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-ruangaman-grid dark:bg-[#061f1d] text-slate-900 dark:text-slate-100 flex font-sans selection:bg-[#0F766E] selection:text-white dark:selection:bg-teal-500 transition-colors relative">
      {/* RuangAman Background: Grid + Radial Glow + Floating 3D Cubes */}
      <RuangAmanBackground />

      {/* 1. PERMANENT FIXED SIDEBAR (DESKTOP - SELALU TETAP) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-30 flex-col">
        <AdminSidebar
          role={profile?.role}
          activeCandidateCount={activeCandidateCount}
          isCollapsible={false}
        />
      </div>

      {/* 2. MOBILE DRAWER OVERLAY & SIDEBAR */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 md:hidden transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          role={profile?.role}
          activeCandidateCount={activeCandidateCount}
          onClose={() => setMobileMenuOpen(false)}
          isCollapsible={true}
        />
      </div>

      {/* 3. MAIN CONTENT CONTAINER (OFFSET MD:PL-64 UNTUK SIDEBAR TETAP) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen relative z-10 transition-all duration-300">
        {/* Top Header */}
        <AdminHeader
          userEmail={userEmail}
          profile={profile}
          activeCandidateCount={activeCandidateCount}
          sidebarOpen={true}
          onToggleSidebar={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-[#0c2b29]/80 backdrop-blur-sm border-t border-slate-200/80 text-slate-500 dark:border-teal-800/40 dark:text-teal-300/80 text-xs py-6 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Nexora Digital – Portal Staf & Penilai Terproteksi.</p>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-teal-300 font-semibold">
                Protected by Supabase Auth & RLS
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

