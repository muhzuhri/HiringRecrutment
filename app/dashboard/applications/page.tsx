import React from "react";
import { getCandidateProfile, getCandidateApplications } from "@/app/actions/candidate";
import CandidateApplicationsTable from "@/components/candidate/CandidateApplicationsTable";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Daftar Lamaran Saya | Nexora Digital",
  description: "Daftar seluruh lamaran kerja yang diajukan beserta status tahapan seleksi terstruktur.",
};

export default async function CandidateApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/applications");
  }

  const { applications } = await getCandidateApplications();

  return <CandidateApplicationsTable applications={applications || []} />;
}

