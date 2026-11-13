import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminDashboardLayoutClient from "@/components/admin/AdminDashboardLayoutClient";
import { getCandidateProfile } from "@/app/actions/candidate";

export const metadata = {
  title: "Admin HR Portal | Nexora Digital Recruitment",
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

  // Hitung jumlah kandidat yang sedang dalam proses rekrutmen (kecuali yang ditolak)
  const { data: appsData } = await supabase
    .from("applications")
    .select("id, status");

  const activeCandidateCount = (appsData || []).filter(
    (a) => a.status !== "Ditolak" && a.status !== "Rejected"
  ).length;

  return (
    <AdminThemeProvider>
      <AdminDashboardLayoutClient
        userEmail={user.email || ""}
        profile={profile}
        activeCandidateCount={activeCandidateCount}
      >
        {children}
      </AdminDashboardLayoutClient>
    </AdminThemeProvider>
  );
}
