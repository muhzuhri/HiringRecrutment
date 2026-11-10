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
  Calendar
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const appliedRecord = existingApplications.find((app) => app.job_id === job.id);
  const hasApplied = Boolean(appliedRecord);

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
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl space-y-8 transition-colors">
        {/* Header Title & Badges */}
        <div className="border-b border-slate-200 dark:border-emerald-800/40 pb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-700/50 text-xs font-bold">
                {job.dept}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 text-xs font-semibold">
                {job.type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {job.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-600 dark:text-emerald-200/90 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-emerald-400 shrink-0" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white">{job.salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-emerald-400 shrink-0" />
                <span>Diposting: {job.posted}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400 dark:text-emerald-400 shrink-0" />
                <span>Batas Akhir: {job.deadline}</span>
              </div>
            </div>
          </div>

          {/* Action Area in Header */}
          <div className="shrink-0 space-y-3 w-full md:w-auto">
            {hasApplied ? (
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
            <Briefcase className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
            Deskripsi Pekerjaan
          </h2>
          <p className="text-slate-700 dark:text-emerald-100/90 text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-[#061f1d] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-emerald-900/60 whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
              Tanggung Jawab Utama
            </h2>
            <div className="bg-slate-50 dark:bg-[#061f1d] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-emerald-900/60">
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
              <Star className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
              Persyaratan Kualifikasi
            </h2>
            <div className="bg-slate-50 dark:bg-[#061f1d] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-emerald-900/60">
              <ul className="space-y-3">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-emerald-100/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{qual}</span>
                  </li>
                ))}
              </ul>

              {job.niceToHave && job.niceToHave.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-emerald-900/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-emerald-300 mb-3">
                    Nilai Tambah (Nice to Have)
                  </h3>
                  <ul className="space-y-2">
                    {job.niceToHave.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80">
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
        <div className="pt-6 border-t border-slate-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Batas waktu pendaftaran hingga <strong>{job.deadline}</strong>.
          </div>

          {hasApplied ? (
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
