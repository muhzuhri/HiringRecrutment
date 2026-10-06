"use client";

import React, { useState } from "react";
import { CandidateApplicantCard } from "@/types/admin";
import { ApplicationStatus } from "@/types/candidate";
import { updateApplicantStatus } from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  ChevronLeft,
  User,
  Award,
  XCircle,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface KanbanBoardProps {
  initialApplicants: CandidateApplicantCard[];
  jobsList: { id: string; title: string }[];
}

const KANBAN_COLUMNS: {
  id: string;
  title: string;
  subtitle: string;
  badgeBg: string;
  headerBorder: string;
  statuses: ApplicationStatus[];
}[] = [
  {
    id: "diajukan",
    title: "1. Diajukan",
    subtitle: "Lamaran Masuk Baru",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-800",
    headerBorder: "border-amber-700/50",
    statuses: ["Diajukan", "Applied"],
  },
  {
    id: "diproses",
    title: "2. Diproses",
    subtitle: "Screening & Verifikasi Berkas",
    badgeBg: "bg-blue-950/80 text-blue-300 border-blue-800",
    headerBorder: "border-blue-700/50",
    statuses: ["Diproses", "In Review"],
  },
  {
    id: "interview",
    title: "3. Interview & Tes",
    subtitle: "Penilaian Psikotes / Interview HR",
    badgeBg: "bg-purple-950/80 text-purple-300 border-purple-800",
    headerBorder: "border-purple-700/50",
    statuses: ["Interview"],
  },
  {
    id: "diterima",
    title: "4. Diterima / Offered",
    subtitle: "Penawaran Kerja & Keputusan Final",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    headerBorder: "border-emerald-700/50",
    statuses: ["Diterima", "Offered", "Hired"],
  },
  {
    id: "ditolak",
    title: "5. Ditolak",
    subtitle: "Kandidat Tidak Lolos Seleksi",
    badgeBg: "bg-rose-950/80 text-rose-300 border-rose-800",
    headerBorder: "border-rose-700/50",
    statuses: ["Ditolak", "Rejected"],
  },
];

