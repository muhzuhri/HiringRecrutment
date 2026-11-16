import React from "react";
import {
  getAllAssessmentsWithCandidateInfo,
  getActiveCandidatesForScheduling,
} from "@/app/actions/admin";
import { getCandidateProfile } from "@/app/actions/candidate";
import PenilaiEvaluationsClient from "@/components/penilai/PenilaiEvaluationsClient";

export const metadata = {
  title: "Penilaian Seleksi | Portal Penilai Nexora Digital",
  description: "Portal penginputan nilai tes dan evaluasi seleksi kandidat khusus aktor penilai.",
};

export default async function PenilaiPage() {
  const [{ assessments }, { candidates }, { profile }] = await Promise.all([
    getAllAssessmentsWithCandidateInfo(),
    getActiveCandidatesForScheduling(),
    getCandidateProfile(),
  ]);

  return (
    <div className="space-y-6">
      <PenilaiEvaluationsClient
        initialAssessments={assessments}
        activeCandidates={candidates}
        userRole={profile?.role || "penilai"}
        userName={profile?.full_name || "Penilai Seleksi"}
      />
    </div>
  );
}
