"use client";

import React, { useState } from "react";
import { CandidateApplicantCard, KanbanStageKey } from "@/types/admin";
import { ApplicationStatus, AssessmentType } from "@/types/candidate";
import { updateApplicantStatus, scheduleAssessmentOrInterview, revertKanbanStage } from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import ClickableDateTimePicker from "./ClickableDateTimePicker";
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
  Calendar,
  Loader2,
  X,
  FileText,
  Clock,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";

interface KanbanBoardProps {
  initialApplicants: CandidateApplicantCard[];
  jobsList: { id: string; title: string }[];
}

const KANBAN_COLUMNS: {
  id: KanbanStageKey;
  title: string;
  subtitle: string;
  badgeBg: string;
  headerBorder: string;
  accentColor: string;
}[] = [
  {
    id: "diajukan",
    title: "1. Diajukan",
    subtitle: "Lamaran Masuk Baru",
    badgeBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    headerBorder: "border-amber-300 dark:border-amber-700/50 bg-amber-50/70 dark:bg-[#061f1d]",
    accentColor: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "screening",
    title: "2. Screening HR",
    subtitle: "Pemeriksaan CV & Kualifikasi",
    badgeBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    headerBorder: "border-blue-300 dark:border-blue-700/50 bg-blue-50/70 dark:bg-[#061f1d]",
    accentColor: "text-blue-700 dark:text-blue-400",
  },
  {
    id: "assessment",
    title: "3. Assessment / Tes",
    subtitle: "Ujian Teknis & Psikotes",
    badgeBg: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    headerBorder: "border-purple-300 dark:border-purple-700/50 bg-purple-50/70 dark:bg-[#061f1d]",
    accentColor: "text-purple-700 dark:text-purple-400",
  },
  {
    id: "interview_hr",
    title: "4. Interview HR",
    subtitle: "Wawancara Tim HR",
    badgeBg: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
    headerBorder: "border-indigo-300 dark:border-indigo-700/50 bg-indigo-50/70 dark:bg-[#061f1d]",
    accentColor: "text-indigo-700 dark:text-indigo-400",
  },
  {
    id: "interview_user",
    title: "5. Interview User",
    subtitle: "Wawancara Calon Atasan",
    badgeBg: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    headerBorder: "border-cyan-300 dark:border-cyan-700/50 bg-cyan-50/70 dark:bg-[#061f1d]",
    accentColor: "text-cyan-700 dark:text-cyan-400",
  },
  {
    id: "diterima",
    title: "6. Diterima / Hired",
    subtitle: "Penawaran Kerja & Keputusan Final",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    headerBorder: "border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/70 dark:bg-[#061f1d]",
    accentColor: "text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "ditolak",
    title: "7. Ditolak",
    subtitle: "Kandidat Tidak Lolos Seleksi",
    badgeBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    headerBorder: "border-rose-300 dark:border-rose-700/50 bg-rose-50/70 dark:bg-[#061f1d]",
    accentColor: "text-rose-700 dark:text-rose-400",
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

  // Quick Schedule Modal State for Kanban
  const [scheduleTargetApp, setScheduleTargetApp] = useState<CandidateApplicantCard | null>(null);
  const [scheduleModalMode, setScheduleModalMode] = useState<"test" | "interview_hr" | "interview_user">("test");
  const [schedType, setSchedType] = useState<AssessmentType>("Technical Test");
  const [schedDateTime, setSchedDateTime] = useState<string>("");
  const [schedEvaluator, setSchedEvaluator] = useState<string>("Dr. Bambang / Tim Penilai & Interviewer");
  const [isSchedCustom, setIsSchedCustom] = useState<boolean>(false);
  const [customSchedEvaluator, setCustomSchedEvaluator] = useState<string>("");
  const [loadingSched, setLoadingSched] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Open Schedule Modal tailored to the stage
  const openScheduleModal = (
    applicant: CandidateApplicantCard,
    mode: "test" | "interview_hr" | "interview_user"
  ) => {
    setScheduleTargetApp(applicant);
    setScheduleModalMode(mode);
    setSchedDateTime("");
    setIsSchedCustom(false);
    setCustomSchedEvaluator("");

    if (mode === "test") {
      setSchedType("Technical Test");
      setSchedEvaluator("Dr. Bambang / Tim Penilai & Interviewer");
    } else if (mode === "interview_hr") {
      setSchedType("Interview HR");
      setSchedEvaluator("Sarah Wijaya (Lead Recruiter HR)");
    } else if (mode === "interview_user") {
      setSchedType("Interview User");
      setSchedEvaluator("Interviewer User (Calon Atasan / Tech Lead)");
    }
  };

  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTargetApp) return;
    if (!schedDateTime) {
      alert("Pilih tanggal dan waktu pelaksanaan.");
      return;
    }

    const finalEvaluator = isSchedCustom ? customSchedEvaluator.trim() : schedEvaluator;
    if (!finalEvaluator) {
      alert("Tentukan nama penilai / interviewer.");
      return;
    }

    setLoadingSched(true);
    const res = await scheduleAssessmentOrInterview({
      application_id: scheduleTargetApp.id,
      type: schedType,
      scheduled_at: new Date(schedDateTime).toISOString(),
      evaluator_name: finalEvaluator,
    });
    setLoadingSched(false);

    if (res.success) {
      // Determine new stage
      let nextStage: KanbanStageKey = "assessment";
      if (schedType === "Interview HR") nextStage = "interview_hr";
      if (schedType === "Interview User") nextStage = "interview_user";

      // Update state locally
      setApplicants((prev) =>
        prev.map((item) => {
          if (item.id !== scheduleTargetApp.id) return item;

          const updated = { ...item, kanban_stage: nextStage };
          if (nextStage === "assessment") {
            updated.test_type = schedType;
            updated.test_schedule = new Date(schedDateTime).toISOString();
            updated.test_evaluator = finalEvaluator;
            updated.status = "Diproses";
          } else if (nextStage === "interview_hr") {
            updated.hr_interview_schedule = new Date(schedDateTime).toISOString();
            updated.hr_interview_evaluator = finalEvaluator;
            updated.status = "Interview";
          } else if (nextStage === "interview_user") {
            updated.user_interview_schedule = new Date(schedDateTime).toISOString();
            updated.user_interview_evaluator = finalEvaluator;
            updated.status = "Interview";
          }
          return updated;
        })
      );

      setToastMsg(`Jadwal ${schedType} untuk ${scheduleTargetApp.candidate_name} berhasil disimpan!`);
      setScheduleTargetApp(null);
      setSchedDateTime("");
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      alert(res.error || "Gagal menjadwalkan seleksi.");
    }
  };

  // Move forward without schedule modal (e.g. Diajukan -> Screening HR or User Interview -> Diterima)
  const handleDirectStageChange = async (
    appId: string,
    targetStage: KanbanStageKey,
    targetStatus: ApplicationStatus,
    reason: string
  ) => {
    setUpdatingId(appId);

    setApplicants((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, kanban_stage: targetStage, status: targetStatus } : item))
    );

    const res = await updateApplicantStatus(appId, targetStatus, reason);
    setUpdatingId(null);

    if (!res.success) {
      alert(res.error || "Gagal memperbarui status kandidat.");
    }
  };

  // Revert back one stage
  const handleRevertStage = async (appId: string, targetStage: KanbanStageKey) => {
    setUpdatingId(appId);

    setApplicants((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, kanban_stage: targetStage } : item))
    );

    const res = await revertKanbanStage(appId, targetStage);
    setUpdatingId(null);

    if (!res.success) {
      alert(res.error || "Gagal mengembalikan tahap.");
    }
  };

  // Reject Candidate
  const handleRejectApplicant = async (appId: string) => {
    setUpdatingId(appId);

    setApplicants((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, kanban_stage: "ditolak", status: "Ditolak" } : item))
    );

    const res = await updateApplicantStatus(appId, "Ditolak", "Kandidat tidak lolos pada tahapan seleksi.");
    setUpdatingId(null);

    if (!res.success) {
      alert(res.error || "Gagal menolak kandidat.");
    }
  };

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

  // Stage counter stats
  const totalCount = applicants.length;
  const countByStage = KANBAN_COLUMNS.reduce<Record<string, number>>((acc, col) => {
    acc[col.id] = applicants.filter((a) => a.kanban_stage === col.id).length;
    return acc;
  }, {});

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Bar */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700/50 text-xs font-semibold text-slate-700 dark:text-emerald-300">
              <Layers className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" />
              Pipeline Seleksi Bertahap Linear
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Papan Kanban Rekrutmen (7 Tahapan)
            </h1>
            <p className="text-xs text-slate-500 dark:text-emerald-200/80">
              Alur seleksi transparan terintegrasi: <span className="text-slate-800 dark:text-white font-semibold">Diajukan → Screening HR → Assessment/Tes → Interview HR → Interview User → Keputusan Akhir</span>
            </p>
          </div>

          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#061f1d] p-1 rounded-xl border border-slate-200 dark:border-emerald-800/60 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tab")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "tab"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Mode Daftar Tab</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards for all 7 stages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Total</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
          {KANBAN_COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`rounded-xl p-2.5 text-center border ${col.headerBorder}`}
            >
              <p className={`text-[10px] font-bold uppercase truncate ${col.accentColor}`}>
                {col.title}
              </p>
              <p className={`text-lg font-black ${col.accentColor}`}>{countByStage[col.id] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
            placeholder="Cari pelamar berdasarkan nama, email, atau posisi lowongan..."
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Job Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-800 dark:text-white text-xs font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 cursor-pointer"
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
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-emerald-200 cursor-pointer hover:border-slate-400 transition-colors select-none font-medium">
            <input
              type="checkbox"
              checked={onlyQualified}
              onChange={(e) => setOnlyQualified(e.target.checked)}
              className="rounded border-slate-300 text-slate-800 focus:ring-0"
            />
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Hanya Qualified</span>
          </label>
        </div>
      </div>

      {/* VIEW MODE 1: 7-Column Linear Kanban Board Layout */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-6 custom-scrollbar">
          <div className="flex gap-3.5 min-w-[2100px] items-start">
            {KANBAN_COLUMNS.map((col) => {
              const colApplicants = filteredApplicants.filter((a) => a.kanban_stage === col.id);

              return (
                <div
                  key={col.id}
                  className="w-[290px] shrink-0 bg-slate-100/70 dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-3 flex flex-col h-[calc(100vh-230px)] max-h-[780px] min-h-[540px] shadow-sm overflow-hidden transition-colors"
                >
                  {/* Column Sticky Top Header */}
                  <div
                    className={`p-2.5 rounded-xl border ${col.headerBorder} mb-2.5 flex items-center justify-between shrink-0 shadow-xs`}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-black tracking-tight truncate text-slate-900 dark:text-white">{col.title}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-emerald-200/70 truncate">{col.subtitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${col.badgeBg} shrink-0`}>
                      {colApplicants.length}
                    </span>
                  </div>

                  {/* Internal Scrollable Stack of Cards */}
                  <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 custom-scrollbar">
                    {colApplicants.length === 0 ? (
                      <div className="border border-dashed border-slate-300 dark:border-emerald-900/60 rounded-xl p-5 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5 h-32">
                        <User className="w-5 h-5 text-slate-300 dark:text-emerald-800/40" />
                        <span>Tidak ada pelamar pada tahap ini</span>
                      </div>
                    ) : (
                      colApplicants.map((applicant) => {
                        const isUpdating = updatingId === applicant.id;

                        return (
                          <div
                            key={applicant.id}
                            className={`bg-white dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 hover:border-slate-400 dark:hover:border-emerald-500/80 rounded-xl p-3 space-y-2 shadow-xs transition-all duration-200 ${
                              isUpdating ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {/* Candidate Identity */}
                            <div>
                              <Link
                                href={`/admin/candidates/${applicant.id}`}
                                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 truncate group"
                              >
                                <User className="w-3.5 h-3.5 text-slate-500 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="truncate">{applicant.candidate_name}</span>
                              </Link>
                              <p className="text-[11px] text-slate-500 dark:text-emerald-200/70 truncate mt-0.5 font-medium">
                                {applicant.job_title}
                              </p>
                            </div>

                            {/* Qualified Badge */}
                            {applicant.is_qualified && (
                              <div className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold flex items-center gap-1">
                                <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate border-t border-slate-100 dark:border-emerald-950 pt-1.5">
                                🎓 {applicant.candidate_education_level} - {applicant.candidate_university}
                              </p>
                            )}

                            {/* ========================================================== */}
                            {/* STAGE-SPECIFIC DATA DISPLAY BLOCKS                         */}
                            {/* ========================================================== */}

                            {/* TAHAP 3: Assessment / Tes Info Card Block */}
                            {col.id === "assessment" && (
                              <div className="bg-purple-50/70 dark:bg-[#0c2b29] border border-purple-200 dark:border-purple-800/40 rounded-lg p-2 text-[10px] space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-purple-800 dark:text-purple-300">
                                    📝 {applicant.test_type || "Technical Test"}
                                  </span>
                                  {applicant.test_score !== null && applicant.test_score !== undefined ? (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 font-extrabold text-[9px]">
                                      Skor: {applicant.test_score}/100
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-amber-700 dark:text-amber-300 font-medium">
                                      ⏳ Menunggu Dinilai
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                                  <span className="truncate">
                                    {formatDateTime(applicant.test_schedule) || "Jadwal belum ditentukan"}
                                  </span>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 truncate">
                                  Penilai: {applicant.test_evaluator || "Tim Penilai Resmi"}
                                </div>
                              </div>
                            )}

                            {/* TAHAP 4: Interview HR Info Card Block */}
                            {col.id === "interview_hr" && (
                              <div className="bg-indigo-50/70 dark:bg-[#0c2b29] border border-indigo-200 dark:border-indigo-800/40 rounded-lg p-2 text-[10px] space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-indigo-800 dark:text-indigo-300">
                                    🎙️ Interview HR
                                  </span>
                                  {applicant.hr_interview_score !== null && applicant.hr_interview_score !== undefined ? (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 font-extrabold text-[9px]">
                                      Skor HR: {applicant.hr_interview_score}/100
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-amber-700 dark:text-amber-300 font-medium">
                                      ⏳ Menunggu Wawancara
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                  <span className="truncate">
                                    {formatDateTime(applicant.hr_interview_schedule) || "Jadwal belum ditentukan"}
                                  </span>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 truncate">
                                  Pewawancara: {applicant.hr_interview_evaluator || "Sarah Wijaya (HR)"}
                                </div>
                                {applicant.test_score !== null && applicant.test_score !== undefined && (
                                  <div className="pt-1 border-t border-indigo-100 dark:border-emerald-950 text-purple-700 dark:text-purple-300 font-semibold">
                                    ✓ Skor Tes: {applicant.test_score}/100
                                  </div>
                                )}
                              </div>
                            )}

                            {/* TAHAP 5: Interview User Info Card Block */}
                            {col.id === "interview_user" && (
                              <div className="bg-cyan-50/70 dark:bg-[#0c2b29] border border-cyan-200 dark:border-cyan-800/40 rounded-lg p-2 text-[10px] space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-cyan-800 dark:text-cyan-300">
                                    👥 Interview User (Atasan)
                                  </span>
                                  {applicant.user_interview_score !== null && applicant.user_interview_score !== undefined ? (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 font-extrabold text-[9px]">
                                      Skor User: {applicant.user_interview_score}/100
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-amber-700 dark:text-amber-300 font-medium">
                                      ⏳ Menunggu Wawancara
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                  <span className="truncate">
                                    {formatDateTime(applicant.user_interview_schedule) || "Jadwal belum ditentukan"}
                                  </span>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 truncate">
                                  Pewawancara: {applicant.user_interview_evaluator || "Calon Atasan / Tech Lead"}
                                </div>
                                <div className="pt-1 border-t border-cyan-100 dark:border-emerald-950 flex items-center justify-between text-[9px]">
                                  <span className="text-purple-700 dark:text-purple-300">Tes: {applicant.test_score ?? "-"}</span>
                                  <span className="text-indigo-700 dark:text-indigo-300">HR: {applicant.hr_interview_score ?? "-"}</span>
                                  <span className="text-cyan-800 dark:text-cyan-300 font-bold">User: {applicant.user_interview_score ?? "-"}</span>
                                </div>
                              </div>
                            )}

                            {/* TAHAP 6: Diterima / Hired Summary Block */}
                            {col.id === "diterima" && (
                              <div className="bg-emerald-50/70 dark:bg-[#0c2b29] border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-2 text-[10px] space-y-1">
                                <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-black">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Kandidat Diterima / Hired</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 pt-1 flex items-center justify-between border-t border-emerald-100 dark:border-emerald-950 text-[9px]">
                                  <span>Tes: {applicant.test_score ?? "-"}</span>
                                  <span>HR: {applicant.hr_interview_score ?? "-"}</span>
                                  <span>User: {applicant.user_interview_score ?? "-"}</span>
                                </div>
                              </div>
                            )}

                            {/* TAHAP 7: Ditolak Block */}
                            {col.id === "ditolak" && (
                              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg p-2 text-[10px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>Tidak lolos seleksi rekrutmen</span>
                              </div>
                            )}

                            {/* ========================================================== */}
                            {/* ACTION CONTROLS PER STAGE                                  */}
                            {/* ========================================================== */}
                            <div className="pt-1.5 border-t border-slate-100 dark:border-emerald-950 flex items-center justify-between gap-1 flex-wrap">
                              {/* Left Actions: Review or Reschedule */}
                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/admin/candidates/${applicant.id}`}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                  title="Tinjau Berkas & CV"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Review</span>
                                </Link>

                                {/* Reschedule buttons in testing/interview stages */}
                                {col.id === "assessment" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "test")}
                                    className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Ubah Jadwal Tes"
                                  >
                                    <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                    <span>Jadwal</span>
                                  </button>
                                )}

                                {col.id === "interview_hr" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "interview_hr")}
                                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Ubah Jadwal Interview HR"
                                  >
                                    <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    <span>Jadwal</span>
                                  </button>
                                )}

                                {col.id === "interview_user" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "interview_user")}
                                    className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Ubah Jadwal Interview User"
                                  >
                                    <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                    <span>Jadwal</span>
                                  </button>
                                )}
                              </div>

                              {/* Right Actions: Next Step / Revert / Reject */}
                              <div className="flex items-center gap-1">
                                {/* Back Button < */}
                                {col.id === "screening" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "diajukan")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Kembalikan ke Diajukan"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "assessment" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "screening")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Kembalikan ke Screening HR"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "interview_hr" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "assessment")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Kembalikan ke Assessment / Tes"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "interview_user" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "interview_hr")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Kembalikan ke Interview HR"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "diterima" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "interview_user")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    title="Kembalikan ke Interview User"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Forward Progression Buttons */}
                                {col.id === "diajukan" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDirectStageChange(
                                        applicant.id,
                                        "screening",
                                        "Diproses",
                                        "Lolos verifikasi awal berkas, masuk ke tahap Screening HR."
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs transition-all cursor-pointer"
                                    title="Mulai Screening CV"
                                  >
                                    <span>Screening</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {col.id === "screening" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "test")}
                                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    title="Kandidat lolos screening, tentukan jadwal tes"
                                  >
                                    <span>Lolos ke Tes</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {col.id === "assessment" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "interview_hr")}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    title="Loloskan kandidat ke sesi wawancara HR"
                                  >
                                    <span>Ke Interview HR</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {col.id === "interview_hr" && (
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(applicant, "interview_user")}
                                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    title="Loloskan kandidat ke sesi wawancara calon atasan (user)"
                                  >
                                    <span>Ke Interview User</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {col.id === "interview_user" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDirectStageChange(
                                        applicant.id,
                                        "diterima",
                                        "Diterima",
                                        "Kandidat dinyatakan Lolos & Diterima setelah seluruh rangkaian seleksi."
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    title="Terima Kandidat & Berikan Penawaran Kerja"
                                  >
                                    <span>Terima Kandidat</span>
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Reject Button */}
                                {col.id !== "diterima" && col.id !== "ditolak" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRejectApplicant(applicant.id)}
                                    className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                                    title="Tolak Lamaran"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                )}

                                {col.id === "ditolak" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "screening")}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Pulihkan lamaran ke tahap Screening"
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
        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
          {/* Stage Tabs Navigation Header */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-emerald-800/40 custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveStageTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStageTab === "all"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                  : "bg-slate-100 dark:bg-[#061f1d] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Semua Pelamar ({filteredApplicants.length})
            </button>

            {KANBAN_COLUMNS.map((col) => {
              const count = filteredApplicants.filter((a) => a.kanban_stage === col.id).length;
              const isActive = activeStageTab === col.id;

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setActiveStageTab(col.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                      : "bg-slate-100 dark:bg-[#061f1d] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{col.title}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-emerald-950 text-slate-800 dark:text-emerald-300 text-[10px] font-black">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* High-Density Applicant List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-[#061f1d] text-slate-700 dark:text-emerald-300 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-emerald-800">
                <tr>
                  <th className="px-4 py-3">Nama Kandidat & Email</th>
                  <th className="px-3 py-3">Posisi Lowongan</th>
                  <th className="px-3 py-3">Pendidikan</th>
                  <th className="px-3 py-3">Tahapan Seleksi</th>
                  <th className="px-3 py-3">Jadwal & Penilai</th>
                  <th className="px-3 py-3">Skor Evaluasi</th>
                  <th className="px-4 py-3 text-center">Aksi HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-emerald-900/60">
                {(() => {
                  const displayList =
                    activeStageTab === "all"
                      ? filteredApplicants
                      : filteredApplicants.filter((a) => a.kanban_stage === activeStageTab);

                  if (displayList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                          Tidak ditemukan pelamar pada filter/tahap ini.
                        </td>
                      </tr>
                    );
                  }

                  return displayList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-[#061f1d]/60 transition-colors group">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/candidates/${app.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors block text-xs"
                        >
                          {app.candidate_name}
                        </Link>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-200/70">{app.candidate_email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-slate-800 dark:text-emerald-100 text-xs">{app.job_title}</span>
                        <p className="text-[10px] text-slate-500">{app.department}</p>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <p className="font-bold text-slate-800 dark:text-white">{app.candidate_education_level || "S1"}</p>
                        <p className="text-[10px] text-slate-500">{app.candidate_university || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-slate-800 dark:text-emerald-300 font-bold text-[10px]">
                          {KANBAN_COLUMNS.find((c) => c.id === app.kanban_stage)?.title || app.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {app.kanban_stage === "assessment" && (
                          <div>
                            <p className="font-semibold text-purple-700 dark:text-purple-300">{app.test_type || "Technical Test"}</p>
                            <p className="text-[10px] text-slate-500">{formatDateTime(app.test_schedule) || "Belum ada jadwal"}</p>
                          </div>
                        )}
                        {app.kanban_stage === "interview_hr" && (
                          <div>
                            <p className="font-semibold text-indigo-700 dark:text-indigo-300">Interview HR</p>
                            <p className="text-[10px] text-slate-500">{formatDateTime(app.hr_interview_schedule) || "Belum ada jadwal"}</p>
                          </div>
                        )}
                        {app.kanban_stage === "interview_user" && (
                          <div>
                            <p className="font-semibold text-cyan-700 dark:text-cyan-300">Interview User</p>
                            <p className="text-[10px] text-slate-500">{formatDateTime(app.user_interview_schedule) || "Belum ada jadwal"}</p>
                          </div>
                        )}
                        {app.kanban_stage === "screening" && (
                          <span className="text-slate-500 italic text-[11px]">Pemeriksaan CV</span>
                        )}
                        {app.kanban_stage === "diajukan" && (
                          <span className="text-amber-700 dark:text-amber-400 text-[11px]">Baru Diajukan</span>
                        )}
                        {app.kanban_stage === "diterima" && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">✓ Lolos Final</span>
                        )}
                        {app.kanban_stage === "ditolak" && (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold text-[11px]">Tidak Lolos</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[11px]">
                        <div className="space-y-0.5">
                          <p className="text-purple-700 dark:text-purple-300">Tes: {app.test_score !== null && app.test_score !== undefined ? `${app.test_score}/100` : "-"}</p>
                          <p className="text-indigo-700 dark:text-indigo-300">HR: {app.hr_interview_score !== null && app.hr_interview_score !== undefined ? `${app.hr_interview_score}/100` : "-"}</p>
                          <p className="text-cyan-700 dark:text-cyan-300">User: {app.user_interview_score !== null && app.user_interview_score !== undefined ? `${app.user_interview_score}/100` : "-"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/candidates/${app.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800 text-[11px] font-semibold transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </Link>

                          {app.kanban_stage === "screening" && (
                            <button
                              type="button"
                              onClick={() => openScheduleModal(app, "test")}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Jadwalkan Tes
                            </button>
                          )}
                          {app.kanban_stage === "assessment" && (
                            <button
                              type="button"
                              onClick={() => openScheduleModal(app, "interview_hr")}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Jadwalkan HR
                            </button>
                          )}
                          {app.kanban_stage === "interview_hr" && (
                            <button
                              type="button"
                              onClick={() => openScheduleModal(app, "interview_user")}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Jadwalkan User
                            </button>
                          )}
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

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 dark:bg-emerald-900 border border-slate-700 dark:border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-xs">Jadwal Ditetapkan</p>
            <p className="text-[11px] text-slate-300 dark:text-emerald-200">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Modal Quick Schedule tailored to the linear stages with CLICKABLE PICKER */}
      {scheduleTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {scheduleModalMode === "test" && "Jadwalkan Assessment / Ujian Tes"}
                  {scheduleModalMode === "interview_hr" && "Jadwalkan Wawancara HR (HR Interview)"}
                  {scheduleModalMode === "interview_user" && "Jadwalkan Wawancara User (Calon Atasan)"}
                </h3>
              </div>
              <button
                onClick={() => setScheduleTargetApp(null)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickScheduleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#061f1d] rounded-xl border border-slate-200 dark:border-emerald-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Kandidat Terpilih</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{scheduleTargetApp.candidate_name}</span>
                <p className="text-slate-600 dark:text-emerald-300 text-xs mt-0.5">
                  {scheduleTargetApp.job_title} ({scheduleTargetApp.department})
                </p>
              </div>

              {/* Selection for Test Type (Only enabled if mode === 'test') */}
              {scheduleModalMode === "test" && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                    Pilih Jenis Tes *
                  </label>
                  <select
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value as AssessmentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                  >
                    <option value="Technical Test">Technical Test (Tes Koding / Teknis)</option>
                    <option value="Psikotes">Psikotes (Psikologi & Bakat)</option>
                    <option value="Aptitude Test">Aptitude Test (Logika & Numerik)</option>
                    <option value="Personality Test">Personality Test (Kepribadian)</option>
                  </select>
                </div>
              )}

              {/* Informational badge if interview mode */}
              {scheduleModalMode === "interview_hr" && (
                <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-semibold text-xs">
                  Tahap: Wawancara Mendalam dengan Tim HR & Talent Acquisition
                </div>
              )}

              {scheduleModalMode === "interview_user" && (
                <div className="px-3.5 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 font-semibold text-xs">
                  Tahap: Wawancara Kompetensi Calon Atasan (User / Tech Lead)
                </div>
              )}

              {/* CLICKABLE DATE & TIME PICKER (1-Click, No typing needed) */}
              <ClickableDateTimePicker
                value={schedDateTime}
                onChange={setSchedDateTime}
                required
              />

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Pilih Penilai / Interviewer yang Bertugas *
                </label>
                <select
                  value={isSchedCustom ? "custom" : schedEvaluator}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsSchedCustom(true);
                    } else {
                      setIsSchedCustom(false);
                      setSchedEvaluator(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 mb-2"
                >
                  {scheduleModalMode === "test" && (
                    <>
                      <option value="Dr. Bambang / Tim Penilai & Interviewer">Dr. Bambang / Tim Penilai & Interviewer (Penilai Resmi)</option>
                      <option value="Assessor Psikotes & Aptitude">Assessor Psikotes & Aptitude</option>
                      <option value="Lead Technical Assessor">Lead Technical Assessor</option>
                    </>
                  )}
                  {scheduleModalMode === "interview_hr" && (
                    <>
                      <option value="Sarah Wijaya (Lead Recruiter HR)">Sarah Wijaya (Lead Recruiter HR)</option>
                      <option value="Tim Talent Acquisition & HRBP">Tim Talent Acquisition & HRBP</option>
                      <option value="Dr. Bambang / Tim Penilai & Interviewer">Dr. Bambang / Tim Penilai & Interviewer</option>
                    </>
                  )}
                  {scheduleModalMode === "interview_user" && (
                    <>
                      <option value="Interviewer User (Calon Atasan / Tech Lead)">Interviewer User (Calon Atasan / Tech Lead)</option>
                      <option value="Engineering Manager / VP of Tech">Engineering Manager / VP of Tech</option>
                      <option value="Dr. Bambang / Tim Penilai & Interviewer">Dr. Bambang / Tim Penilai & Interviewer</option>
                    </>
                  )}
                  <option value="custom">+ Masukkan Nama Penilai Lainnya...</option>
                </select>

                {isSchedCustom && (
                  <input
                    type="text"
                    required
                    value={customSchedEvaluator}
                    onChange={(e) => setCustomSchedEvaluator(e.target.value)}
                    placeholder="Ketik nama penilai / pewawancara..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-500 text-slate-900 dark:text-white focus:outline-none text-xs"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setScheduleTargetApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-emerald-800 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loadingSched}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingSched && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Jadwal & Loloskan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
