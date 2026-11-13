import { getAllAssessmentsWithCandidateInfo, getActiveCandidatesForScheduling } from "@/app/actions/admin";
import { getCandidateProfile } from "@/app/actions/candidate";
import EvaluationsManager from "@/components/admin/EvaluationsManager";

export const metadata = {
  title: "Penilaian Seleksi | Nexora Digital Admin",
  description: "Portal penginputan nilai tes dan interview kandidat bagi penilai dan tim HR.",
};

export default async function AdminEvaluationsPage() {
  const [{ assessments }, { candidates }, { profile }] = await Promise.all([
    getAllAssessmentsWithCandidateInfo(),
    getActiveCandidatesForScheduling(),
    getCandidateProfile(),
  ]);

  return (
    <EvaluationsManager
      initialAssessments={assessments}
      activeCandidates={candidates}
      userRole={profile?.role || "hr"}
      userName={profile?.full_name || "Admin HR"}
    />
  );
}
