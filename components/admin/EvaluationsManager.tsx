"use client";

import React, { useState } from "react";
import { AssessmentReviewRow } from "@/types/admin";
import { submitAssessmentEvaluation, scheduleAssessmentOrInterview, submitDirectStageScore } from "@/app/actions/admin";
import { AssessmentType } from "@/types/candidate";
import ClickableDateTimePicker from "./ClickableDateTimePicker";
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  Award,
  AlertCircle,
  Loader2,
  Calendar,
  X,
  FileText,
  ChevronRight,
  Plus,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Info,
  Lock,
  Eye,
  MapPin,
  Building2,
} from "lucide-react";
import Link from "next/link";
import CandidateDetailModal, { CandidateDetailData } from "./CandidateDetailModal";

export interface CandidateOption {
  id: string;
  candidate_name: string;
  job_title: string;
  department: string;
  status: string;
}

interface EvaluationsManagerProps {
  initialAssessments: AssessmentReviewRow[];
  activeCandidates?: CandidateOption[];
  userRole?: string;
  userName?: string;
}

const DEFAULT_GMAPS_URL = "https://maps.app.goo.gl/DgmJZPBgV4SQ8Cq36";
const DEFAULT_OFFICE_LOCATION = "Kantor Pusat Nexora Digital (Ruang Asesmen & Interview)";

const PRESET_EVALUATORS = [
  "Dr. Bambang / Tim Penilai & Interviewer",
  "Sarah Wijaya (Lead Recruiter HR)",
  "Interviewer User (Calon Atasan / Tech Lead)",
  "Assessor Psikotes & Aptitude",
];

