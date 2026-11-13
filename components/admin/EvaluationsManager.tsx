"use client";

import React, { useState } from "react";
import { AssessmentReviewRow } from "@/types/admin";
import { submitAssessmentEvaluation, scheduleAssessmentOrInterview } from "@/app/actions/admin";
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
} from "lucide-react";
import Link from "next/link";
import CandidateDetailModal, { CandidateDetailData } from "./CandidateDetailModal";

interface CandidateOption {
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
  const [activeTab, setActiveTab] = useState<"all" | "interview" | "test" | "pending" | "completed">("all");

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
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Open Candidate Detail Modal with full profile data
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
      test_score: !item.type.includes("Interview") ? item.score : undefined,
      test_evaluator: !item.type.includes("Interview") ? item.evaluator_name : undefined,
      hr_interview_score: item.type === "Interview HR" ? item.score : undefined,
      hr_interview_evaluator: item.type === "Interview HR" ? item.evaluator_name : undefined,
      user_interview_score: item.type === "Interview User" ? item.score : undefined,
      user_interview_evaluator: item.type === "Interview User" ? item.evaluator_name : undefined,
    });
  };

  // Open Grade Modal with role-based restriction
  const handleOpenGradeModal = (item: AssessmentReviewRow) => {
    const isInterview = item.type.includes("Interview");
    const isStaffHr = userRole === "hr" || userRole === "admin";
    const isStaffPenilai = userRole === "penilai" || userRole === "interviewer";

    if (isStaffHr && !isInterview) {
      alert("Tim HR tidak dapat mengubah nilai tes yang merupakan wewenang Tim Penilai.");
      return;
    }
    if (isStaffPenilai && isInterview) {
      alert("Tim Penilai tidak dapat menginput nilai wawancara HR / User.");
      return;
    }

    setEditingAssessment(item);
    setScoreInput(item.score !== null ? String(item.score) : "");
    setEvaluatorInput(item.evaluator_name || userName || "");
    setNotesInput(item.notes || "");
  };

  // Statistics calculation
  const totalCount = assessments.length;
  const pendingCount = assessments.filter((a) => a.score === null).length;
  const completedCount = assessments.filter((a) => a.score !== null).length;
  const interviewCount = assessments.filter((a) => a.type.includes("Interview")).length;
  const scoredItems = assessments.filter((a) => a.score !== null);
  const avgScore =
    scoredItems.length > 0
      ? Math.round(scoredItems.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredItems.length)
      : null;

  // Filter logic
  const filtered = assessments.filter((item) => {
    const matchesSearch =
      item.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluator_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "interview") {
      return item.type.includes("Interview");
    } else if (activeTab === "test") {
      return !item.type.includes("Interview");
    } else if (activeTab === "pending") {
      return item.score === null;
    } else if (activeTab === "completed") {
      return item.score !== null;
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
    const res = await submitAssessmentEvaluation({
      assessment_id: editingAssessment.id,
      application_id: editingAssessment.application_id,
      score: numericScore,
      notes: notesInput,
      evaluator_name: evaluatorInput,
    });
    setLoadingGrade(false);

    if (res.success) {
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === editingAssessment.id
            ? {
                ...a,
                score: numericScore,
                notes: notesInput,
                evaluator_name: evaluatorInput,
                status: numericScore !== null ? "Completed" : "Scheduled",
              }
            : a
        )
      );
      setEditingAssessment(null);
      setToastMsg(`Nilai untuk ${editingAssessment.candidate_name} berhasil disimpan!`);
      setTimeout(() => setToastMsg(null), 4000);
    } else {
      alert(res.error || "Gagal menyimpan hasil penilaian.");
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
      setToastMsg(`Jadwal ${scheduleType} berhasil disimpan.`);
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
        return "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/60";
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
            <p className="text-[11px] text-slate-300 dark:text-emerald-200">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-teal-800/40">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Penilaian Seleksi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar evaluasi tes teknis, interview HR, dan wawancara user.
          </p>
        </div>

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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c2b29] hover:bg-slate-50 dark:hover:bg-[#061f1d] border border-slate-200/80 dark:border-teal-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-2xs"
          >
            <span>Papan Kanban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Seleksi</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{interviewCount} Wawancara · {totalCount - interviewCount} Tes</p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Menunggu Nilai</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Perlu evaluasi penilai</p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Selesai Dinilai</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Skor sudah masuk</p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rata-Rata Skor</p>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{avgScore !== null ? `${avgScore}/100` : "-"}</p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400/80 mt-0.5">Seluruh asesmen</p>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs & Search */}
      <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#061f1d] rounded-xl border border-slate-200 dark:border-emerald-800/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("interview")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === "interview" ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Wawancara HR & User ({interviewCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("test")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === "test" ? "bg-white text-slate-900 shadow-sm dark:bg-emerald-600 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Tes Teknis & Psikotes ({totalCount - interviewCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 dark:text-amber-300 hover:text-amber-900"
              }`}
            >
              Menunggu Nilai ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                activeTab === "completed" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
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
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Interactive Assessment & Evaluation Table (Compact, clean font size & neat columns) */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-slate-700 dark:text-emerald-400" />
              Daftar Kandidat & Jadwal Penilaian ({filtered.length})
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
              Klik ikon mata untuk melihat info detail profil & CV, atau ikon piala untuk input skor evaluasi.
            </p>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-[#061f1d] text-slate-700 dark:text-teal-300 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-teal-800/60 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[30%]">Kandidat</th>
                <th className="px-3 py-3 w-[22%]">Jenis Seleksi</th>
                <th className="px-3 py-3 w-[25%]">Penilai yang Bertugas</th>
                <th className="px-3 py-3 w-[13%] text-center">Nilai (0–100)</th>
                <th className="px-4 py-3 w-[10%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-emerald-900/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-7 h-7 text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada kandidat pada filter ini.</p>
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3.5 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Jadwalkan Kandidat Sekarang</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#061f1d]/60 transition-colors">
                    {/* Candidate Name Only */}
                    <td className="px-4 py-3 truncate">
                      <button
                        type="button"
                        onClick={() => handleOpenCandidateDetail(item)}
                        className="font-bold text-slate-900 dark:text-white hover:text-[#0F766E] dark:hover:text-teal-300 transition-colors text-left text-xs truncate max-w-full block cursor-pointer"
                        title={item.candidate_name}
                      >
                        {item.candidate_name}
                      </button>
                    </td>

                    {/* Selection Type */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md border font-semibold text-[10px] whitespace-nowrap ${getTypeBadgeColor(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Evaluator Name */}
                    <td className="px-3 py-3 truncate">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-teal-200 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-teal-400 shrink-0" />
                        <span className="truncate" title={item.evaluator_name}>{item.evaluator_name}</span>
                      </span>
                    </td>

                    {/* Score (0 vs null) */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {item.score === null ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold text-[10px]">
                          Belum Dinilai
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1 ${
                            item.score >= 75
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600"
                              : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {item.score} / 100
                        </span>
                      )}
                    </td>

                    {/* Action Controls: Icon only */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {(() => {
                        const isInterview = item.type.includes("Interview");
                        const isStaffHr = userRole === "hr" || userRole === "admin";
                        const isStaffPenilai = userRole === "penilai" || userRole === "interviewer";
                        const canEditScore = isStaffHr ? isInterview : isStaffPenilai ? !isInterview : true;

                        return (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCandidateDetail(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-teal-900/60 text-slate-700 dark:text-teal-300 border border-slate-300 dark:border-teal-800/70 transition-colors cursor-pointer"
                              title="Lihat Informasi Detail Profil & Berkas Kandidat"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                            </button>

                            {canEditScore ? (
                              <button
                                type="button"
                                onClick={() => handleOpenGradeModal(item)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                  item.score !== null
                                    ? "bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white border-slate-700"
                                    : "bg-[#0F766E] hover:bg-[#0d6962] text-white border-teal-700"
                                }`}
                                title={item.score !== null ? "Ubah Nilai Evaluasi" : "Beri Nilai Evaluasi"}
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#061f1d] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 inline-flex items-center justify-center cursor-not-allowed"
                                title={
                                  isStaffHr
                                    ? "Nilai tes hanya dapat diinput oleh Tim Penilai resmi."
                                    : "Nilai wawancara HR & User hanya dapat diinput oleh Tim HR."
                                }
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                              </span>
                            )}
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
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
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
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
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
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Pilih Jenis Tahap Seleksi *
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as AssessmentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
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
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 mb-2"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-500 text-slate-900 dark:text-white focus:outline-none text-xs"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-emerald-800 font-bold transition-colors cursor-pointer"
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
      {/* MODAL 3: INPUT NILAI & CATATAN EVALUASI OLEH PENILAI                 */}
      {/* ==================================================================== */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-800 dark:text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Input Nilai & Evaluasi Penilai</h3>
              </div>
              <button
                onClick={() => setEditingAssessment(null)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 space-y-1">
                <p className="text-[10px] text-slate-500">Kandidat Teruji:</p>
                <p className="font-black text-slate-900 dark:text-white text-sm">{editingAssessment.candidate_name}</p>
                <p className="text-slate-600 dark:text-emerald-300 text-xs font-semibold">
                  {editingAssessment.type} • {editingAssessment.job_title}
                </p>
              </div>

              {editingAssessment.type === "Interview User" && (
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-800 dark:text-cyan-300">
                  <p className="font-bold">Penilaian Calon Atasan (User):</p>
                  <p className="mt-0.5">Calon Atasan (User) memberikan evaluasi & nilai offline/lapangan. Tim HR memasukkan nilai tersebut ke sistem.</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Skor Penilaian (Skala 0 – 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="Contoh: 85 (Kosongkan jika belum dinilai)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Sistem secara ketat membedakan <strong>nilai 0</strong> (nol murni) dengan <strong>status belum dinilai</strong>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Nama Penilai / Evaluator
                </label>
                <input
                  type="text"
                  required
                  value={evaluatorInput}
                  onChange={(e) => setEvaluatorInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Catatan Evaluasi & Rekomendasi Kualitatif
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Tuliskan evaluasi kelebihan, kelemahan teknis, dan rekomendasi lanjut/tidaknya kandidat..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAssessment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-emerald-800 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loadingGrade}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {loadingGrade && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Hasil Evaluasi</span>
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
        />
      )}
    </div>
  );
}
