"use client";

import React, { useState } from "react";
import { CandidateApplicantCard, KanbanStageKey } from "@/types/admin";
import { ApplicationStatus, AssessmentType } from "@/types/candidate";
import {
  updateApplicantStatus,
  scheduleAssessmentOrInterview,
  revertKanbanStage,
  submitDirectStageScore,
  StaffAccount,
} from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import ClickableDateTimePicker from "./ClickableDateTimePicker";
import CandidateDetailModal, { CandidateDetailData } from "./CandidateDetailModal";
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
  Building2,
  Lock,
} from "lucide-react";

interface KanbanBoardProps {
  initialApplicants: CandidateApplicantCard[];
  jobsList: { id: string; title: string }[];
  hrStaff?: StaffAccount[];
  penilaiStaff?: StaffAccount[];
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

export default function KanbanBoard({
  initialApplicants,
  jobsList,
  hrStaff = [],
  penilaiStaff = [],
}: KanbanBoardProps) {
  const [applicants, setApplicants] = useState<CandidateApplicantCard[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("Semua");
  const [onlyQualified, setOnlyQualified] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "tab">("kanban");
  const [activeStageTab, setActiveStageTab] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Review Candidate Modal State
  const [selectedReviewCandidate, setSelectedReviewCandidate] = useState<CandidateDetailData | null>(null);

  // Quick Schedule Modal State for Kanban
  const [scheduleTargetApp, setScheduleTargetApp] = useState<CandidateApplicantCard | null>(null);
  const [scheduleModalMode, setScheduleModalMode] = useState<"test" | "interview_hr" | "interview_user">("test");
  const [schedType, setSchedType] = useState<AssessmentType>("Technical Test");
  const [schedDateTime, setSchedDateTime] = useState<string>("");
  const [schedEvaluator, setSchedEvaluator] = useState<string>("");
  const [isSchedCustom, setIsSchedCustom] = useState<boolean>(false);
  const [customSchedEvaluator, setCustomSchedEvaluator] = useState<string>("");
  const [schedLocation, setSchedLocation] = useState<string>("");
  const [schedNotes, setSchedNotes] = useState<string>("");
  const [loadingSched, setLoadingSched] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Direct Grading Modal State (for giving HR / User interview score directly from Kanban)
  const [directGradeApp, setDirectGradeApp] = useState<CandidateApplicantCard | null>(null);
  const [directGradeMode, setDirectGradeMode] = useState<"interview_hr" | "interview_user">("interview_hr");
  const [directScoreInput, setDirectScoreInput] = useState<string>("");
  const [directNotesInput, setDirectNotesInput] = useState<string>("");
  const [directEvaluatorInput, setDirectEvaluatorInput] = useState<string>("");
  const [loadingDirectGrade, setLoadingDirectGrade] = useState<boolean>(false);

  // Open Direct Grade Modal
  const openDirectGradeModal = (
    app: CandidateApplicantCard,
    mode: "interview_hr" | "interview_user"
  ) => {
    setDirectGradeApp(app);
    setDirectGradeMode(mode);
    if (mode === "interview_hr") {
      setDirectScoreInput(
        app.hr_interview_score !== null && app.hr_interview_score !== undefined
          ? String(app.hr_interview_score)
          : ""
      );
      setDirectEvaluatorInput(
        app.hr_interview_evaluator || hrStaff[0]?.full_name || "Sarah Wijaya (Lead Recruiter HR)"
      );
      setDirectNotesInput(app.hr_interview_notes || "");
    } else {
      setDirectScoreInput(
        app.user_interview_score !== null && app.user_interview_score !== undefined
          ? String(app.user_interview_score)
          : ""
      );
      setDirectEvaluatorInput(
        app.user_interview_evaluator || "Calon Atasan / User Lead"
      );
      setDirectNotesInput(app.user_interview_notes || "");
    }
  };

  // Submit Direct Grade
  const handleDirectGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directGradeApp) return;

    const parsedScore = parseFloat(directScoreInput);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      alert("Nilai harus berupa angka antara 0 hingga 100.");
      return;
    }

    setLoadingDirectGrade(true);
    const stageType = directGradeMode === "interview_hr" ? "Interview HR" : "Interview User";
    const res = await submitDirectStageScore({
      application_id: directGradeApp.id,
      stage_type: stageType,
      score: parsedScore,
      notes: directNotesInput.trim(),
      evaluator_name: directEvaluatorInput.trim(),
    });
    setLoadingDirectGrade(false);

