import { getAllAssessmentsWithCandidateInfo, getActiveCandidatesForScheduling } from "@/app/actions/admin";
import EvaluationsManager from "@/components/admin/EvaluationsManager";

export const metadata = {
  title: "Penilaian Seleksi & Wawancara | TalentHub HR",
  description: "Portal penginputan nilai tes dan interview kandidat bagi penilai dan tim HR.",
};

export default async function AdminEvaluationsPage() {
  const [{ assessments }, { candidates }] = await Promise.all([
    getAllAssessmentsWithCandidateInfo(),
    getActiveCandidatesForScheduling(),
  ]);

  return <EvaluationsManager initialAssessments={assessments} activeCandidates={candidates} />;
}
