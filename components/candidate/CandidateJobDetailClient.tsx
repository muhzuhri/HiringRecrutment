"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Job, typeColors } from "@/data/jobs";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import QuickApplyModal from "./QuickApplyModal";
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Zap,
  CheckCircle2,
  ArrowRight,
  Check,
  Star,
  Building2,
  Calendar,
  AlertCircle,
  XCircle,
  X,
  Users,
  Sparkles,
} from "lucide-react";

interface CandidateJobDetailClientProps {
  job: Job;
  profile: CandidateProfile | null;
  existingApplications: JobApplication[];
}

export default function CandidateJobDetailClient({
  job,
  profile,
  existingApplications,
}: CandidateJobDetailClientProps) {
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [showRejectedAlert, setShowRejectedAlert] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const appliedRecord = existingApplications.find((app) => app.job_id === job.id);
  const isRejected = Boolean(
    appliedRecord &&
    ((appliedRecord.status || "").toLowerCase() === "ditolak" ||
     (appliedRecord.status || "").toLowerCase() === "rejected")
  );

  // Periksa apakah lowongan ini telah dibuka kembali setelah penolakan sebelumnya
  const jobReopenedTime = new Date(job.reopened_at || job.posted_date || job.updated_at || 0).getTime();
  const rejectionTime = appliedRecord ? new Date(appliedRecord.updated_at || appliedRecord.created_at || 0).getTime() : 0;
  const isNewPeriod = Boolean(isRejected && jobReopenedTime > rejectionTime);

  const isRejectedCurrentPeriod = Boolean(isRejected && !isNewPeriod);
  const hasApplied = Boolean(appliedRecord) && !isRejectedCurrentPeriod;

  const handleApplySuccess = (jobId: string, message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
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

      {/* Main Full-Width Job Detail Card (No Sidebar) */}
      <div className="bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl space-y-8 transition-colors">
        {/* Header Title & Badges */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-teal-300 border border-slate-200 dark:border-emerald-700/50 text-xs font-bold">
                {job.dept}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 text-xs font-semibold">
                {job.type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {job.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-600 dark:text-teal-200/90 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-teal-400 shrink-0" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400 dark:text-teal-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white">{job.salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-teal-400 shrink-0" />
                <span>Diposting: {job.posted}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400 dark:text-teal-400 shrink-0" />
                <span>Batas Akhir: {job.deadline}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-teal-200">
                <Users className="w-4 h-4 text-[#0F766E] dark:text-teal-400 shrink-0" />
                <span>Pelamar: <strong className="font-extrabold">{job.applicant_count || 0}</strong> orang</span>
              </div>
              <div className="flex items-center gap-2 text-[#0F766E] dark:text-teal-300 font-medium">
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Kuota Penerimaan: <strong className="font-extrabold">{job.quota || 5}</strong> posisi</span>
              </div>
            </div>
          </div>

          {/* Action Area in Header */}
          <div className="shrink-0 space-y-3 w-full md:w-auto">
            {isRejectedCurrentPeriod ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowRejectedAlert(true)}
                  className="w-full inline-flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group"
                  title="Klik untuk melihat informasi penolakan periode ini"
                >
                  <span className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Ditolak pada Periode Ini</span>
                  </span>
                  <span className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-900/80 flex items-center justify-center text-rose-800 dark:text-rose-200 text-xs font-black shadow-2xs group-hover:scale-110 transition-transform">
                    !
                  </span>
                </button>
                {appliedRecord && (
                  <Link
                    href={`/dashboard/applications/${appliedRecord.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B132B] dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-800 font-bold text-xs sm:text-sm transition-all"
                  >
                    <span>Lihat Riwayat Lamaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : hasApplied ? (
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-xs sm:text-sm font-bold w-full">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Sudah Dilamar oleh Kandidat
                </span>
                {appliedRecord && (
                  <Link
                    href={`/dashboard/applications/${appliedRecord.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Lacak Progres Lamaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedJobForModal(job)}
                className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Lamar Cepat Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-700 dark:text-teal-400" />
            Deskripsi Pekerjaan
          </h2>
          <p className="text-slate-700 dark:text-emerald-100/90 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-[#0B132B] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-slate-700 dark:text-teal-400" />
              Tanggung Jawab Utama
            </h2>
            <div className="bg-slate-50 dark:bg-[#0B132B] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-emerald-100/90">
                    <span className="w-2 h-2 rounded-full bg-slate-700 dark:bg-emerald-400 mt-2 shrink-0" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Qualifications */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-slate-700 dark:text-teal-400" />
              Persyaratan Kualifikasi
            </h2>
            <div className="bg-slate-50 dark:bg-[#0B132B] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ul className="space-y-3">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-emerald-100/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{qual}</span>
                  </li>
                ))}
              </ul>

              {job.niceToHave && job.niceToHave.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-teal-300 mb-3">
                    Nilai Tambah (Nice to Have)
                  </h3>
                  <ul className="space-y-2">
                    {job.niceToHave.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-teal-200/80">
                        <span className="text-amber-500 font-bold">★</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Banner */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Batas waktu pendaftaran hingga <strong>{job.deadline}</strong>.
          </div>

          {isRejectedCurrentPeriod ? (
            <button
              type="button"
              onClick={() => setShowRejectedAlert(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group"
              title="Klik untuk melihat informasi penolakan periode ini"
            >
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Ditolak pada Periode Ini</span>
              <span className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-900/80 flex items-center justify-center text-rose-800 dark:text-rose-200 text-xs font-black shadow-2xs group-hover:scale-110 transition-transform">
                !
              </span>
            </button>
          ) : hasApplied ? (
            <span className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-xs sm:text-sm font-bold">
              Sudah Dilamar oleh Kandidat
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedJobForModal(job)}
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4.5 h-4.5 text-amber-400" />
              <span>Lamar Cepat 1-Click</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Modal: Ditolak pada Periode Ini */}
      {showRejectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 max-w-sm sm:max-w-md w-full shadow-2xl relative space-y-3 text-center animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowRejectedAlert(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                Informasi Periode Seleksi
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {job.title}
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {job.dept} • {job.location}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-left space-y-2">
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 leading-snug">
                Lamaran Anda untuk posisi ini telah dinyatakan <strong>Gugur / Ditolak</strong> pada periode seleksi saat ini.
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Sesuai ketentuan rekrutmen, kandidat <strong>tidak dapat melamar kembali</strong> pada posisi yang sama selama periode ini masih berjalan.
              </p>
              <div className="p-2.5 rounded-lg bg-white/90 dark:bg-[#0B132B]/90 border border-rose-200/70 dark:border-rose-900/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                <p className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <span>💡</span>
                  <span>Kapan bisa mendaftar lagi?</span>
                </p>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Anda dapat mendaftar kembali apabila lowongan ini telah <strong>ditutup / expired</strong> dan <strong>dibuka kembali</strong> oleh HR pada batch berikutnya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/dashboard/applications"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B132B] dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs transition-colors text-center"
              >
                Riwayat Lamaran
              </Link>
              <button
                type="button"
                onClick={() => setShowRejectedAlert(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Modal */}
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
