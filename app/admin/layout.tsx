import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
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
    redirect("/login?redirect=/admin");
  }

  // Fetch candidate/admin profile
  const { profile } = await getCandidateProfile();

  return (
    <div className="min-h-screen bg-[#061f1d] text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userEmail={user.email || ""} profile={profile} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>

        <footer className="bg-[#0c2b29] border-t border-emerald-800/40 text-emerald-400/80 text-xs py-4 px-8 flex justify-between items-center mt-12">
          <p>© {new Date().getFullYear()} TalentHub Recruitment Tracking - Mode Admin HR Terproteksi.</p>
          <p className="font-semibold text-emerald-300">Protected by Supabase Auth & RLS</p>
        </footer>
      </div>
    </div>
  );
}
