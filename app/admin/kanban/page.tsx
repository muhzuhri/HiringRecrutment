import { getKanbanApplicants, getJobPostings } from "@/app/actions/admin";
import KanbanBoard from "@/components/admin/KanbanBoard";
import { Kanban, Sparkles } from "lucide-react";

export const metadata = {
  title: "Papan Kanban Rekrutmen | TalentHub Admin",
  description: "Manajemen visual kandidat 7-tahapan seleksi linear, saringan otomatis auto-tags, jadwal tes/interview, dan penetapan keputusan.",
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
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-700/50 text-xs font-semibold text-slate-700 dark:text-emerald-300">
            <Kanban className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" />
            Visual Pipeline Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Papan Kanban Rekrutmen (Pipeline Board)
          </h1>
          <p className="text-slate-600 dark:text-emerald-200/80 text-xs sm:text-sm leading-relaxed">
            Geser kartu kandidat antar kolom tahapan rekrutmen. Sistem akan secara otomatis menyimpan perubahan status di database Supabase & mencatat Log Audit secara transparan.
          </p>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <KanbanBoard initialApplicants={applicants} jobsList={jobsList} />
    </div>
  );
}
