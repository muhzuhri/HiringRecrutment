import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCandidateProfile, getCandidateApplications } from "@/app/actions/candidate";
import { getJobsFromSupabase } from "@/app/actions/jobs";
import CandidateJobBoard from "@/components/candidate/CandidateJobBoard";

export const metadata = {
  title: "Papan Karier & Lowongan Aktif | TalentHub",
  description: "Cari lowongan pekerjaan terbaru dan gunakan fitur Lamar Cepat 1-click apply.",
};

export default async function JobBoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/jobs");
  }

  const [{ profile }, { applications }, { jobs }] = await Promise.all([
    getCandidateProfile(),
    getCandidateApplications(),
    getJobsFromSupabase(),
  ]);

  return (
    <CandidateJobBoard
      profile={profile}
      existingApplications={applications}
      jobsList={jobs}
    />
  );
}
