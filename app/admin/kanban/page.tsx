import { getKanbanApplicants, getJobPostings } from "@/app/actions/admin";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { Kanban, Sparkles } from "lucide-react";

export const metadata = {
  title: "Papan Kanban Rekrutmen | TalentHub Admin",
  description: "Manajemen visual kandidat 5-tahapan, saringan otomatis auto-tags, dan perpindahan status kandidat.",
};

export default async function KanbanPage() {
  const [{ applicants }, { jobs }] = await Promise.all([
    getKanbanApplicants(),
    getJobPostings(),
  ]);

  const jobsList = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Kanban className="w-3.5 h-3.5 text-emerald-400" />
            Visual Pipeline Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Papan Kanban Rekrutmen (Pipeline Board)
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm leading-relaxed">
            Geser kartu kandidat antar kolom tahapan rekrutmen. Sistem akan secara otomatis menyimpan perubahan status di database Supabase & mencatat Log Audit secara transparan.
          </p>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <KanbanBoard initialApplicants={applicants} jobsList={jobsList} />
    </div>
  );
}
