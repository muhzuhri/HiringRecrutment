import { getHRAnalytics } from "@/app/actions/admin";
import HRAnalyticsChart from "@/components/admin/HRAnalyticsChart";
import Link from "next/link";
import { Kanban, Briefcase, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Dashboard & Analitik HR | TalentHub Admin",
  description: "Metrik cepat rekrutmen, statistik pelamar per lowongan, dan rata-rata Time-to-Hire.",
};

export default async function AdminDashboardPage() {
  const { analytics } = await getHRAnalytics();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700/50 text-xs font-semibold text-slate-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" />
            Executive Recruitment Overview
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Utama & Analitik HR
          </h1>
          <p className="text-slate-600 dark:text-emerald-200/80 text-xs leading-relaxed">
            Pantau metrik rekrutmen secara real-time, statistik pelamar per lowongan, dan efisiensi durasi Time-to-Hire dalam satu dasbor terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/kanban"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
          >
            <Kanban className="w-4 h-4" />
            <span>Papan Kanban</span>
          </Link>

          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#061f1d] hover:bg-slate-200 dark:hover:bg-emerald-950 border border-slate-300 dark:border-emerald-800/60 text-slate-700 dark:text-emerald-300 font-bold text-xs transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Kelola Lowongan</span>
          </Link>
        </div>
      </div>

      {/* Analytics & Metrics */}
      <HRAnalyticsChart analytics={analytics} />
    </div>
  );
}
