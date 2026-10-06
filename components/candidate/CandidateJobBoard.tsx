"use client";

import React, { useState } from "react";
import { Job, allJobs, departments } from "@/data/jobs";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import QuickApplyModal from "./QuickApplyModal";
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, Zap, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface CandidateJobBoardProps {
  profile: CandidateProfile | null;
  existingApplications: JobApplication[];
}

export default function CandidateJobBoard({ profile, existingApplications }: CandidateJobBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");

  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set of job IDs candidate has applied to
  const appliedJobIds = new Set(existingApplications.map((app) => app.job_id));

  // Filter logic
  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "Semua" || job.dept === selectedDept;
    const matchesType = selectedType === "Semua" || job.type === selectedType;

    return matchesSearch && matchesDept && matchesType;
  });

  const handleApplySuccess = (jobId: string, message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-8">
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

      {/* Banner */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Portal Lowongan Kerja Kandidat
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Eksplorasi Lowongan & Lamar Cepat
          </h1>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
            Gunakan fitur <strong>Lamar Cepat (1-Click Apply)</strong> untuk mengirimkan berkas lamaran Anda secara instan menggunakan profil & CV terstruktur Supabase.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Cari posisi pekerjaan atau skill..."
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Departemen: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Semua">Tipe Kerja: Semua</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-2 bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <Briefcase className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-base font-bold text-white">Tidak ada posisi pekerjaan yang cocok.</p>
            <p className="text-xs">Coba ubah kata kunci atau filter departemen Anda.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);
            const appliedRecord = existingApplications.find((a) => a.job_id === job.id);

            return (
              <div
                key={job.id}
                className="bg-[#0c2b29] border border-emerald-800/50 hover:border-emerald-500/50 rounded-2xl p-6 shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-xs font-semibold">
                      {job.dept}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-slate-300 border border-emerald-800/40 text-xs font-semibold">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Batas Akhir: {job.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-emerald-800/40 flex items-center justify-between gap-3">
                  {hasApplied ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Sudah Dilamar
                      </span>
                      {appliedRecord && (
                        <Link
                          href={`/dashboard/applications/${appliedRecord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white transition-colors"
                        >
                          <span>Lacak Progress</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedJobForModal(job)}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-950/60 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Lamar Cepat</span>
                      </button>
                    </>
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