export default function KanbanBoard({ initialApplicants, jobsList }: KanbanBoardProps) {
  const [applicants, setApplicants] = useState<CandidateApplicantCard[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("Semua");
  const [onlyQualified, setOnlyQualified] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "tab">("kanban");
  const [activeStageTab, setActiveStageTab] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtered applicants calculation
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJob = selectedJobId === "Semua" || app.job_id === selectedJobId;
    const matchesQualified = !onlyQualified || app.is_qualified;

    return matchesSearch && matchesJob && matchesQualified;
  });

  const handleMoveStatus = async (appId: string, targetStatus: ApplicationStatus) => {
    setUpdatingId(appId);

    setApplicants((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, status: targetStatus } : item))
    );

    const res = await updateApplicantStatus(appId, targetStatus, `Dipindahkan via Papan Kanban Admin`);
    setUpdatingId(null);

    if (!res.success) {
      alert(res.error || "Gagal memperbarui status kandidat.");
    }
  };

  // Stats calculation
  const totalCount = applicants.length;
  const diajukanCount = applicants.filter((a) => KANBAN_COLUMNS[0].statuses.includes(a.status)).length;
  const diprosesCount = applicants.filter((a) => KANBAN_COLUMNS[1].statuses.includes(a.status)).length;
  const interviewCount = applicants.filter((a) => KANBAN_COLUMNS[2].statuses.includes(a.status)).length;
  const diterimaCount = applicants.filter((a) => KANBAN_COLUMNS[3].statuses.includes(a.status)).length;
  const ditolakCount = applicants.filter((a) => KANBAN_COLUMNS[4].statuses.includes(a.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Header Summary Bar */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Recruitment Kanban Workflow System
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Papan Kanban & Manajemen Pelamar
            </h1>
            <p className="text-xs text-emerald-200/80">
              Pantau pergerakan berkas kandidat antar tahapan seleksi secara *real-time* dan gunakan mode tampilan tab jika terdapat volume pelamar yang besar.
            </p>
          </div>

          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-[#061f1d] p-1.5 rounded-xl border border-emerald-800/60 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-emerald-950"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Papan 5-Kolom</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tab")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "tab"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-emerald-950"
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Mode Daftar / Tab</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Pelamar</p>
            <p className="text-lg font-black text-white">{totalCount}</p>
          </div>
          <div className="bg-[#061f1d] border border-amber-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-amber-300 font-semibold uppercase">1. Diajukan</p>
            <p className="text-lg font-black text-amber-400">{diajukanCount}</p>
          </div>
          <div className="bg-[#061f1d] border border-blue-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-blue-300 font-semibold uppercase">2. Diproses</p>
            <p className="text-lg font-black text-blue-400">{diprosesCount}</p>
          </div>
          <div className="bg-[#061f1d] border border-purple-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-purple-300 font-semibold uppercase">3. Interview</p>
            <p className="text-lg font-black text-purple-400">{interviewCount}</p>
          </div>
          <div className="bg-[#061f1d] border border-emerald-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-emerald-300 font-semibold uppercase">4. Diterima</p>
            <p className="text-lg font-black text-emerald-400">{diterimaCount}</p>
          </div>
          <div className="bg-[#061f1d] border border-rose-800/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-rose-300 font-semibold uppercase">5. Ditolak</p>
            <p className="text-lg font-black text-rose-400">{ditolakCount}</p>
          </div>
        </div>
      </div>

      {/* Advanced Search & Filter Toolbar */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Cari pelamar berdasarkan nama, email, atau posisi lowongan..."
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Job Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Semua">Semua Lowongan Pekerjaan</option>
              {jobsList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Qualified Candidates Checkbox Filter */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-xs text-emerald-200 cursor-pointer hover:border-emerald-500 transition-colors select-none">
            <input
              type="checkbox"
              checked={onlyQualified}
              onChange={(e) => setOnlyQualified(e.target.checked)}
              className="rounded bg-emerald-950 border-emerald-700 text-emerald-600 focus:ring-0"
            />
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Hanya Candidate Qualified</span>
          </label>
        </div>
      </div>

      {/* VIEW MODE 1: 5-Column Kanban Board Layout */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-6 custom-scrollbar">
          <div className="flex gap-4 min-w-[1300px] items-start">
            {KANBAN_COLUMNS.map((col) => {
              const colApplicants = filteredApplicants.filter((a) => col.statuses.includes(a.status));

              return (
                <div
                  key={col.id}
                  className="w-[280px] sm:w-[300px] shrink-0 bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-4 flex flex-col h-[calc(100vh-250px)] max-h-[750px] min-h-[520px] shadow-xl overflow-hidden"
                >
                  {/* Column Sticky Top Header */}
                  <div
                    className={`p-3.5 rounded-xl border ${col.headerBorder} bg-[#061f1d] mb-3 flex items-center justify-between shrink-0 shadow-sm`}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-extrabold text-white tracking-tight truncate">{col.title}</h3>
                      <p className="text-[10px] text-emerald-200/70 truncate">{col.subtitle}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${col.badgeBg} shrink-0`}>
                      {colApplicants.length}
                    </span>
                  </div>

                  {/* Internal Scrollable Stack of Cards */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                    {colApplicants.length === 0 ? (
                      <div className="border border-dashed border-emerald-900/60 rounded-xl p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 h-36">
                        <User className="w-6 h-6 text-emerald-800/40" />
                        <span>Tidak ada pelamar pada tahap ini</span>
                      </div>
                    ) : (
                      colApplicants.map((applicant) => {
                        const isUpdating = updatingId === applicant.id;

                        return (
                          <div
                            key={applicant.id}
                            className={`bg-[#061f1d] border border-emerald-800/60 hover:border-emerald-500/80 rounded-xl p-4 space-y-3 shadow-md transition-all duration-200 ${
                              isUpdating ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {/* Candidate Identity */}
                            <div>
                              <Link
                                href={`/admin/candidates/${applicant.id}`}
                                className="font-bold text-sm text-white hover:text-emerald-300 transition-colors flex items-center gap-1.5 truncate group"
                              >
                                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="truncate">{applicant.candidate_name}</span>
                              </Link>
                              <p className="text-[11px] text-emerald-200/70 truncate mt-0.5 font-medium">
                                {applicant.job_title}
                              </p>
                            </div>

                            {/* Qualified Badge */}
                            {applicant.is_qualified && (
                              <div className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                                <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>Qualified Candidate</span>
                              </div>
                            )}

                            {/* Auto-Screening Qualification Tags */}
                            {applicant.auto_tags && applicant.auto_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {applicant.auto_tags.map((tag) => (
                                  <AutoTagBadge key={tag} tag={tag} />
                                ))}
                              </div>
                            )}

                            {/* Education Snapshot */}
                            {applicant.candidate_university && (
                              <p className="text-[11px] text-slate-400 truncate border-t border-emerald-950 pt-2">
                                🎓 {applicant.candidate_education_level} - {applicant.candidate_university}
                              </p>
                            )}

                            {/* Action Toolbar */}
                            <div className="pt-2 border-t border-emerald-950 flex items-center justify-between gap-1">
                              <Link
                                href={`/admin/candidates/${applicant.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                title="Tinjau Berkas & Evaluasi"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </Link>

                              {/* Stage Shifting Action Controls */}
                              <div className="flex items-center gap-1">
                                {col.id !== "diajukan" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const prevMap: Record<string, ApplicationStatus> = {
                                        diproses: "Diajukan",
                                        interview: "Diproses",
                                        diterima: "Interview",
                                        ditolak: "Diproses",
                                      };
                                      handleMoveStatus(applicant.id, prevMap[col.id]);
                                    }}
                                    className="p-1.5 rounded-lg bg-[#0c2b29] hover:bg-emerald-900 text-slate-300 border border-emerald-800 hover:text-white transition-colors"
                                    title="Kembalikan ke tahap sebelumnya"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {col.id !== "diterima" && col.id !== "ditolak" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextMap: Record<string, ApplicationStatus> = {
                                          diajukan: "Diproses",
                                          diproses: "Interview",
                                          interview: "Diterima",
                                        };
                                        handleMoveStatus(applicant.id, nextMap[col.id]);
                                      }}
                                      className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-0.5 shadow-md transition-all cursor-pointer"
                                      title="Loloskan ke tahap berikutnya"
                                    >
                                      <span>Lanjut</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleMoveStatus(applicant.id, "Ditolak")}
                                      className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                                      title="Tolak Lamaran"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {col.id === "ditolak" && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStatus(applicant.id, "Diproses")}
                                    className="px-2 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Pulihkan lamaran ke tahap Diproses"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Pulihkan</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Tab / High-Density List View for Bulk Applicants */}
      {viewMode === "tab" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Stage Tabs Navigation Header */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-emerald-800/40 custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveStageTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStageTab === "all"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-[#061f1d] text-slate-300 hover:text-white border border-emerald-800/60"
              }`}
            >
              Semua Pelamar ({filteredApplicants.length})
            </button>

            {KANBAN_COLUMNS.map((col) => {
              const count = filteredApplicants.filter((a) => col.statuses.includes(a.status)).length;
              const isActive = activeStageTab === col.id;

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setActiveStageTab(col.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-[#061f1d] text-slate-300 hover:text-white border border-emerald-800/60"
                  }`}
                >
                  <span>{col.title}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-700/60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* High-Density Applicant List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#061f1d] text-emerald-300 uppercase font-bold text-[11px] border-b border-emerald-800">
                <tr>
                  <th className="p-4">Nama Kandidat & Email</th>
                  <th className="th-p-4 p-4">Posisi Lowongan</th>
                  <th className="p-4">Pendidikan & Universitas</th>
                  <th className="p-4">Kualifikasi Automatic</th>
                  <th className="p-4">Status Tahap</th>
                  <th className="p-4 text-center">Ubah Tahap / Aksi HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60">
                {(() => {
                  const displayList =
                    activeStageTab === "all"
                      ? filteredApplicants
                      : filteredApplicants.filter((a) =>
                          KANBAN_COLUMNS.find((c) => c.id === activeStageTab)?.statuses.includes(a.status)
                        );

                  if (displayList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                          Tidak ditemukan pelamar pada filter/tahap ini.
                        </td>
                      </tr>
                    );
                  }

                  return displayList.map((app) => (
                    <tr key={app.id} className="hover:bg-[#061f1d]/60 transition-colors group">
                      <td className="p-4">
                        <Link
                          href={`/admin/candidates/${app.id}`}
                          className="font-bold text-white hover:text-emerald-300 transition-colors block text-sm"
                        >
                          {app.candidate_name}
                        </Link>
                        <p className="text-[11px] text-emerald-200/70">{app.candidate_email}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-100">{app.job_title}</span>
                        <p className="text-[10px] text-slate-400">{app.department}</p>
                      </td>
                      <td className="p-4 text-xs">
                        <p className="font-bold text-white">{app.candidate_education_level || "S1"}</p>
                        <p className="text-[11px] text-slate-400">{app.candidate_university || "-"}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {app.is_qualified && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-extrabold">
                              ★ Qualified
                            </span>
                          )}
                          {(app.auto_tags || []).map((t) => (
                            <AutoTagBadge key={t} tag={t} />
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/candidates/${app.id}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </Link>

                          {/* Move Stage Selector */}
                          <select
                            value={app.status}
                            onChange={(e) => handleMoveStatus(app.id, e.target.value as ApplicationStatus)}
                            className="px-2 py-1.5 rounded-lg bg-[#061f1d] border border-emerald-800 text-emerald-200 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="Diajukan">1. Diajukan</option>
                            <option value="Diproses">2. Diproses</option>
                            <option value="Interview">3. Interview</option>
                            <option value="Diterima">4. Diterima</option>
                            <option value="Ditolak">5. Ditolak</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