export default function EvaluationsManager({
  initialAssessments,
  activeCandidates = [],
  userRole = "hr",
  userName = "Admin HR",
}: EvaluationsManagerProps) {
  const [assessments, setAssessments] = useState<AssessmentReviewRow[]>(initialAssessments);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "interview" | "test" | "interview_hr" | "interview_user" | "pending" | "completed"
  >("all");

  // Candidate Full Detail Modal State (opens comprehensive profile modal)
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<CandidateDetailData | null>(null);

  // Grading Modal State
  const [editingAssessment, setEditingAssessment] = useState<AssessmentReviewRow | null>(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  const [evaluatorInput, setEvaluatorInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [loadingGrade, setLoadingGrade] = useState(false);

  // New Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleAppId, setScheduleAppId] = useState<string>(activeCandidates[0]?.id || "");
  const [scheduleType, setScheduleType] = useState<AssessmentType>("Technical Test");
  const [scheduleDateTime, setScheduleDateTime] = useState<string>("");
  const [scheduleEvaluator, setScheduleEvaluator] = useState<string>(PRESET_EVALUATORS[0]);
  const [customEvaluator, setCustomEvaluator] = useState<string>("");
  const [isCustomEvaluator, setIsCustomEvaluator] = useState<boolean>(false);
  const [scheduleLocation, setScheduleLocation] = useState<string>(DEFAULT_OFFICE_LOCATION);
  const [scheduleGmapsUrl, setScheduleGmapsUrl] = useState<string>(DEFAULT_GMAPS_URL);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedGradeStage, setSelectedGradeStage] = useState<"Interview HR" | "Interview User">("Interview HR");

  // Helper to strip location and gmaps metadata from notes (keeps notes clean/empty by default)
  const cleanEvaluationNotes = (notes?: string | null): string => {
    if (!notes) return "";
    return notes
      .replace(/\[Lokasi[^\]]*\]/gi, "")
      .replace(/\[GMaps:[^\]]*\]/gi, "")
      .replace(/https?:\/\/maps[^\s]+/gi, "")
      .trim();
  };

  // Open Candidate Detail Modal with full profile data & multi-stage score breakdown
  const handleOpenCandidateDetail = (item: AssessmentReviewRow) => {
    setSelectedCandidateDetail({
      id: item.application_id,
      candidate_id: item.candidate_id || item.application_id,
      candidate_name: item.candidate_name,
      candidate_email: item.candidate_email,
      candidate_phone: item.candidate_phone,
      candidate_nik: item.candidate_nik,
      candidate_ktp_url: item.candidate_ktp_url,
      candidate_ktp_name: item.candidate_ktp_name,
      candidate_avatar_url: item.candidate_avatar_url,
      candidate_address: item.candidate_address,
      candidate_headline: item.candidate_headline,
      candidate_bio: item.candidate_bio,
      job_title: item.job_title,
      department: item.department,
      skills: item.candidate_skills || [],
      education: [
        {
          level: item.candidate_education_level || "S1",
          school: item.candidate_university || item.candidate_education || "Perguruan Tinggi",
          major: item.candidate_major || "-",
        },
      ],
      experience: item.candidate_experience || [],
      resume_url: item.candidate_resume_url,
      resume_name: item.candidate_resume_name || "CV_Kandidat.pdf",
      test_score: item.test_score !== undefined ? item.test_score : (!item.type.includes("Interview") ? item.score : null),
      test_evaluator: item.test_evaluator || (!item.type.includes("Interview") ? item.evaluator_name : null),
      hr_interview_score: item.hr_interview_score !== undefined ? item.hr_interview_score : (item.type === "Interview HR" ? item.score : null),
      hr_interview_evaluator: item.hr_interview_evaluator || (item.type === "Interview HR" ? item.evaluator_name : null),
      user_interview_score: item.user_interview_score !== undefined ? item.user_interview_score : (item.type === "Interview User" ? item.score : null),
      user_interview_evaluator: item.user_interview_evaluator || (item.type === "Interview User" ? item.evaluator_name : null),
    });
  };

  // Open Grade Modal with role-based restriction & clean notes
  const handleOpenGradeModal = (item: AssessmentReviewRow) => {
    const isStaffHr = userRole === "hr" || userRole === "admin";
    const isStaffPenilai = userRole === "penilai" || userRole === "interviewer";

    setEditingAssessment(item);

    if (isStaffPenilai) {
      setScoreInput(
        item.test_score !== null && item.test_score !== undefined
          ? String(item.test_score)
          : item.score !== null
          ? String(item.score)
          : ""
      );
      setEvaluatorInput(item.test_evaluator || item.evaluator_name || userName || "");
      setNotesInput(cleanEvaluationNotes(item.test_notes || item.notes));
    } else {
      // HR: default to stage that needs score or Interview HR
      const defaultStage: "Interview HR" | "Interview User" =
        item.hr_interview_score === null && item.user_interview_score !== null
          ? "Interview HR"
          : item.hr_interview_score !== null && item.user_interview_score === null
          ? "Interview User"
          : "Interview HR";
      setSelectedGradeStage(defaultStage);

      if (defaultStage === "Interview HR") {
        setScoreInput(
          item.hr_interview_score !== null && item.hr_interview_score !== undefined
            ? String(item.hr_interview_score)
            : ""
        );
        setEvaluatorInput(item.hr_interview_evaluator || userName || "Tim HR");
        setNotesInput(cleanEvaluationNotes(item.hr_interview_notes));
      } else {
        setScoreInput(
          item.user_interview_score !== null && item.user_interview_score !== undefined
            ? String(item.user_interview_score)
            : ""
        );
        setEvaluatorInput(item.user_interview_evaluator || "Calon Atasan (User)");
        setNotesInput(cleanEvaluationNotes(item.user_interview_notes));
      }
    }
  };

  const handleSwitchGradeStage = (stage: "Interview HR" | "Interview User") => {
    if (!editingAssessment) return;
    setSelectedGradeStage(stage);
    if (stage === "Interview HR") {
      setScoreInput(
        editingAssessment.hr_interview_score !== null && editingAssessment.hr_interview_score !== undefined
          ? String(editingAssessment.hr_interview_score)
          : ""
      );
      setEvaluatorInput(editingAssessment.hr_interview_evaluator || userName || "Tim HR");
      setNotesInput(cleanEvaluationNotes(editingAssessment.hr_interview_notes));
    } else {
      setScoreInput(
        editingAssessment.user_interview_score !== null && editingAssessment.user_interview_score !== undefined
          ? String(editingAssessment.user_interview_score)
          : ""
      );
      setEvaluatorInput(editingAssessment.user_interview_evaluator || "Calon Atasan (User)");
      setNotesInput(cleanEvaluationNotes(editingAssessment.user_interview_notes));
    }
  };

  // Helper function to check if an assessment is assigned to the current evaluator
  const isEvaluatorMatching = (evaluatorName: string | undefined | null, currentUserName: string | undefined | null): boolean => {
    if (!evaluatorName || !currentUserName) return false;

    const evalClean = evaluatorName.toLowerCase().trim();
    const userClean = currentUserName.toLowerCase().trim();

    if (evalClean === userClean) return true;
    if (evalClean.includes(userClean) || userClean.includes(evalClean)) return true;

    // Helper to split words and remove common Indonesian/English noise words (min 3 chars)
    const splitWords = (str: string) =>
      str
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 3 && !["tim", "dan", "the", "bin", "lead", "official", "resmi"].includes(w));

    const userWords = splitWords(userClean);
    const evalWords = splitWords(evalClean);

    if (userWords.length === 0 || evalWords.length === 0) {
      return evalClean.includes(userClean) || userClean.includes(evalClean);
    }

    return userWords.some((uw) => evalWords.some((ew) => ew.includes(uw) || uw.includes(ew)));
  };

  // Role scoping logic:
  // Penilai ONLY sees technical/psychological tests assigned directly to them.
  // HR / Admin sees all candidate assessments in the pipeline (unified 1 row per candidate).
  const isStaffPenilai = userRole === "penilai" || userRole === "interviewer";
  const isStaffHr = userRole === "hr" || userRole === "admin";

  const scopedAssessments = React.useMemo(() => {
    if (isStaffPenilai) {
      // 1. Cek kecocokan evaluator langsung berdasarkan nama penilai aktif atau default preset penilai
      const matched = assessments.filter((a) => {
        const assignedEvaluator = a.test_evaluator || (!a.type.includes("Interview") ? a.evaluator_name : "");
        return (
          isEvaluatorMatching(assignedEvaluator, userName) ||
          isEvaluatorMatching(assignedEvaluator, "Dr. Bambang") ||
          isEvaluatorMatching(assignedEvaluator, "Tim Penilai") ||
          isEvaluatorMatching(assignedEvaluator, "Penilai")
        );
      });

      if (matched.length > 0) {
        return matched;
      }

      // 2. Fallback aman: jika penilai mengubah nama di profil, pastikan data tidak hilang (0 seleksi).
      // Tampilkan seluruh kandidat yang memerlukan atau telah menjalani tahapan tes asesmen.
      return assessments.filter((a) => {
        const isTest = !a.type?.toLowerCase().includes("interview");
        const hasTestInfo = Boolean(a.test_evaluator || a.test_score !== null || a.test_score !== undefined);
        return isTest || hasTestInfo || (a.status !== "Ditolak" && a.status !== "Rejected");
      });
    }
    // HR view: shows all candidate evaluations
    return assessments;
  }, [assessments, isStaffPenilai, userName]);

  // Statistics calculation based on scoped assessments
  const totalCount = scopedAssessments.length;
  const pendingCount = scopedAssessments.filter((a) =>
    isStaffPenilai ? a.test_score === null : (a.hr_interview_score === null || a.user_interview_score === null)
  ).length;
  const completedCount = scopedAssessments.filter((a) =>
    isStaffPenilai ? a.test_score !== null : (a.hr_interview_score !== null || a.user_interview_score !== null)
  ).length;
  const scoredItems = scopedAssessments.filter((a) =>
    isStaffPenilai ? a.test_score !== null : (a.hr_interview_score !== null || a.user_interview_score !== null)
  );
  const avgScore =
    scoredItems.length > 0
      ? Math.round(
          scoredItems.reduce((acc, curr) => {
            const sc = isStaffPenilai
              ? curr.test_score || 0
              : curr.hr_interview_score || curr.user_interview_score || curr.score || 0;
            return acc + sc;
          }, 0) / scoredItems.length
        )
      : null;

  // Specific interview breakdown for HR tabs
  const hrInterviewCount = scopedAssessments.filter((a) => a.hr_interview_id || a.type === "Interview HR" || a.hr_interview_score !== null).length;
  const userInterviewCount = scopedAssessments.filter((a) => a.user_interview_id || a.type === "Interview User" || a.user_interview_score !== null).length;

  // Filter logic
  const filtered = scopedAssessments.filter((item) => {
    const matchesSearch =
      item.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.test_evaluator && item.test_evaluator.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.hr_interview_evaluator && item.hr_interview_evaluator.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user_interview_evaluator && item.user_interview_evaluator.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "pending") {
      return isStaffPenilai ? item.test_score === null : (item.hr_interview_score === null || item.user_interview_score === null);
    } else if (activeTab === "completed") {
      return isStaffPenilai ? item.test_score !== null : (item.hr_interview_score !== null && item.user_interview_score !== null);
    } else if (activeTab === "interview_hr") {
      return Boolean(item.hr_interview_id || item.type === "Interview HR" || item.hr_interview_score !== null);
    } else if (activeTab === "interview_user") {
      return Boolean(item.user_interview_id || item.type === "Interview User" || item.user_interview_score !== null);
    }
    return true;
  });

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;

    let numericScore: number | null = null;
    if (scoreInput.trim() !== "") {
      const parsed = parseFloat(scoreInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("Nilai harus berupa angka antara 0 hingga 100.");
        return;
      }
      numericScore = parsed;
    }

    setLoadingGrade(true);
    const isStaffHr = userRole === "hr" || userRole === "admin";

    if (isStaffHr) {
      const res = await submitDirectStageScore({
        application_id: editingAssessment.application_id,
        stage_type: selectedGradeStage,
        score: numericScore ?? 0,
        notes: notesInput,
        evaluator_name: evaluatorInput,
      });
      setLoadingGrade(false);

      if (res.success) {
        setAssessments((prev) =>
          prev.map((a) => {
            if (a.application_id !== editingAssessment.application_id) return a;
            if (selectedGradeStage === "Interview HR") {
              return {
                ...a,
                hr_interview_score: numericScore,
                hr_interview_evaluator: evaluatorInput,
                hr_interview_notes: notesInput,
                hr_interview_status: "Completed",
              };
            } else {
              return {
                ...a,
                user_interview_score: numericScore,
                user_interview_evaluator: evaluatorInput,
                user_interview_notes: notesInput,
                user_interview_status: "Completed",
              };
            }
          })
        );
        setEditingAssessment(null);
        setToastMsg(`Nilai ${selectedGradeStage} untuk ${editingAssessment.candidate_name} berhasil disimpan!`);
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(res.error || "Gagal menyimpan hasil penilaian.");
      }
    } else {
      const targetId = editingAssessment.test_id || editingAssessment.id;
      const res = await submitAssessmentEvaluation({
        assessment_id: targetId,
        application_id: editingAssessment.application_id,
        score: numericScore,
        notes: notesInput,
        evaluator_name: evaluatorInput,
      });
      setLoadingGrade(false);

      if (res.success) {
        setAssessments((prev) =>
          prev.map((a) =>
            a.application_id === editingAssessment.application_id
              ? {
                  ...a,
                  test_score: numericScore,
                  test_evaluator: evaluatorInput,
                  test_notes: notesInput,
                  test_status: numericScore !== null ? "Completed" : "Scheduled",
                  score: numericScore,
                  status: numericScore !== null ? "Completed" : "Scheduled",
                }
              : a
          )
        );
        setEditingAssessment(null);
        setToastMsg(`Nilai tes seleksi untuk ${editingAssessment.candidate_name} berhasil disimpan!`);
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(res.error || "Gagal menyimpan hasil penilaian.");
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleAppId) {
      alert("Pilih kandidat terlebih dahulu.");
      return;
    }
    if (!scheduleDateTime) {
      alert("Pilih tanggal dan waktu pelaksanaan tes/interview.");
      return;
    }

    const finalEvaluator = isCustomEvaluator ? customEvaluator.trim() : scheduleEvaluator;
    if (!finalEvaluator) {
      alert("Pilih atau isi nama penilai.");
      return;
    }

    setLoadingSchedule(true);
    const res = await scheduleAssessmentOrInterview({
      application_id: scheduleAppId,
      type: scheduleType,
      scheduled_at: new Date(scheduleDateTime).toISOString(),
      evaluator_name: finalEvaluator,
      location: scheduleLocation.trim() || undefined,
      gmaps_url: scheduleGmapsUrl.trim() || undefined,
    });
    setLoadingSchedule(false);

    if (res.success) {
      const targetCandidate = activeCandidates.find((c) => c.id === scheduleAppId);
      const newRow: AssessmentReviewRow = {
        id: `sched-${Date.now()}`,
        application_id: scheduleAppId,
        candidate_name: targetCandidate?.candidate_name || "Kandidat Baru",
        candidate_email: "pelamar@talenthub.com",
        job_title: targetCandidate?.job_title || "Posisi Terpilih",
        department: targetCandidate?.department || "General",
        type: scheduleType,
        scheduled_at: new Date(scheduleDateTime).toISOString(),
        evaluator_name: finalEvaluator,
        score: null,
        status: "Scheduled",
      };

      setAssessments((prev) => [newRow, ...prev]);
      setShowScheduleModal(false);
      setScheduleLocation("");
      setScheduleGmapsUrl("");
      setToastMsg(
        res.emailMessage
          ? `Jadwal ${scheduleType} disimpan. ${res.emailMessage}`
          : `Jadwal ${scheduleType} berhasil disimpan.`
      );
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      alert(res.error || "Gagal membuat jadwal penilaian.");
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Technical Test":
        return "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/60";
      case "Psikotes":
        return "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/60";
      case "Interview HR":
        return "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/60";
      case "Interview User":
        return "bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/60";
      default:
        return "bg-emerald-50 dark:bg-slate-900/80 text-emerald-700 dark:text-teal-300 border-emerald-200 dark:border-emerald-700/60";
    }
  };

  const formatSchedule = (dateStr?: string | null) => {
    if (!dateStr) return "Belum dijadwalkan";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 dark:bg-emerald-900 border border-slate-700 dark:border-emerald-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-xs">Operasi Berhasil</p>
            <p className="text-[11px] text-slate-300 dark:text-teal-200">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Penilaian Seleksi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar evaluasi tes teknis, interview HR, dan wawancara user.
          </p>
        </div>

        {/* Khusus HR/Admin: Tombol Jadwalkan Seleksi & Papan Kanban disembunyikan untuk Penilai */}
        {userRole !== "penilai" && userRole !== "interviewer" && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Seleksi</span>
            </button>

            <Link
              href="/admin/kanban"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#132238] hover:bg-slate-50 dark:hover:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-2xs"
            >
              <span>Papan Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Seleksi</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isStaffPenilai
              ? `${totalCount} Tes Asesmen`
              : `${hrInterviewCount} HR · ${userInterviewCount} User`}
          </p>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Menunggu Nilai</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Perlu evaluasi penilai</p>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Selesai Dinilai</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-teal-400 mt-1">{completedCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-teal-400/80 mt-0.5">Skor sudah masuk</p>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rata-Rata Skor</p>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{avgScore !== null ? `${avgScore}/100` : "-"}</p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400/80 mt-0.5">Seluruh asesmen</p>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs & Search */}
      <div className="bg-white/90 dark:bg-[#132238]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-sm dark:bg-[#0F766E] dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Semua ({totalCount})
            </button>

            {/* HR specific interview filter tabs */}
            {!isStaffPenilai && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("interview_hr")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    activeTab === "interview_hr" ? "bg-white text-slate-900 shadow-sm dark:bg-[#0F766E] dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  Interview HR ({hrInterviewCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("interview_user")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    activeTab === "interview_user" ? "bg-white text-slate-900 shadow-sm dark:bg-[#0F766E] dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  Interview User ({userInterviewCount})
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 dark:text-amber-300 hover:text-amber-900"
              }`}
            >
              Menunggu Nilai ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === "completed" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 dark:text-teal-300 hover:text-emerald-900"
              }`}
            >
              Sudah Dinilai ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kandidat, posisi, atau penilai..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Interactive Assessment & Evaluation Table (Compact, clean font size & neat columns) */}
      <div className="bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-slate-700 dark:text-teal-400" />
              Daftar Kandidat & Jadwal Penilaian ({filtered.length})
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
              Klik ikon mata untuk melihat info detail profil & CV, atau ikon piala untuk input skor evaluasi.
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-[#0B132B] text-slate-700 dark:text-teal-300 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800/80 tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[170px]">Kandidat</th>
                <th className="px-3 py-3 min-w-[130px]">Jenis Seleksi</th>
                <th className="px-3 py-3 min-w-[150px]">Tgl Tes</th>
                <th className="px-3 py-3 min-w-[160px]">Penilai yang Bertugas</th>
                <th className="px-3 py-3 text-center min-w-[110px]">Status</th>
                <th className="px-3 py-3 text-center min-w-[110px]">Nilai (0–100)</th>
                <th className="px-4 py-3 text-center min-w-[160px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-emerald-900/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-7 h-7 text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {isStaffPenilai
                          ? `Belum ada jadwal tes seleksi yang ditugaskan kepada Anda (${userName}).`
                          : "Belum ada kandidat pada filter ini."}
                      </p>
                      {userRole !== "penilai" && userRole !== "interviewer" && (
                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(true)}
                          className="px-3.5 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Jadwalkan Kandidat Sekarang</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#0B132B]/60 transition-colors">
                    {/* Candidate Name & Job */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenCandidateDetail(item)}
                        className="font-bold text-slate-900 dark:text-white hover:text-[#0F766E] dark:hover:text-teal-300 transition-colors text-left text-xs truncate max-w-[200px] block cursor-pointer"
                        title={item.candidate_name}
                      >
                        {item.candidate_name}
                      </button>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {item.job_title}
                      </p>
                    </td>

                    {/* Selection Type: Menampilkan jenis seleksi yang terbaru / terakhir kali dijalani saja */}
                    {(() => {
                      const latestStageName = isStaffPenilai
                        ? item.test_id ? "Technical Test" : item.type
                        : (item.user_interview_id || item.user_interview_score !== null)
                        ? "Interview User"
                        : (item.hr_interview_id || item.hr_interview_score !== null)
                        ? "Interview HR"
                        : item.test_id ? "Technical Test" : item.type;

                      const latestEvaluatorName = isStaffPenilai
                        ? item.test_evaluator || item.evaluator_name
                        : latestStageName === "Interview User"
                        ? item.user_interview_evaluator || "Calon Atasan / User"
                        : latestStageName === "Interview HR"
                        ? item.hr_interview_evaluator || "Tim HR"
                        : item.test_evaluator || item.evaluator_name;

                      const isLatestCompleted = latestStageName === "Interview User"
                        ? item.user_interview_score !== null
                        : latestStageName === "Interview HR"
                        ? item.hr_interview_score !== null
                        : (item.test_score !== null || item.score !== null);

                      return (
                        <>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md border font-semibold text-[10px] whitespace-nowrap ${
                                latestStageName === "Interview User"
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800"
                                  : latestStageName === "Interview HR"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
                                  : getTypeBadgeColor(latestStageName)
                              }`}
                            >
                              {latestStageName}
                            </span>
                          </td>

                          {/* Tgl Tes (Jadwal Pelaksanaan) */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400 shrink-0" />
                              <span>{formatSchedule(item.scheduled_at)}</span>
                            </span>
                          </td>

                          {/* Penilai yang Bertugas (Sesuai tahap terakhir) */}
                          <td className="px-3 py-3 truncate">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-teal-200 truncate">
                              <User className="w-3.5 h-3.5 text-slate-400 dark:text-teal-400 shrink-0" />
                              <span className="truncate" title={latestEvaluatorName}>
                                {latestEvaluatorName}
                              </span>
                            </span>
                          </td>

                          {/* Status: Selesai vs Belum (Sesuai tahap terakhir) */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {isLatestCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-teal-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-teal-400" />
                                <span>Selesai</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-500" />
                                <span>Belum</span>
                              </span>
                            )}
                          </td>
                        </>
                      );
                    })()}

                    {/* Score (0 vs null) */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {isStaffHr ? (
                        <div className="flex flex-col gap-1 items-center">
                          <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                            <span
                              className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold"
                              title={`Nilai Tes dari Tim Penilai (${item.test_evaluator || "Penilai"}): ${item.test_score !== null && item.test_score !== undefined ? `${item.test_score}/100` : "Belum Dinilai"}`}
                            >
                              Tes: {item.test_score !== null && item.test_score !== undefined ? `${item.test_score}` : "-"}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold"
                              title={`Nilai Interview HR (${item.hr_interview_evaluator || "HR"}): ${item.hr_interview_score !== null && item.hr_interview_score !== undefined ? `${item.hr_interview_score}/100` : "Belum Dinilai"}`}
                            >
                              HR: {item.hr_interview_score !== null && item.hr_interview_score !== undefined ? `${item.hr_interview_score}` : "-"}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[10px] font-bold"
                              title={`Nilai Interview User (${item.user_interview_evaluator || "User"}): ${item.user_interview_score !== null && item.user_interview_score !== undefined ? `${item.user_interview_score}/100` : "Belum Dinilai"}`}
                            >
                              User: {item.user_interview_score !== null && item.user_interview_score !== undefined ? `${item.user_interview_score}` : "-"}
                            </span>
                          </div>
                        </div>
                      ) : item.test_score === null && item.score === null ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold text-[10px]">
                          Belum Dinilai
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1 ${
                            (item.test_score ?? item.score ?? 0) >= 75
                              ? "bg-emerald-50 dark:bg-slate-900 text-emerald-700 dark:text-teal-300 border border-emerald-300 dark:border-emerald-600"
                              : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {item.test_score ?? item.score} / 100
                        </span>
                      )}
                    </td>

                    {/* Action Controls: Icon-only buttons for Review, Selesai Tes, Ubah Nilai */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {(() => {
                        const isPending = isStaffPenilai
                          ? item.test_score === null
                          : item.hr_interview_score === null || item.user_interview_score === null;

                        return (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Review Detail (Ikon Saja) */}
                            <button
                              type="button"
                              onClick={() => handleOpenCandidateDetail(item)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B132B] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                              title="Lihat Detail Profil, Berkas & Rekap Nilai Kandidat"
                            >
                              <Eye className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                            </button>

                            {/* Tombol Input / Ubah Nilai (Ikon Saja) */}
                            <button
                              type="button"
                              onClick={() => handleOpenGradeModal(item)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isPending
                                  ? "bg-[#0F766E] hover:bg-[#0d6962] text-white shadow-xs"
                                  : "bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                              }`}
                              title={
                                isStaffHr
                                  ? "Input / Ubah Nilai Interview HR & User"
                                  : "Input / Ubah Nilai Tes Teknis"
                              }
                            >
                              {isPending ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : (
                                <Award className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                              )}
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 2: PENJADWALAN SELEKSI BARU OLEH HR DENGAN CLICKABLE PICKER   */}
      {/* ==================================================================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#132238] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-700 dark:text-teal-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Jadwalkan Seleksi untuk Penilai</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* 1. Pilih Pelamar Aktif */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-teal-300 uppercase tracking-wider mb-1">
                  Pilih Kandidat Pelamar *
                </label>
                {activeCandidates.length === 0 ? (
                  <p className="text-amber-600 dark:text-amber-400 text-xs italic bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                    Tidak ada kandidat dengan status aktif untuk dijadwalkan.
                  </p>
                ) : (
                  <select
                    value={scheduleAppId}
                    onChange={(e) => setScheduleAppId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                  >
                    {activeCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.candidate_name} — {c.job_title} ({c.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Jenis Tahap Seleksi */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-teal-300 uppercase tracking-wider mb-1">
                  Pilih Jenis Tahap Seleksi *
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as AssessmentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                >
                  <option value="Technical Test">Technical Test (Tes Koding / Teknis)</option>
                  <option value="Psikotes">Psikotes (Psikologi & Bakat)</option>
                  <option value="Aptitude Test">Aptitude Test (Logika & Numerik)</option>
                  <option value="Personality Test">Personality Test (Kepribadian)</option>
                  <option value="Interview HR">Interview HR (Wawancara SDM)</option>
                  <option value="Interview User">Interview User (Calon Atasan Langsung)</option>
                </select>
              </div>

              {/* 3. Tanggal & Jam (100% CLICKABLE DATE & TIME PICKER) */}
              <ClickableDateTimePicker
                value={scheduleDateTime}
                onChange={setScheduleDateTime}
                required
              />

              {/* 4. Pemilihan Penilai */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-teal-300 uppercase tracking-wider mb-1">
                  Pilih Penilai / Interviewer yang Bertugas *
                </label>
                <select
                  value={isCustomEvaluator ? "custom" : scheduleEvaluator}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomEvaluator(true);
                    } else {
                      setIsCustomEvaluator(false);
                      setScheduleEvaluator(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 mb-2"
                >
                  {PRESET_EVALUATORS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                  <option value="custom">+ Masukkan Nama Penilai Lainnya...</option>
                </select>

                {isCustomEvaluator && (
                  <input
                    type="text"
                    required
                    value={customEvaluator}
                    onChange={(e) => setCustomEvaluator(e.target.value)}
                    placeholder="Ketik nama penilai / tim..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-emerald-500 text-slate-900 dark:text-white focus:outline-none text-xs"
                  />
                )}
              </div>

              {/* 5. Lokasi / Ruangan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-teal-300 uppercase tracking-wider text-[11px]">
                    Lokasi / Ruangan / Gedung
                  </label>
                  {scheduleLocation !== DEFAULT_OFFICE_LOCATION && (
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleLocation(DEFAULT_OFFICE_LOCATION);
                        setScheduleGmapsUrl(DEFAULT_GMAPS_URL);
                      }}
                      className="text-[10px] text-[#0F766E] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Reset ke Default Gedung Kantor
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    placeholder="Misal: Ruang Rapat HR Lt. 3, Gedung Utama Nexora"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* 6. Link Google Maps Lokasi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-teal-300 uppercase tracking-wider text-[11px]">
                    Link Google Maps Lokasi (Opsional)
                  </label>
                  {scheduleGmapsUrl !== DEFAULT_GMAPS_URL && (
                    <button
                      type="button"
                      onClick={() => setScheduleGmapsUrl(DEFAULT_GMAPS_URL)}
                      className="text-[10px] text-[#0F766E] dark:text-teal-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Pakai Link Default Gedung</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="url"
                    value={scheduleGmapsUrl}
                    onChange={(e) => setScheduleGmapsUrl(e.target.value)}
                    placeholder="Misal: https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>Default link kantor: <strong>maps.app.goo.gl/DgmJZPBgV4SQ8Cq36</strong></span>
                  {scheduleGmapsUrl && (
                    <button
                      type="button"
                      onClick={() => setScheduleGmapsUrl("")}
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Hapus Link
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B132B] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loadingSchedule || activeCandidates.length === 0}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingSchedule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Jadwal Seleksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: INPUT NILAI & CATATAN EVALUASI (SESUAI PAPAN KANBAN)       */}
      {/* ==================================================================== */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-slate-700 dark:text-slate-300 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isStaffHr ? `Beri Nilai ${selectedGradeStage}` : `Beri Nilai ${editingAssessment.type}`}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-teal-300/80">
                    {isStaffHr ? "Input skor evaluasi wawancara HR & User untuk kandidat" : "Input skor tes seleksi untuk kandidat"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAssessment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Header */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-teal-900 space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {editingAssessment.candidate_name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-teal-200/80">
                {editingAssessment.job_title} &bull; {editingAssessment.department || "Engineering"}
              </p>
            </div>

            {/* Read-Only Test Score from Penilai (Visible to HR & Penilai) */}
            <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-purple-900 dark:text-purple-200 font-semibold truncate">
                  Nilai Tes Teknis:
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold shrink-0">
                  {editingAssessment.test_score !== null && editingAssessment.test_score !== undefined
                    ? `${editingAssessment.test_score}/100`
                    : "Belum Dinilai"}
                </span>
              </div>
              <span className="text-[10px] text-purple-600/80 dark:text-purple-300 truncate max-w-[140px]">
                Penilai: {editingAssessment.test_evaluator || "Tim Penilai"}
              </span>
            </div>

            {/* HR Stage Selector Tabs (Interview HR vs Interview User) */}
            {isStaffHr && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSwitchGradeStage("Interview HR")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedGradeStage === "Interview HR"
                      ? "bg-white dark:bg-[#132238] text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span>Interview HR</span>
                  {editingAssessment.hr_interview_score !== null && editingAssessment.hr_interview_score !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {editingAssessment.hr_interview_score}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchGradeStage("Interview User")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedGradeStage === "Interview User"
                      ? "bg-white dark:bg-[#132238] text-cyan-600 dark:text-cyan-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span>Interview User</span>
                  {editingAssessment.user_interview_score !== null && editingAssessment.user_interview_score !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                      {editingAssessment.user_interview_score}
                    </span>
                  )}
                </button>
              </div>
            )}

            <form onSubmit={handleSaveGrade} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pewawancara / Penilai *
                </label>
                <input
                  type="text"
                  required
                  value={evaluatorInput}
                  onChange={(e) => setEvaluatorInput(e.target.value)}
                  placeholder="Nama penilai / pewawancara..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Skor Penilaian {isStaffHr ? selectedGradeStage : "Tes Seleksi"} (0 - 100) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="Contoh: 85"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi / Rekomendasi
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Tuliskan catatan hasil evaluasi atau masukan rekomendasi..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B132B] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAssessment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0B132B] dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingGrade}
                  className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingGrade && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Nilai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Comprehensive Profile & Detail Modal */}
      {selectedCandidateDetail && (
        <CandidateDetailModal
          data={selectedCandidateDetail}
          onClose={() => setSelectedCandidateDetail(null)}
          viewerRole={userRole}
        />
      )}
    </div>
  );
}
