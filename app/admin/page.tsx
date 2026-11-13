import { getHRAnalytics } from "@/app/actions/admin";
import HRAnalyticsChart from "@/components/admin/HRAnalyticsChart";
import Link from "next/link";
import { Kanban, Briefcase, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Dashboard & Analitik | Nexora Digital Admin",
  description: "Metrik rekrutmen dan statistik pelamar aktif.",
};

export default async function AdminDashboardPage() {
  const { analytics } = await getHRAnalytics();

  return (
    <div className="space-y-6">
      {/* Clean Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-teal-800/40">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard & Analitik
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan status lowongan, aktivitas seleksi, dan kandidat aktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/kanban"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Papan Kanban</span>
          </Link>

          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c2b29] hover:bg-slate-50 dark:hover:bg-[#061f1d] border border-slate-200 dark:border-teal-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Lowongan</span>
          </Link>
        </div>
      </div>

      {/* Analytics & Metrics */}
      <HRAnalyticsChart analytics={analytics} />
    </div>
  );
}
