"use client";

import React from "react";
import { JobApplication, STAGES_CONFIG, CandidateAuditLog } from "@/types/candidate";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Video,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
  CalendarCheck2,
  Building2,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

interface TimelineViewProps {
  application: JobApplication;
  auditLogs?: CandidateAuditLog[];
}

export default function TimelineView({ application, auditLogs = [] }: TimelineViewProps) {
  const isRejected = application.status === "Ditolak" || application.status === "Rejected";

  // Calculate 6-Stage Progressive Index dynamically
  let currentStageIndex = 1;
  const status = application.status;
  const latestAssess = application.assessments?.[0];

  const hasTestScheduled =
    Boolean(latestAssess && ["Technical Test", "Psikotes", "Aptitude Test", "Personality Test"].includes(latestAssess.type)) ||
    Boolean(application.latest_stage_type && ["Technical Test", "Psikotes", "Aptitude Test", "Personality Test"].includes(application.latest_stage_type)) ||
    auditLogs.some(
      (l) =>
        l.stage_detail?.toLowerCase().includes("tes") ||
        l.stage_detail?.toLowerCase().includes("assessment") ||
        l.reason?.toLowerCase().includes("technical test") ||
        l.reason?.toLowerCase().includes("psikotes")
    );

  const hasUserInterview =
    latestAssess?.type === "Interview User" ||
    application.latest_stage_type === "Interview User" ||
    auditLogs.some((l) => l.stage_detail?.toLowerCase().includes("user"));

  if (status === "Diajukan" || status === "Applied") {
    currentStageIndex = 1;
  } else if (status === "Diproses" || status === "In Review") {
    currentStageIndex = hasTestScheduled ? 3 : 2;
  } else if (status === "Interview") {
    currentStageIndex = hasUserInterview ? 5 : 4;
  } else if (status === "Diterima" || status === "Offered" || status === "Hired") {
    currentStageIndex = 6;
  } else if (isRejected) {
    currentStageIndex = application.current_stage_index || 2;
  }

  // Active stage display name
  const getStageTitle = (idx: number) => {
    switch (idx) {
      case 1:
        return "Diajukan";
      case 2:
        return "Screening HR";
      case 3:
        return "Assessment / Tes";
      case 4:
        return "Interview HR";
      case 5:
        return "Interview User";
      case 6:
        return "Diterima (Hired)";
      default:
        return application.status;
    }
  };

  const scheduleDate = application.latest_schedule || application.interview_date;
  const stageType =
    application.latest_stage_type ||
    latestAssess?.type ||
    (currentStageIndex === 3 ? "Technical Test" : currentStageIndex === 4 ? "Interview HR" : currentStageIndex === 5 ? "Interview User" : null);
  const evaluator = application.latest_evaluator || latestAssess?.evaluator_name;

  const formatIDFullDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return (
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return (
        d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-700/50 text-xs font-semibold text-slate-700 dark:text-emerald-300">
                {application.department}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-700/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {application.job_type}
              </span>
              <StatusBadge status={isRejected ? "Ditolak" : getStageTitle(currentStageIndex)} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {application.job_title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-emerald-200/80 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                {application.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-white">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                {application.salary || "Kompensasi Kompetitif"}
              </span>
            </div>
          </div>

          {/* Quick Date Meta Box */}
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/60 p-4 rounded-xl text-xs space-y-1.5 shrink-0 min-w-[210px] shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-emerald-400/80 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Diajukan:
              </span>
              <span className="font-semibold text-slate-800 dark:text-white">
                {new Date(application.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-emerald-900/60 pt-1.5">
              <span className="text-slate-500 dark:text-emerald-400/80 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Posisi Tahap:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                Tahap {currentStageIndex} dari 6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Progress Bar / Milestone Timeline (6 Tahapan Linear) */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-lg space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800/40 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-700 dark:text-emerald-400" />
              Progress Tracking Kronologis
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">
              Melacak alur proses rekrutmen Anda secara real-time dari pendaftaran hingga keputusan akhir.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-emerald-300 bg-slate-100 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emerald-700/50">
            {isRejected ? "Status: Tidak Lolos" : `Tahap ${currentStageIndex} dari 6: ${getStageTitle(currentStageIndex)}`}
          </span>
        </div>

        {/* Desktop Horizontal Milestone Bar across 6 linear stages */}
        <div className="hidden lg:grid grid-cols-6 gap-3 relative my-8">
          {/* Connecting Line Background */}
          <div className="absolute top-6 left-[8%] right-[8%] h-1 bg-slate-200 dark:bg-slate-800 z-0 rounded-full" />
          {/* Active Connecting Line Progress */}
          <div
            className="absolute top-6 left-[8%] h-1 bg-slate-900 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-400 z-0 rounded-full transition-all duration-500"
            style={{
              width: isRejected
                ? "0%"
                : `${Math.min(100, Math.max(0, ((currentStageIndex - 1) / 5) * 84))}%`,
            }}
          />

          {STAGES_CONFIG.map((stage) => {
            const isCompleted = !isRejected && stage.stageIndex < currentStageIndex;
            const isCurrent = !isRejected && stage.stageIndex === currentStageIndex;
            const isFuture = isRejected || stage.stageIndex > currentStageIndex;

            return (
              <div key={stage.stageIndex} className="relative z-10 flex flex-col items-center text-center">
                {/* Node Icon Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-900/30 ring-4 ring-emerald-100 dark:ring-emerald-950"
                      : isCurrent
                      ? "bg-slate-900 dark:bg-gradient-to-tr dark:from-emerald-400 dark:to-teal-300 text-white dark:text-slate-950 ring-4 ring-slate-300 dark:ring-emerald-500/40"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 ring-4 ring-white dark:ring-slate-900"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isCurrent ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-950 animate-ping" />
                  ) : (
                    <span>{stage.stageIndex}</span>
                  )}
                </div>

                {/* Stage Titles & Description */}
                <div className="mt-4 space-y-1">
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700/50"
                        : isCurrent
                        ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/80 dark:text-purple-200 dark:border-purple-500/50"
                        : "bg-slate-50 text-slate-400 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400"
                    }`}
                  >
                    {isCompleted ? "Selesai ✓" : isCurrent ? "Tahap Aktif ⚡" : "Masa Depan"}
                  </span>
                  <p className={`text-xs sm:text-sm font-bold ${isCurrent ? "text-slate-900 dark:text-white" : isCompleted ? "text-emerald-700 dark:text-emerald-200" : "text-slate-400"}`}>
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-[170px]">
                    {stage.subtitle}
                  </p>

                  {/* Scheduled Date Pill attached right to active stage */}
                  {isCurrent && scheduleDate && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold border border-purple-300 dark:border-purple-800 shadow-xs">
                        <CalendarCheck2 className="w-3 h-3" />
                        <span>{formatShortDate(scheduleDate)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Milestone Timeline */}
        <div className="lg:hidden space-y-5 relative pl-6 border-l-2 border-slate-200 dark:border-emerald-800/60 ml-2">
          {STAGES_CONFIG.map((stage) => {
            const isCompleted = !isRejected && stage.stageIndex < currentStageIndex;
            const isCurrent = !isRejected && stage.stageIndex === currentStageIndex;

            return (
              <div key={stage.stageIndex} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-[31px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-slate-900 dark:bg-teal-400 text-white dark:text-slate-950 ring-4 ring-slate-200 dark:ring-teal-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {isCompleted ? "✓" : stage.stageIndex}
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-slate-50 dark:bg-[#061f1d] border-slate-300 dark:border-teal-500/60 shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50/50 dark:bg-[#0c2b29]/80 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-slate-50/50 dark:bg-[#061f1d]/40 border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-bold ${isCurrent ? "text-slate-900 dark:text-white" : isCompleted ? "text-emerald-700 dark:text-emerald-200" : "text-slate-400"}`}>
                      {stage.title}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isCompleted ? "Selesai" : isCurrent ? "Aktif" : "Menunggu"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{stage.description}</p>
                  {isCurrent && scheduleDate && (
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mt-2 flex items-center gap-1.5">
                      <CalendarCheck2 className="w-3.5 h-3.5" />
                      Jadwal: {formatIDFullDate(scheduleDate)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PROMINENT SECTION: Jadwal & Detail Seleksi Terjadwal */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-300">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Jadwal Seleksi & Ujian Terjadwal
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-200/70">
              Informasi lengkap tanggal, waktu pelaksanaan, jenis asesmen, dan penilai resmi Anda.
            </p>
          </div>
        </div>

        {scheduleDate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Tanggal & Waktu */}
            <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-emerald-400 tracking-wider">
                Tanggal & Waktu Pelaksanaan
              </span>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{formatIDFullDate(scheduleDate)}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Harap bersiap 10-15 menit sebelum waktu pelaksanaan yang dijadwalkan.
              </p>
            </div>

            {/* Box 2: Jenis Asesmen & Penilai */}
            <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-emerald-400 tracking-wider">
                Jenis Asesmen & Tim Penilai
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold">
                  {stageType || "Assessment / Tes"}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
                  Status: Terjadwal
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 pt-1">
                <UserCheck className="w-4 h-4 text-slate-500 dark:text-emerald-400 shrink-0" />
                <span>Penilai: {evaluator || "Dr. Bambang / Tim Penilai & Interviewer"}</span>
              </p>
            </div>

            {/* Video Interview Link if provided */}
            {application.interview_link && (
              <div className="md:col-span-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                      Tautan Pertemuan Video Sesi Interview
                    </p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-300">
                      Klik tombol untuk langsung bergabung ke Google Meet pada waktu yang ditentukan.
                    </p>
                  </div>
                </div>
                <a
                  href={application.interview_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm shrink-0"
                >
                  <span>Buka Google Meet</span>
                  <Video className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-900/60 rounded-xl p-6 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 dark:text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              Jadwal Seleksi Sedang Dipersiapkan
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tim HR dan Penilai sedang meninjau kualifikasi berkas Anda. Jadwal resmi tes/interview akan diperbarui secara otomatis di halaman ini.
            </p>
          </div>
        )}
      </div>

      {/* 4. Special Box for HR Notes & Interview Instructions */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c2b29] dark:to-[#0a2322] border border-slate-200 dark:border-emerald-700/50 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-teal-900/80 border border-slate-200 dark:border-teal-600/50 flex items-center justify-center text-slate-700 dark:text-teal-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Catatan & Instruksi Khusus Rekruiter (HR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-200/70">
              Pesan dan arahan resmi dari tim rekrutmen mengenai kelanjutan proses Anda.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#061f1d] rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-emerald-800/40">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {application.hr_notes || "Belum ada catatan khusus dari HR. Silakan periksa halaman ini secara berkala."}
          </p>
        </div>
      </div>
    </div>
  );
}
