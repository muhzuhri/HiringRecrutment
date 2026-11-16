import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import PenilaiDashboardLayoutClient from "@/components/penilai/PenilaiDashboardLayoutClient";
import { getCandidateProfile } from "@/app/actions/candidate";

export const metadata = {
  title: "Portal Penilai | Nexora Digital",
  description: "Portal Penilaian Seleksi & Evaluasi Kandidat Nexora Digital.",
};

export default async function PenilaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?redirect=/penilai");
  }

  // Fetch candidate/admin profile
  const { profile } = await getCandidateProfile();

  // Cegah kandidat masuk ke portal staf/penilai
  if (profile?.role === "candidate") {
    redirect("/dashboard");
  }

  return (
    <AdminThemeProvider>
      <PenilaiDashboardLayoutClient
        userEmail={user.email || ""}
        profile={profile}
      >
        {children}
      </PenilaiDashboardLayoutClient>
    </AdminThemeProvider>
  );
}
