"use client";

import React from "react";
import Link from "next/link";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import StatusBadge from "./StatusBadge";
import { Briefcase, ArrowRight, Calendar, UserCheck, Sparkles, CheckCircle2, Clock, MapPin, ClipboardList } from "lucide-react";

interface CandidateDashboardProps {
  profile: CandidateProfile | null;
  userEmail: string;
  applications: JobApplication[];
}

export default function CandidateDashboard({ profile, userEmail, applications }: CandidateDashboardProps) {
  const fullName = profile?.full_name || userEmail.split("@")[0] || "Kandidat";

  // Calculate statistics
  const totalApplied = applications.length;
  const inReviewCount = applications.filter((a) =>
    ["In Review", "Applied", "Diajukan", "Diproses"].includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) => a.status === "Interview").length;
  const offeredCount = applications.filter((a) =>
    ["Offered", "Diterima", "Hired"].includes(a.status)
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome Greeting Banner */}
      <section className="bg-white dark:bg-gradient-to-br dark:from-[#0c2b29] dark:via-[#092322] dark:to-[#15803d]/30 border border-slate-200 dark:border-emerald-800/50 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950/90 text-slate-700 dark:text-emerald-300 text-xs font-semibold border border-slate-200 dark:border-emerald-700/50">
            <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" />
            <span>Portal Resmi Kandidat TalentHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Selamat datang kembali, <span className="text-emerald-600 dark:text-emerald-400">{fullName}</span>! 👋
          </h1>

          <p className="text-slate-600 dark:text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Pantau status progres lamaran Anda secara kronologis real-time, dapatkan undangan interview dari HR, dan lengkapi data profil terstruktur Supabase Anda.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              <span>Cari Lowongan Baru</span>
            </Link>

            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/40 border border-slate-300 dark:border-emerald-700/50 text-slate-800 dark:text-emerald-200 font-semibold text-xs sm:text-sm transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Tabel Lamaran Saya ({totalApplied})</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/40 border border-slate-300 dark:border-emerald-700/50 text-slate-800 dark:text-emerald-200 font-semibold text-xs sm:text-sm transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Kelola Profil & CV</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Candidate Quick Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: "Total Lamaran", value: totalApplied, border: "border-l-slate-800 dark:border-l-emerald-500", icon: Briefcase, color: "text-slate-700 dark:text-emerald-400" },
          { label: "Tahap Seleksi", value: inReviewCount, border: "border-l-blue-500", icon: Clock, color: "text-blue-600 dark:text-blue-400" },
          { label: "Jadwal Interview", value: interviewCount, border: "border-l-purple-500", icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
          { label: "Tawaran Kerja (Offer)", value: offeredCount, border: "border-l-emerald-500", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-300" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 ${stat.border} flex items-center justify-between transition-colors`}
            >
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/50 flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. My Applications Summary Section */}
      <section className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-7 shadow-sm transition-colors space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-emerald-800/40 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
              Ringkasan Lamaran Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">
              Posisi lowongan pekerjaan yang baru saja Anda lamar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Buka Tabel Lengkap</span>
            </Link>

            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/60 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-700/50 text-xs font-bold transition-all"
            >
              <span>+ Lamar Posisi Lain</span>
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-8 sm:p-10 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 dark:text-emerald-600 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Belum Ada Lamaran Aktif</p>
            <p className="text-xs max-w-sm mx-auto">Anda belum pernah melamar posisi apapun. Silakan jelajahi Papan Karier sekarang.</p>
            <Link
              href="/dashboard/jobs"
              className="inline-block px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-sm"
            >
              Cari Lowongan Pekerjaan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/50 hover:border-slate-300 dark:hover:border-emerald-500/60 rounded-xl p-4 sm:p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 text-[10px] font-bold uppercase">
                      {app.department}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-900 text-[10px] font-semibold">
                      {app.job_type}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {app.job_title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                      Melamar: {new Date(app.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-emerald-900/60 flex items-center gap-2.5">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <span>Lacak Progres</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
