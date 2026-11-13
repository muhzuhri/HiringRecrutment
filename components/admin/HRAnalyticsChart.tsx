"use client";

import React from "react";
import { HRAnalyticsSummary } from "@/types/admin";
import { Briefcase, Users, Sparkles, CheckCircle2, Clock, BarChart3, TrendingUp } from "lucide-react";

interface HRAnalyticsChartProps {
  analytics: HRAnalyticsSummary;
}

export default function HRAnalyticsChart({ analytics }: HRAnalyticsChartProps) {
  const maxApplicants = Math.max(...analytics.applicants_per_job.map((j) => j.count), 1);

  return (
    <div className="space-y-6">
      {/* 1. Quick Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Lowongan Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#0F766E] dark:text-teal-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{analytics.active_jobs_count}</p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium mt-1 inline-block">
            Posisi dibuka
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Pelamar</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{analytics.total_applicants}</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
            Kandidat terdaftar
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sedang Evaluasi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{analytics.interviewing_count}</p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1 inline-block">
            Tes & wawancara
          </span>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Diterima (Hired)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">{analytics.hired_count}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
            Lolos seleksi
          </span>
        </div>
      </section>

      {/* 2. Light Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart: Applicants per Job Position */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800/40 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-700 dark:text-emerald-400" />
                Grafik Jumlah Pelamar Per Lowongan Kerja
              </h2>
              <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">
                Distribusi real-time kandidat yang melamar pada lowongan aktif.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {analytics.applicants_per_job.length === 0 ? (
              <p className="text-slate-400 text-xs italic py-4 text-center">Belum ada data pelamar.</p>
            ) : (
              analytics.applicants_per_job.map((job) => {
                const percentage = Math.round((job.count / maxApplicants) * 100);

                return (
                  <div key={job.job_id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">{job.job_title}</span>
                        <span className="text-slate-400 dark:text-emerald-400 text-[10px] ml-2">({job.department})</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-emerald-300">{job.count} Pelamar</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-800 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Time-to-Hire Efficiency Metric Card */}
        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-emerald-800/40 pb-3">
              <Clock className="w-4 h-4 text-slate-700 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Efisiensi Time-to-Hire</h3>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/50 text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Waktu Rekrutmen</p>
              <p className="text-3xl font-black text-slate-900 dark:text-emerald-400">{analytics.avg_time_to_hire_text}</p>
              <p className="text-[10px] text-slate-500 dark:text-emerald-200/70">Dari tanggal melamar hingga berstatus Diterima</p>
            </div>

            <p className="text-xs text-slate-500 dark:text-emerald-200/80 leading-relaxed mt-4">
              Metrik dihitung otomatis saat HR menyetujui kandidat di tahap final, mencatat selisih hari antara lamaran pertama dibuat dan tanggal offering.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/40 text-[10px] text-slate-500 dark:text-slate-400">
            Data terverifikasi real-time dari tabel Supabase.
          </div>
        </div>
      </section>
    </div>
  );
}
