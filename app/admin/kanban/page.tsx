import { getKanbanApplicants, getJobPostings, getStaffAccounts } from "@/app/actions/admin";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { Kanban, Sparkles } from "lucide-react";

export const metadata = {
  title: "Papan Kanban | Nexora Digital Admin",
  description: "Manajemen visual kandidat tahapan seleksi rekrutmen.",
};

export default async function KanbanPage() {
  const [{ applicants }, { jobs }, { hrStaff, penilaiStaff }] = await Promise.all([
    getKanbanApplicants(),
    getJobPostings(),
    getStaffAccounts(),
  ]);

  const jobsList = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <div className="space-y-6">
      {/* Interactive Kanban Board */}
      <KanbanBoard
        initialApplicants={applicants}
        jobsList={jobsList}
        hrStaff={hrStaff}
        penilaiStaff={penilaiStaff}
      />
    </div>
  );
}