    if (res.success) {
      setApplicants((prev) =>
        prev.map((item) => {
          if (item.id !== directGradeApp.id) return item;
          if (directGradeMode === "interview_hr") {
            return {
              ...item,
              hr_interview_score: parsedScore,
              hr_interview_notes: directNotesInput.trim(),
              hr_interview_evaluator: directEvaluatorInput.trim(),
            };
          } else {
            return {
              ...item,
              user_interview_score: parsedScore,
              user_interview_notes: directNotesInput.trim(),
              user_interview_evaluator: directEvaluatorInput.trim(),
            };
          }
        })
      );
      setToastMsg(`Nilai ${stageType} untuk ${directGradeApp.candidate_name} berhasil disimpan!`);
      setDirectGradeApp(null);
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      alert(res.error || "Gagal menyimpan nilai.");
    }
  };

  // Handler to open full review modal
  const handleOpenReviewModal = (app: CandidateApplicantCard) => {
    setSelectedReviewCandidate({
      id: app.id,
      candidate_id: app.candidate_id,
      candidate_name: app.candidate_name,
      candidate_email: app.candidate_email,
      candidate_phone: app.candidate_phone,
      candidate_nik: app.candidate_nik,
      candidate_ktp_url: app.candidate_ktp_url,
      candidate_ktp_name: app.candidate_ktp_name,
      candidate_avatar_url: app.candidate_avatar_url,
      candidate_address: app.candidate_address,
      candidate_headline: app.candidate_headline,
      candidate_bio: app.candidate_bio,
      job_title: app.job_title,
      department: app.department,
      skills: app.candidate_skills || [],
      education: [
        {
          level: app.candidate_education_level || "S1",
          school: app.candidate_university || "Perguruan Tinggi",
          major: app.candidate_major || "-",
        },
      ],
      experience: app.candidate_experience || [],
      resume_url: app.resume_url,
      resume_name: app.resume_name,
      test_score: app.test_score,
      test_evaluator: app.test_evaluator,
      hr_interview_score: app.hr_interview_score,
      hr_interview_evaluator: app.hr_interview_evaluator,
      user_interview_score: app.user_interview_score,
      user_interview_evaluator: app.user_interview_evaluator,
    });
  };

  // Open Schedule Modal tailored to the stage
  const openScheduleModal = (
    applicant: CandidateApplicantCard,
    mode: "test" | "interview_hr" | "interview_user"
  ) => {
    setScheduleTargetApp(applicant);
    setScheduleModalMode(mode);
    setSchedDateTime("");
    setSchedLocation("");
    setSchedNotes("");

    if (mode === "test") {
      setSchedType("Technical Test");
      const firstPenilai = penilaiStaff[0]?.full_name || "Dr. Bambang / Tim Penilai";
      setSchedEvaluator(firstPenilai);
      setIsSchedCustom(false);
      setCustomSchedEvaluator("");
    } else if (mode === "interview_hr") {
      setSchedType("Interview HR");
      const firstHr = hrStaff[0]?.full_name || "Sarah Wijaya (Lead Recruiter HR)";
      setSchedEvaluator(firstHr);
      setIsSchedCustom(false);
      setCustomSchedEvaluator("");
    } else if (mode === "interview_user") {
      setSchedType("Interview User");
      setSchedEvaluator("");
      setIsSchedCustom(true);
      setCustomSchedEvaluator("");
    }
  };

  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTargetApp) return;
    if (!schedDateTime) {
      alert("Pilih tanggal dan waktu pelaksanaan.");
      return;
    }

    const finalEvaluator =
      scheduleModalMode === "interview_user"
        ? customSchedEvaluator.trim()
        : isSchedCustom
        ? customSchedEvaluator.trim()
        : schedEvaluator.trim();

    if (!finalEvaluator) {
      alert(
        scheduleModalMode === "interview_user"
          ? "Ketikkan nama Calon Atasan (User / Tech Lead)."
          : "Pilih atau tentukan nama penilai / interviewer."
      );
      return;
    }

    if (!schedLocation.trim()) {
      alert("Masukkan informasi lokasi, gedung/ruangan atau link pertemuan.");
      return;
    }

    setLoadingSched(true);
    const res = await scheduleAssessmentOrInterview({
      application_id: scheduleTargetApp.id,
      type: schedType,
      scheduled_at: new Date(schedDateTime).toISOString(),
      evaluator_name: finalEvaluator,
      location: schedLocation.trim(),
      notes: schedNotes.trim() || undefined,
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
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Papan Kanban Rekrutmen
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau status tahapan seleksi dan jadwal wawancara kandidat.
            </p>
          </div>

          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#061f1d] p-1 rounded-xl border border-slate-200/80 dark:border-teal-800/40 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-[#0F766E] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tab")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "tab"
                  ? "bg-[#0F766E] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Mode Tabel</span>
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
                            <div className="pt-2 border-t border-slate-100 dark:border-teal-900/60 flex items-center justify-between gap-1.5 flex-wrap">
                              {/* Left Actions: Review Full Profile */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenReviewModal(applicant)}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-teal-950 dark:hover:bg-teal-900 text-slate-700 dark:text-teal-200 border border-slate-200 dark:border-teal-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Tinjau Seluruh Data Profil, NIK, KTP & CV"
                                >
                                  <Eye className="w-3 h-3 text-[#0F766E] dark:text-teal-400" />
                                  <span>Review</span>
                                </button>

                                {/* Direct Grade indicator/edit button when already scored */}
                                {col.id === "interview_hr" && applicant.hr_interview_score !== null && applicant.hr_interview_score !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => openDirectGradeModal(applicant, "interview_hr")}
                                    className="px-2 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#0F766E] dark:text-teal-300 text-[10px] font-bold flex items-center gap-0.5 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                                    title="Klik untuk mengubah nilai interview HR"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>Nilai: {applicant.hr_interview_score}</span>
                                  </button>
                                )}

                                {col.id === "interview_user" && applicant.user_interview_score !== null && applicant.user_interview_score !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => openDirectGradeModal(applicant, "interview_user")}
                                    className="px-2 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#0F766E] dark:text-teal-300 text-[10px] font-bold flex items-center gap-0.5 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                                    title="Klik untuk mengubah nilai interview calon atasan (user)"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>Nilai: {applicant.user_interview_score}</span>
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
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-teal-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Kembalikan ke Diajukan"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "assessment" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "screening")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-teal-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Kembalikan ke Screening HR"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "interview_hr" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "assessment")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-teal-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Kembalikan ke Assessment / Tes"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "interview_user" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "interview_hr")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-teal-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Kembalikan ke Interview HR"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {col.id === "diterima" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertStage(applicant.id, "interview_user")}
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0c2b29] dark:hover:bg-teal-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Kembalikan ke Interview User"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Forward Progression Buttons with Strict Gates & Direct Scoring */}
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
                                    className="px-2.5 py-1 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white text-[10px] font-bold flex items-center gap-0.5 shadow-2xs transition-all cursor-pointer"
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
                                    className="px-2.5 py-1 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                    title="Kandidat lolos screening, tentukan jadwal tes"
                                  >
                                    <span>Lolos ke Tes</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Strict Gate 1: Dari Tes ke Interview HR wajib ada nilai tes */}
                                {col.id === "assessment" && (
                                  applicant.test_score !== null && applicant.test_score !== undefined ? (
                                    <button
                                      type="button"
                                      onClick={() => openScheduleModal(applicant, "interview_hr")}
                                      className="px-2.5 py-1 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                      title="Nilai tes terpenuhi, lanjutkan ke sesi wawancara HR"
                                    >
                                      <span>Ke Interview HR</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-80"
                                      title="Penilai belum menginput nilai tes untuk kandidat ini."
                                    >
                                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span>Menunggu Nilai Tes</span>
                                    </button>
                                  )
                                )}

                                {/* Strict Gate 2: Direct Grade Button or Advance to Interview User */}
                                {col.id === "interview_hr" && (
                                  applicant.hr_interview_score !== null && applicant.hr_interview_score !== undefined ? (
                                    <button
                                      type="button"
                                      onClick={() => openScheduleModal(applicant, "interview_user")}
                                      className="px-2.5 py-1 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                      title="Nilai HR terpenuhi, jadwalkan wawancara calon atasan (user)"
                                    >
                                      <span>Ke Interview User</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openDirectGradeModal(applicant, "interview_hr")}
                                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                      title="Klik untuk langsung memberikan nilai wawancara HR"
                                    >
                                      <Award className="w-3 h-3" />
                                      <span>Beri Nilai HR</span>
                                    </button>
                                  )
                                )}

                                {/* Strict Gate 3: Direct Grade Button or Advance to Diterima */}
                                {col.id === "interview_user" && (
                                  applicant.user_interview_score !== null && applicant.user_interview_score !== undefined ? (
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
                                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                      title="Terima Kandidat & Berikan Penawaran Kerja"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Lolos (Diterima)</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openDirectGradeModal(applicant, "interview_user")}
                                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                      title="Klik untuk langsung memberikan nilai wawancara calon atasan (user)"
                                    >
                                      <Award className="w-3 h-3" />
                                      <span>Beri Nilai User</span>
                                    </button>
                                  )
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
                        <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                          Tidak ditemukan pelamar pada filter/tahap ini.
                        </td>
                      </tr>
                    );
                  }

                  return displayList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-[#061f1d]/60 transition-colors group">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(app)}
                          className="font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left block text-xs cursor-pointer"
                        >
                          {app.candidate_name}
                        </button>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-200/70">{app.candidate_email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-slate-800 dark:text-emerald-100 text-xs">{app.job_title}</span>
                        <p className="text-[10px] text-slate-500">{app.department}</p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="whitespace-nowrap inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 dark:bg-[#061f1d] border border-slate-300 dark:border-teal-700/60 text-slate-800 dark:text-teal-300 font-bold text-[10px] min-w-[130px]">
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
                          <p className="text-purple-700 dark:text-purple-300 font-medium">Tes: {app.test_score !== null && app.test_score !== undefined ? `${app.test_score}/100` : "-"}</p>
                          <p className="text-indigo-700 dark:text-indigo-300 font-medium">HR: {app.hr_interview_score !== null && app.hr_interview_score !== undefined ? `${app.hr_interview_score}/100` : "-"}</p>
                          <p className="text-cyan-700 dark:text-cyan-300 font-medium">User: {app.user_interview_score !== null && app.user_interview_score !== undefined ? `${app.user_interview_score}/100` : "-"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(app)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Review kandidat"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                          </button>

                          {app.kanban_stage === "diajukan" && (
                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() =>
                                handleDirectStageChange(
                                  app.id,
                                  "screening",
                                  "Diproses",
                                  "Kandidat masuk ke tahap screening CV oleh tim HR."
                                )
                              }
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors cursor-pointer"
                              title="Screening CV"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {app.kanban_stage === "screening" && (
                            <button
                              type="button"
                              onClick={() => openScheduleModal(app, "test")}
                              className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                              title="Jadwalkan Tes"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {app.kanban_stage === "assessment" && (
                            app.test_score === null || app.test_score === undefined ? (
                              <button
                                type="button"
                                disabled
                                title="Menunggu nilai tes dimasukkan oleh penilai"
                                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openScheduleModal(app, "interview_hr")}
                                className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                                title="Jadwalkan Interview HR"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}

                          {app.kanban_stage === "interview_hr" && (
                            <>
                              {app.hr_interview_score === null || app.hr_interview_score === undefined ? (
                                <button
                                  type="button"
                                  onClick={() => openDirectGradeModal(app, "interview_hr")}
                                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer animate-pulse"
                                  title="Beri Nilai HR"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openDirectGradeModal(app, "interview_hr")}
                                    className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                                    title={`Nilai HR: ${app.hr_interview_score}/100 — klik untuk ubah`}
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(app, "interview_user")}
                                    className="p-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d6962] text-white transition-colors cursor-pointer"
                                    title="Jadwalkan Interview User"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {app.kanban_stage === "interview_user" && (
                            <>
                              {app.user_interview_score === null || app.user_interview_score === undefined ? (
                                <button
                                  type="button"
                                  onClick={() => openDirectGradeModal(app, "interview_user")}
                                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer animate-pulse"
                                  title="Beri Nilai User"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openDirectGradeModal(app, "interview_user")}
                                    className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                                    title={`Nilai User: ${app.user_interview_score}/100 — klik untuk ubah`}
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingId === app.id}
                                    onClick={() =>
                                      handleDirectStageChange(
                                        app.id,
                                        "diterima",
                                        "Diterima",
                                        "Kandidat dinyatakan lolos seluruh tahapan seleksi (Tes, HR, User)."
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                                    title="Terima Kandidat"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          {app.kanban_stage === "diterima" && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              ✓ Lolos Seleksi
                            </span>
                          )}

                          {app.kanban_stage === "ditolak" && (
                            <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                              Ditolak
                            </span>
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

              {/* Lokasi / Gedung / Ruangan / Link Meeting */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Lokasi / Ruangan / Link Pertemuan *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={schedLocation}
                    onChange={(e) => setSchedLocation(e.target.value)}
                    placeholder={
                      scheduleModalMode === "test"
                        ? "Misal: Lab Komputer Gd. B Lt. 2 atau Link Google Meet"
                        : "Misal: Ruang Rapat HR Lt. 3 atau Link Google Meet"
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Catatan Tambahan (Opsional) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Catatan Tambahan untuk Kandidat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  placeholder="Misal: Harap hadir 15 menit lebih awal dan membawa portofolio..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs resize-none"
                />
              </div>

              {/* Penilai / Pewawancara */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  {scheduleModalMode === "interview_user"
                    ? "Nama Calon Atasan (User / Tech Lead) *"
                    : "Pilih Penilai / Pewawancara yang Bertugas *"}
                </label>

                {scheduleModalMode === "interview_user" ? (
                  <input
                    type="text"
                    required
                    value={customSchedEvaluator}
                    onChange={(e) => setCustomSchedEvaluator(e.target.value)}
                    placeholder="Ketik nama Calon Atasan (misal: Budi Santoso - Head of Engineering)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
                  />
                ) : (
                  <>
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
                        penilaiStaff && penilaiStaff.length > 0 ? (
                          penilaiStaff.map((p) => (
                            <option key={p.id} value={p.full_name}>
                              {p.full_name} ({p.role.toUpperCase()})
                            </option>
                          ))
                        ) : (
                          <option value="Dr. Bambang / Tim Penilai">Dr. Bambang / Tim Penilai (Penilai Resmi)</option>
                        )
                      )}
                      {scheduleModalMode === "interview_hr" && (
                        hrStaff && hrStaff.length > 0 ? (
                          hrStaff.map((h) => (
                            <option key={h.id} value={h.full_name}>
                              {h.full_name} ({h.role.toUpperCase()})
                            </option>
                          ))
                        ) : (
                          <option value="Sarah Wijaya (Lead Recruiter HR)">Sarah Wijaya (Lead Recruiter HR)</option>
                        )
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
                  </>
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

      {/* Candidate Comprehensive Profile & Detail Modal */}
      {selectedReviewCandidate && (
        <CandidateDetailModal
          data={selectedReviewCandidate}
          onClose={() => setSelectedReviewCandidate(null)}
        />
      )}

      {/* Modal Input Nilai Langsung (Direct Scoring HR / User) */}
      {directGradeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/80 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-slate-700 dark:text-slate-300 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {directGradeMode === "interview_hr"
                      ? "Beri Nilai Interview HR"
                      : "Beri Nilai Interview User (Calon Atasan)"}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-teal-300/80">
                    Input skor wawancara langsung dari papan rekrutmen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDirectGradeApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-teal-900/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#061f1d] rounded-xl border border-slate-200 dark:border-teal-900 space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {directGradeApp.candidate_name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-teal-200/80">
                {directGradeApp.job_title} &bull; {directGradeApp.department}
              </p>
            </div>

            <form onSubmit={handleDirectGradeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pewawancara / Penilai *
                </label>
                <input
                  type="text"
                  required
                  value={directEvaluatorInput}
                  onChange={(e) => setDirectEvaluatorInput(e.target.value)}
                  placeholder={
                    directGradeMode === "interview_hr"
                      ? "Contoh: Sarah Wijaya (HR Lead)"
                      : "Contoh: Budi Santoso (Calon Atasan)"
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#061f1d] border border-slate-300 dark:border-teal-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Skor Penilaian Wawancara (0 - 100) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={directScoreInput}
                  onChange={(e) => setDirectScoreInput(e.target.value)}
                  placeholder="Contoh: 85"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#061f1d] border border-slate-300 dark:border-teal-800 text-slate-900 dark:text-white text-xs font-bold text-base focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi / Rekomendasi
                </label>
                <textarea
                  rows={3}
                  value={directNotesInput}
                  onChange={(e) => setDirectNotesInput(e.target.value)}
                  placeholder="Tuliskan catatan hasil interview atau masukan calon atasan..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#061f1d] border border-slate-300 dark:border-teal-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDirectGradeApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-teal-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingDirectGrade}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingDirectGrade && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Nilai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
