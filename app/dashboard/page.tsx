import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCandidateProfile, getCandidateApplications } from "@/app/actions/candidate";
import CandidateDashboard from "@/components/candidate/CandidateDashboard";

export const metadata = {
  title: "Dashboard Kandidat | Nexora Digital",
  description: "Daftar lamaran pekerjaan kandidat, status terkini, dan statistik progres.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [{ profile }, { applications }] = await Promise.all([
    getCandidateProfile(),
    getCandidateApplications(),
  ]);

  return (
    <CandidateDashboard
      profile={profile}
      userEmail={user.email || ""}
      applications={applications}
    />
  );
}
