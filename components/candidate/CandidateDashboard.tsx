"use client";

import React from "react";
import Link from "next/link";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import StatusBadge from "./StatusBadge";
import { Briefcase, ArrowRight, Calendar, UserCheck, Sparkles, CheckCircle2, Clock, MapPin } from "lucide-react";

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
    <div className="space-y-8">
      {/* 1. Welcome Greeting Banner */}
      <section className="bg-gradient-to-br from-[#0c2b29] via-[#092322] to-[#15803d]/30 border border-emerald-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 text-xs font-semibold border border-emerald-700/50 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Resmi Kandidat TalentHub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Selamat datang kembali, <span className="text-emerald-400">{fullName}</span>! 👋
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Pantau status progres lamaran Anda secara kronologis real-time, dapatkan undangan interview dari HR, dan lengkapi data profil terstruktur Supabase Anda.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/50"
            >
              <Briefcase className="w-4 h-4" />
              <span>Cari Lowongan Baru</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#061f1d] hover:bg-emerald-900/40 border border-emerald-700/50 text-emerald-200 font-semibold text-xs sm:text-sm transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Kelola Profil & CV</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Candidate Quick Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: "Total Lamaran", value: totalApplied, border: "border-l-emerald-500", icon: Briefcase, color: "text-emerald-400" },
          { label: "Tahap Seleksi", value: inReviewCount, border: "border-l-blue-500", icon: Clock, color: "text-blue-400" },
          { label: "Jadwal Interview", value: interviewCount, border: "border-l-purple-500", icon: Sparkles, color: "text-purple-400" },
          { label: "Tawaran Kerja (Offer)", value: offeredCount, border: "border-l-emerald-400", icon: CheckCircle2, color: "text-emerald-300" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-5 shadow-lg border-l-4 ${stat.border} flex items-center justify-between`}
            >
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-[#061f1d] border border-emerald-900/50 flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. My Applications Card List / Table */}
      <section className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Daftar Lamaran Saya (My Applications)
            </h2>
            <p className="text-xs text-emerald-200/70 mt-0.5">
              Semua posisi lowongan pekerjaan yang pernah Anda lamar beserta status visual terkini.
            </p>
          </div>

          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 text-xs font-bold transition-all w-fit"
          >
            <span>+ Lamar Posisi Lain</span>
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-[#061f1d] border border-emerald-900/60 rounded-2xl p-10 text-center text-slate-400 space-y-3">
            <Briefcase className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-base font-bold text-white">Belum Ada Lamaran Aktif</p>
            <p className="text-xs">Anda belum pernah melamar posisi apapun. Silakan jelajahi Papan Karier.</p>
            <Link
              href="/dashboard/jobs"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
            >
              Cari Lowongan Pekerjaan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#061f1d] border border-emerald-800/50 hover:border-emerald-500/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold uppercase">
                      {app.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-slate-300 border border-emerald-900 text-[11px] font-semibold">
                      {app.job_type}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {app.job_title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Melamar: {new Date(app.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-3 md:pt-0 border-t md:border-t-0 border-emerald-900/60 flex items-center gap-3">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950/50"
                  >
                    <span>Lacak Progres & Detail</span>
                    <ArrowRight className="w-4 h-4" />
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
