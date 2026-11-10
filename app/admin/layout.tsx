import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import { getCandidateProfile } from "@/app/actions/candidate";

export const metadata = {
  title: "Admin HR Portal | TalentHub Recruitment Tracking",
  description: "Dashboard Manajemen Rekrutmen, Papan Kanban, Screening Kandidat, & Analitik HR.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?redirect=/admin");
  }

  // Fetch candidate/admin profile
  const { profile } = await getCandidateProfile();

  return (
    <AdminThemeProvider>
      <div className="min-h-screen flex font-sans bg-slate-50 dark:bg-[#061f1d] text-slate-800 dark:text-slate-100 transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-emerald-500">
        {/* Sidebar Navigation */}
        <AdminSidebar role={profile?.role} />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#061f1d] transition-colors">
          <AdminHeader userEmail={user.email || ""} profile={profile} />

          <main className="flex-1 p-5 sm:p-7 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>

          <footer className="border-t border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-[#0c2b29] text-slate-500 dark:text-emerald-400/80 text-xs py-4 px-8 flex flex-col sm:flex-row justify-between items-center gap-2 mt-12 transition-colors">
            <p>© {new Date().getFullYear()} TalentHub Recruitment Tracking - Mode Staf Terproteksi.</p>
            <p className="font-semibold text-slate-600 dark:text-emerald-300">Protected by Supabase Auth & RLS</p>
          </footer>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
