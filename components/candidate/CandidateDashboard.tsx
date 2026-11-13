"use client";

import React from "react";
import Link from "next/link";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import StatusBadge from "./StatusBadge";
import IsometricWireframeCube from "./IsometricWireframeCube";
import {
  Briefcase,
  ArrowRight,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Award,
} from "lucide-react";

interface CandidateDashboardProps {
  profile: CandidateProfile | null;
  userEmail: string;
  applications: JobApplication[];
}

export default function CandidateDashboard({
  profile,
  userEmail,
  applications,
}: CandidateDashboardProps) {
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

  // Active application (status not Ditolak)
  const activeApp = applications.find(
    (a) => !["Ditolak", "Rejected"].includes(a.status)
  );

  const profileScore = profile?.profile_score ?? 0;
  const isProfileComplete = profileScore >= 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. HERO SECTION (RuangAman Visual Style) */}
      <section className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 p-6 sm:p-8 lg:p-10 shadow-xs hover:shadow-sm transition-all duration-300">
        {/* Radial Gradient Glow (Pencahayaan Modern) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.18),rgba(15,118,110,0.04)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.22),transparent_75%)] pointer-events-none blur-xl -z-0" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-teal-400/8 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* 3D Floating Isometric Wireframe Cubes (Opasitas 10% - 20%, Teal & Slate) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0" aria-hidden="true">
          {/* Top-Right Teal Wireframe Cube */}
          <div className="absolute top-4 right-8 lg:right-16 animate-float-slow opacity-18">
            <IsometricWireframeCube
              size={84}
              color="#0F766E"
              secondaryColor="#14B8A6"
              fillOpacity={0.08}
              strokeWidth={1.3}
              className="transform rotate-12"
            />
          </div>

          {/* Top-Left Slate Wireframe Cube */}
          <div className="absolute top-8 left-1/3 animate-float-reverse opacity-12 hidden md:block">
            <IsometricWireframeCube
              size={60}
              color="#475569"
              secondaryColor="#94A3B8"
              fillOpacity={0.06}
              strokeWidth={1.2}
              className="transform -rotate-12"
            />
          </div>

          {/* Bottom-Right Deep Teal Cube */}
          <div className="absolute -bottom-6 right-1/4 animate-float-gentle opacity-15 hidden sm:block">
            <IsometricWireframeCube
              size={52}
              color="#0F766E"
              secondaryColor="#2DD4BF"
              fillOpacity={0.09}
              strokeWidth={1.4}
              className="transform rotate-45"
            />
          </div>
        </div>

        {/* Main Hero Content (Two-Column Layout) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Greeting & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* RuangAman-Style Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 text-xs font-bold border border-teal-200/80 dark:border-teal-800/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-teal-400 animate-pulse" />
              <span>Portal Rekrutmen Nexora Digital</span>
            </div>

            {/* Headline with Deep Teal Highlight */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Selamat Datang Kembali, <br className="hidden sm:inline" />
              <span className="text-[#0F766E] dark:text-[#14B8A6]">{fullName}!</span> 👋
            </h1>

            {/* Clean Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Pantau perkembangan lamaran Anda secara transparan, kelola jadwal assessment & interview bersama tim HR, serta pastikan profil NIK Anda terverifikasi 100%.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Cari Lowongan Kerja</span>
              </Link>

              <Link
                href="/dashboard/applications"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#061f1d] dark:hover:bg-teal-900/40 border border-slate-200/90 dark:border-teal-800/60 text-slate-800 dark:text-teal-200 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs"
              >
                <ClipboardList className="w-4 h-4 text-slate-600 dark:text-teal-400" />
                <span>Daftar Lamaran Saya ({totalApplied})</span>
              </Link>

              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#061f1d] dark:hover:bg-teal-900/40 border border-slate-200/90 dark:border-teal-800/60 text-slate-800 dark:text-teal-200 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-slate-600 dark:text-teal-400" />
                <span>Kelola Profil & KTP</span>
              </Link>
            </div>
          </div>

          {/* Right Column: RuangAman Interactive Status Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 dark:bg-[#092322]/90 border border-slate-200/80 dark:border-teal-800/60 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              {/* Profile Header in Card */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-teal-900/60">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={fullName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-teal-700/60 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {fullName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200/70 dark:border-teal-800/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                  <span>1 NIK = 1 Akun</span>
                </div>
              </div>

              {/* Profile Completeness Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                    Skor Kelengkapan Profil
                  </span>
                  <span className={`font-black ${isProfileComplete ? "text-[#0F766E] dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {profileScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isProfileComplete
                        ? "bg-gradient-to-r from-[#0F766E] to-[#14B8A6]"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(profileScore, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isProfileComplete
                    ? "✓ Profil 100% lengkap dan siap melamar posisi."
                    : "Lengkapi data NIK, KTP, dan berkas untuk mencapai 100%."}
                </p>
              </div>

              {/* Active Application Status or Empty State */}
              <div className="pt-2 border-t border-slate-100 dark:border-teal-900/60">
                {activeApp ? (
                  <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200/80 dark:border-teal-800/50 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Lamaran Sedang Berjalan
                      </span>
                      <StatusBadge status={activeApp.status} size="sm" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeApp.job_title}
                    </h4>
                    <Link
                      href={`/dashboard/applications/${activeApp.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#0d6962] dark:text-teal-300 dark:hover:text-teal-200 transition-colors"
                    >
                      <span>Lacak Jadwal & Progres</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200/80 dark:border-teal-800/50 rounded-xl p-3.5 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Belum Ada Lamaran Aktif
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Anda dapat memilih 1 lowongan kerja untuk memulai proses rekrutmen.
                    </p>
                    <Link
                      href="/dashboard/jobs"
                      className="inline-block pt-1 text-xs font-bold text-[#0F766E] hover:underline dark:text-teal-300"
                    >
                      + Cari Posisi Pekerjaan
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CANDIDATE QUICK STATS CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          {
            label: "Total Lamaran",
            value: totalApplied,
            icon: Briefcase,
            accentBg: "bg-teal-50 dark:bg-teal-950/60",
            iconColor: "text-[#0F766E] dark:text-teal-300",
            borderColor: "border-l-[#0F766E]",
          },
          {
            label: "Tahap Seleksi",
            value: inReviewCount,
            icon: Clock,
            accentBg: "bg-blue-50 dark:bg-blue-950/60",
            iconColor: "text-blue-600 dark:text-blue-300",
            borderColor: "border-l-blue-500",
          },
          {
            label: "Jadwal Interview",
            value: interviewCount,
            icon: Sparkles,
            accentBg: "bg-purple-50 dark:bg-purple-950/60",
            iconColor: "text-purple-600 dark:text-purple-300",
            borderColor: "border-l-purple-500",
          },
          {
            label: "Tawaran Kerja (Offer)",
            value: offeredCount,
            icon: CheckCircle2,
            accentBg: "bg-emerald-50 dark:bg-emerald-950/60",
            iconColor: "text-emerald-600 dark:text-emerald-300",
            borderColor: "border-l-emerald-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs border-l-4 ${stat.borderColor} flex items-center justify-between transition-all`}
            >
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${stat.accentBg} border border-slate-200/60 dark:border-teal-800/40 flex items-center justify-center ${stat.iconColor} shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. MY APPLICATIONS SUMMARY SECTION */}
      <section className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-teal-800/40 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
              Ringkasan Lamaran Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Posisi lowongan pekerjaan yang baru saja Anda lamar dan perkembangannya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white text-xs font-bold transition-all shadow-2xs"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Buka Tabel Lengkap</span>
            </Link>

            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#061f1d] dark:hover:bg-teal-900/40 text-slate-700 dark:text-teal-300 border border-slate-200/90 dark:border-teal-800/50 text-xs font-bold transition-all shadow-2xs"
            >
              <span>+ Lamar Posisi Lain</span>
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-dashed border-slate-200 dark:border-teal-900/60 rounded-2xl p-8 sm:p-10 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 dark:text-teal-600 mx-auto" />
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">
              Belum Ada Lamaran Aktif
            </p>
            <p className="text-xs max-w-sm mx-auto">
              Anda belum pernah melamar posisi apapun. Silakan jelajahi Papan Karier sekarang.
            </p>
            <Link
              href="/dashboard/jobs"
              className="inline-block px-4 py-2 bg-[#0F766E] hover:bg-[#0d6962] text-white rounded-xl font-bold text-xs shadow-2xs transition-colors"
            >
              Cari Lowongan Pekerjaan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-[#061f1d] border border-slate-200/80 dark:border-teal-800/40 hover:border-slate-300 dark:hover:border-teal-600 rounded-2xl p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-teal-950 text-slate-700 dark:text-teal-300 border border-slate-200 dark:border-teal-800 text-[10px] font-bold uppercase tracking-wider">
                      {app.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-50 dark:bg-teal-950/60 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-teal-900 text-[10px] font-semibold">
                      {app.job_type}
                    </span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {app.job_title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                      Melamar:{" "}
                      {new Date(app.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-teal-900/60 flex items-center gap-2.5 shrink-0">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-xs transition-all shadow-2xs hover:shadow-xs"
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
