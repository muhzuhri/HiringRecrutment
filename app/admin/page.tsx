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
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Executive Recruitment Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Utama & Analitik HR
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm leading-relaxed">
            Pantau metrik rekrutmen secara real-time, statistik pelamar per lowongan, dan efisiensi durasi Time-to-Hire dalam satu dasbor terpadu.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/kanban"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/60"
          >
            <Kanban className="w-4 h-4" />
            <span>Papan Kanban</span>
          </Link>

          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#061f1d] hover:bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-bold text-xs sm:text-sm transition-all"
          >
            <Briefcase className="w-4 h-4" />
            <span>Kelola Job</span>
          </Link>
        </div>
      </div>

      {/* Analytics & Metrics */}
      <HRAnalyticsChart analytics={analytics} />
    </div>
  );
}
