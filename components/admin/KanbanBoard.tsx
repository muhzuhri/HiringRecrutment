"use client";

import React, { useState } from "react";
import { CandidateApplicantCard } from "@/types/admin";
import { ApplicationStatus } from "@/types/candidate";
import { updateApplicantStatus } from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import Link from "next/link";
import { Search, Filter, ArrowRight, Eye, ChevronRight, ChevronLeft, CheckCircle2, User, FileText } from "lucide-react";

interface KanbanBoardProps {
  initialApplicants: CandidateApplicantCard[];
  jobsList: { id: string; title: string }[];
}

const KANBAN_COLUMNS: { id: ApplicationStatus; title: string; color: string; border: string }[] = [
  { id: "Applied", title: "1. Applied", color: "bg-amber-950/40 text-amber-300", border: "border-amber-700/50" },
  { id: "In Review", title: "2. Screening / In Progress", color: "bg-blue-950/40 text-blue-300", border: "border-blue-700/50" },
  { id: "Interview", title: "3. Interview", color: "bg-purple-950/40 text-purple-300", border: "border-purple-700/50" },
  { id: "Offered", title: "4. Offered", color: "bg-emerald-950/40 text-emerald-300", border: "border-emerald-700/50" },
  { id: "Hired", title: "5. Hired / Accepted", color: "bg-teal-950/40 text-teal-300", border: "border-teal-700/50" },
];

export default function KanbanBoard({ initialApplicants, jobsList }: KanbanBoardProps) {
  const [applicants, setApplicants] = useState<CandidateApplicantCard[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("Semua");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter candidates
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJob = selectedJobId === "Semua" || app.job_id === selectedJobId;
    return matchesSearch && matchesJob;
  });

  // Handle stage move action
  const handleMoveStatus = async (appId: string, targetStatus: ApplicationStatus) => {
    setUpdatingId(appId);

    // Optimistic UI update
    setApplicants((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, status: targetStatus } : item))
    );

    const res = await updateApplicantStatus(appId, targetStatus);
    setUpdatingId(null);

    if (!res.success) {
      alert(res.error || "Gagal memperbarui status kandidat.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Cari nama kandidat, email, atau posisi..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="Semua">Filter Posisi: Semua Posisi</option>
            {jobsList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colApplicants = filteredApplicants.filter((a) => a.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-4 flex flex-col min-h-[500px] shadow-lg"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-xl border ${col.border} ${col.color} mb-4 flex items-center justify-between`}>
                <span className="text-xs font-extrabold tracking-tight truncate">{col.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#061f1d] text-white text-[11px] font-bold border border-emerald-800">
                  {colApplicants.length}
                </span>
              </div>

              {/* Applicant Cards Stack */}
              <div className="flex-1 space-y-3">
                {colApplicants.length === 0 ? (
                  <div className="border border-dashed border-emerald-900/60 rounded-xl p-6 text-center text-slate-500 text-xs">
                    Belum ada kandidat
                  </div>
                ) : (
                  colApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="bg-[#061f1d] border border-emerald-800/50 hover:border-emerald-500/60 rounded-xl p-4 space-y-3 shadow-md transition-all duration-200 group"
                    >
                      {/* Candidate Name & Job */}
                      <div>
                        <Link
                          href={`/admin/candidates/${applicant.id}`}
                          className="font-bold text-sm text-white hover:text-emerald-300 transition-colors flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="truncate">{applicant.candidate_name}</span>
                        </Link>
                        <p className="text-[11px] text-emerald-200/70 truncate mt-0.5">
                          {applicant.job_title}
                        </p>
                      </div>

                      {/* Auto-Screening Criteria Tags */}
                      <div className="flex flex-wrap gap-1">
                        {applicant.auto_tags.map((tag) => (
                          <AutoTagBadge key={tag} tag={tag} />
                        ))}
                      </div>

                      {/* Education Snapshot */}
                      {applicant.candidate_university && (
                        <p className="text-[11px] text-slate-400 truncate border-t border-emerald-950 pt-2">
                          🎓 {applicant.candidate_education_level} - {applicant.candidate_university}
                        </p>
                      )}

                      {/* Card Actions & Stage Shifting Buttons */}
                      <div className="pt-2 border-t border-emerald-950 flex items-center justify-between gap-1">
                        <Link
                          href={`/admin/candidates/${applicant.id}`}
                          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1"
                          title="Screening Detail & CV"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Review</span>
                        </Link>

                        {/* Stage Action Dropdown/Buttons */}
                        <div className="flex items-center gap-1">
                          {col.id !== "Applied" && (
                            <button
                              type="button"
                              onClick={() => {
                                const prevStatus: Record<ApplicationStatus, ApplicationStatus> = {
                                  "In Review": "Applied",
                                  Interview: "In Review",
                                  Offered: "Interview",
                                  Hired: "Offered",
                                  Applied: "Applied",
                                  Rejected: "Applied",
                                };
                                handleMoveStatus(applicant.id, prevStatus[col.id]);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                              title="Geser ke tahap sebelumnya"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {col.id !== "Hired" && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus: Record<ApplicationStatus, ApplicationStatus> = {
                                  Applied: "In Review",
                                  "In Review": "Interview",
                                  Interview: "Offered",
                                  Offered: "Hired",
                                  Hired: "Hired",
                                  Rejected: "In Review",
                                };
                                handleMoveStatus(applicant.id, nextStatus[col.id]);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-0.5"
                              title="Geser ke tahap berikutnya"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
