"use client";

import React, { useState } from "react";
import { Job, allJobs, departments } from "@/data/jobs";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import QuickApplyModal from "./QuickApplyModal";
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, Zap, CheckCircle2, ArrowRight, Sparkles, Eye, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";

interface CandidateJobBoardProps {
  profile: CandidateProfile | null;
  existingApplications: JobApplication[];
  jobsList?: Job[];
}

export default function CandidateJobBoard({ profile, existingApplications, jobsList }: CandidateJobBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");

  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set of job IDs candidate has applied to
  const appliedJobIds = new Set(existingApplications.map((app) => app.job_id));

  // Check if candidate currently has ANY active application (not rejected)
  const activeApplication = existingApplications.find((app) => {
    const s = (app.status || "").toLowerCase();
    return s !== "ditolak" && s !== "rejected";
  });

  // Check profile completeness (strictly 100% required)
  const isProfileComplete = Boolean(
    profile?.full_name?.trim() &&
    profile?.nik?.trim()?.length === 16 &&
    profile?.ktp_url?.trim() &&
    (profile?.phone?.trim() || profile?.whatsapp?.trim()) &&
    profile?.address?.trim() &&
    (profile?.headline?.trim() || profile?.bio?.trim()) &&
    profile?.education && profile.education.length > 0 &&
    profile?.skills && profile.skills.length > 0 &&
    profile?.experience && profile.experience.length > 0 &&
    profile?.resume_url?.trim()
  );

  const sourceJobs = (jobsList || []).filter((job: any) => {
    if (job.status && (job.status.toLowerCase() === "closed" || job.status.toLowerCase() === "nonaktif")) {
      return false;
    }
    if (job.deadline_date && new Date(job.deadline_date) < new Date()) {
      return false;
    }
    return true;
  });

  // Filter logic matching accurate job type variants (Hybrid, On-site, Remote)
  const filteredJobs = sourceJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "Semua" || job.dept === selectedDept;

    let matchesType = true;
    if (selectedType === "Hybrid") {
      matchesType =
        job.type.toLowerCase().includes("hybrid") ||
        job.location.toLowerCase().includes("hybrid");
    } else if (selectedType === "On-site") {
      const t = job.type.toLowerCase();
      const l = job.location.toLowerCase();
      matchesType =
        t.includes("on-site") ||
        t.includes("onsite") ||
        t.includes("wfo") ||
        t.includes("kantor") ||
        l.includes("wfo") ||
        l.includes("on-site");
    } else if (selectedType === "Remote") {
      const t = job.type.toLowerCase();
      const l = job.location.toLowerCase();
      matchesType =
        t.includes("remote") ||
        t.includes("wfh") ||
        l.includes("remote") ||
        l.includes("wfh");
    }

    return matchesSearch && matchesDept && matchesType;
  });

  const handleApplySuccess = (jobId: string, message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-emerald-900 border border-emerald-400 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
          <div>
            <p className="font-bold text-sm">Lamaran Berhasil!</p>
            <p className="text-xs text-emerald-200">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-xs font-bold text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-teal-400 animate-pulse" />
            <span>Portal Lowongan Kerja Kandidat</span>
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Eksplorasi Lowongan & <span className="text-[#0F766E] dark:text-[#14B8A6]">Lamar Cepat</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Gunakan fitur <strong>Lamar Cepat (1-Click Apply)</strong> untuk mengirimkan berkas lamaran Anda secara instan menggunakan profil terstruktur & CV PDF.
          </p>
        </div>
      </div>

      {/* 2. Active Application Alert (Blocking Rule Notification) */}
      {activeApplication ? (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Lamaran Aktif Sedang Berjalan: {activeApplication.job_title}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Tahap seleksi saat ini: <strong className="underline">{activeApplication.display_status || activeApplication.status}</strong>. Sesuai ketentuan, Anda hanya dapat melamar 1 posisi dalam satu waktu dan baru dapat melamar posisi lain jika lamaran ini dinyatakan <strong>Ditolak</strong>.
            </p>
            <div className="pt-1">
              <Link
                href={`/dashboard/applications/${activeApplication.id}`}
                className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200 hover:underline"
              >
                <span>Pantau Progres Lamaran Aktif Anda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : !isProfileComplete ? (
        <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm text-xs sm:text-sm text-blue-900 dark:text-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Profil Anda Belum Lengkap 100%</p>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              Sesuai aturan rekrutmen, Anda wajib melengkapi NIK (16 digit), unggah berkas KTP, data diri, riwayat pendidikan, dan berkas CV PDF di menu Profil sebelum dapat mengajukan lamaran pekerjaan.
            </p>
            <div className="pt-1">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 font-bold text-blue-900 dark:text-blue-200 hover:underline"
              >
                <span>Lengkapi Profil 100% Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
              placeholder="Cari posisi pekerjaan atau skill..."
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Departemen: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter: Hybrid, On-site, Remote */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="Semua">Tipe Kerja: Semua</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site (WFO)</option>
              <option value="Remote">Remote (WFH)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-3 shadow-sm transition-colors">
            <Briefcase className="w-12 h-12 text-slate-400 dark:text-emerald-600 mx-auto" />
            <p className="text-base font-bold text-slate-900 dark:text-white">Tidak ada posisi pekerjaan yang cocok.</p>
            <p className="text-xs">Coba ubah kata kunci atau filter departemen Anda.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);
            const appliedRecord = existingApplications.find((a) => a.job_id === job.id);

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 hover:border-slate-300 dark:hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-700/40 text-xs font-semibold">
                      {job.dept}
                    </span>
                    <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 text-xs font-semibold">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-600 dark:text-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                      <span>Batas Akhir: {job.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-emerald-800/40">
                  {hasApplied ? (
                    <div className="space-y-3 w-full">
                      {/* Action buttons (Detail Lowongan & Lacak Progress) */}
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/60 text-slate-700 hover:text-slate-900 dark:text-emerald-300 dark:hover:text-white border border-slate-200 dark:border-emerald-800/80 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail Lowongan</span>
                        </Link>
                        {appliedRecord && (
                          <Link
                            href={`/dashboard/applications/${appliedRecord.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-emerald-400 hover:underline transition-colors"
                          >
                            <span>Lacak Progress</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {/* Status Sudah Dilamar ditaruh paling bawah sekali */}
                      <div className="pt-2 border-t border-slate-100 dark:border-emerald-800/30">
                        <span className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Sudah Dilamar oleh Kandidat</span>
                        </span>
                      </div>
                    </div>
                  ) : activeApplication ? (
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/60 text-slate-700 hover:text-slate-900 dark:text-emerald-300 dark:hover:text-white border border-slate-200 dark:border-emerald-800/80 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail Lowongan</span>
                      </Link>

                      <button
                        type="button"
                        disabled
                        className="py-2 px-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                        title={`Anda memiliki lamaran aktif untuk posisi "${activeApplication.job_title}". Anda hanya dapat melamar lowongan baru jika lamaran aktif tersebut berstatus Ditolak.`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Terkunci</span>
                      </button>
                    </div>
                  ) : !isProfileComplete ? (
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/60 text-slate-700 hover:text-slate-900 dark:text-emerald-300 dark:hover:text-white border border-slate-200 dark:border-emerald-800/80 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail Lowongan</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                        title="Lengkapi profil 100% terlebih dahulu untuk melamar lowongan ini"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Lengkapi Profil</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-900/60 text-slate-700 hover:text-slate-900 dark:text-emerald-300 dark:hover:text-white border border-slate-200 dark:border-emerald-800/80 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail Lowongan</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedJobForModal(job)}
                        className="py-2.5 px-3 bg-[#0F766E] hover:bg-[#0d6962] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-teal-200" />
                        <span>Lamar Cepat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Apply Confirmation Modal */}
      {selectedJobForModal && (
        <QuickApplyModal
          job={selectedJobForModal}
          profile={profile}
          onClose={() => setSelectedJobForModal(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
