"use client";

import React from "react";
import { HRAnalyticsSummary } from "@/types/admin";
import { Briefcase, Users, Sparkles, CheckCircle2, Clock, BarChart3, TrendingUp } from "lucide-react";

interface HRAnalyticsChartProps {
  analytics: HRAnalyticsSummary;
}

export default function HRAnalyticsChart({ analytics }: HRAnalyticsChartProps) {
  // Max count for bar chart scaling
  const maxApplicants = Math.max(...analytics.applicants_per_job.map((j) => j.count), 1);

  return (
    <div className="space-y-8">
      {/* 1. Quick Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lowongan Aktif</p>
            <p className="text-3xl font-extrabold text-white mt-1">{analytics.active_jobs_count}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Posisi siap dilamar
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#061f1d] border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pelamar Masuk</p>
            <p className="text-3xl font-extrabold text-white mt-1">{analytics.total_applicants}</p>
            <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Kandidat terdaftar
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#061f1d] border border-emerald-800/60 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl border-l-4 border-l-purple-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahap Interview</p>
            <p className="text-3xl font-extrabold text-white mt-1">{analytics.interviewing_count}</p>
            <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Wawancara berjalan
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#061f1d] border border-emerald-800/60 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl border-l-4 border-l-emerald-400 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diterima (Hired)</p>
            <p className="text-3xl font-extrabold text-white mt-1">{analytics.hired_count}</p>
            <p className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Offering disetujui
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#061f1d] border border-emerald-800/60 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* 2. Light Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Applicants per Job Position */}
        <div className="lg:col-span-2 bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Grafik Jumlah Pelamar Per Lowongan Kerja
              </h2>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Distribusi total berkas lamaran yang masuk untuk setiap posisi aktif.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-lg">
              Live Supabase Analytics
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.applicants_per_job.map((item) => {
              const percentage = Math.round((item.count / maxApplicants) * 100);

              return (
                <div key={item.job_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white truncate max-w-xs">{item.job_title}</span>
                    <span className="text-emerald-400 font-bold">{item.count} Pelamar ({percentage}%)</span>
                  </div>

                  <div className="w-full h-3 bg-[#061f1d] rounded-full overflow-hidden border border-emerald-900/50">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time-to-Hire Analytics Card */}
        <div className="bg-gradient-to-br from-[#0c2b29] via-[#092322] to-[#15803d]/20 border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>

            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
              Efficiency Metric
            </span>

            <h3 className="text-xl font-extrabold text-white">
              Metrik Rata-rata Time-to-Hire
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Durasi rata-rata yang dibutuhkan tim HR sejak lamaran dibuka hingga kandidat menandatangani Surat Penawaran Kerja (Offering).
            </p>
          </div>

          <div className="bg-[#061f1d] border border-emerald-700/50 rounded-2xl p-5 text-center space-y-1">
            <p className="text-4xl font-extrabold text-emerald-300">
              {analytics.avg_time_to_hire_days} <span className="text-lg font-bold text-white">Hari</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">
              ⚡ 18% Lebih cepat dibanding target KPI standar 18 hari.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
