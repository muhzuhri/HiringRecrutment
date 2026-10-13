import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCandidateProfile, getCandidateApplications } from "@/app/actions/candidate";
import { getJobByIdFromSupabase } from "@/app/actions/jobs";
import CandidateJobDetailClient from "@/components/candidate/CandidateJobDetailClient";
import { ArrowLeft, Briefcase } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { job } = await getJobByIdFromSupabase(id);
  if (!job) return { title: "Lowongan Tidak Ditemukan | TalentHub" };
  return {
    title: `${job.title} | Detail Lowongan Kandidat`,
    description: job.description,
  };
}

export default async function CandidateJobDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/jobs/${id}`);
  }

  const [{ profile }, { applications }, { job }] = await Promise.all([
    getCandidateProfile(),
    getCandidateApplications(),
    getJobByIdFromSupabase(id),
  ]);

  if (!job) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-[#0c2b29] px-4 py-2 rounded-xl border border-emerald-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Papan Lowongan</span>
        </Link>
      </div>

      <CandidateJobDetailClient
        job={job}
        profile={profile}
        existingApplications={applications}
      />
    </div>
  );
}
