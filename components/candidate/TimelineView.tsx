import React from "react";
import { JobApplication, STAGES_CONFIG } from "@/types/candidate";
import { CheckCircle2, Circle, Clock, Calendar, Video, FileText, AlertCircle, Sparkles } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface TimelineViewProps {
  application: JobApplication;
}

export default function TimelineView({ application }: TimelineViewProps) {
  const currentStageIndex = application.current_stage_index || 1;
  const isRejected = application.status === "Rejected";

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
                {application.department}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs font-semibold text-slate-300">
                {application.job_type}
              </span>
              <StatusBadge status={application.status} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {application.job_title}
            </h1>

            <p className="text-emerald-200/80 text-sm mt-1 flex items-center gap-2">
              <span>TalentHub Tech</span> • <span>{application.location}</span>
            </p>
          </div>

          <div className="bg-[#061f1d] p-4 rounded-xl border border-emerald-800/40 text-xs text-slate-300 space-y-1.5 min-w-[220px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-emerald-400/80 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal Melamar:
              </span>
              <span className="font-semibold text-white">
                {new Date(application.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-emerald-900/60 pt-1.5">
              <span className="text-emerald-400/80 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Update Terakhir:
              </span>
              <span className="font-semibold text-white">
                {new Date(application.updated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Progress Bar / Milestone Timeline */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Progress Tracking Kronologis
            </h2>
            <p className="text-xs text-emerald-200/70 mt-0.5">
              Melacak alur proses rekrutmen Anda secara real-time dari pendaftaran hingga keputusan akhir.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-700/50">
            Tahap {currentStageIndex} dari 4
          </span>
        </div>

        {/* Desktop Horizontal Milestone Bar */}
        <div className="hidden lg:grid grid-cols-4 gap-4 relative my-8">
          {/* Connecting Line Background */}
          <div className="absolute top-6 left-[12%] right-[12%] h-1 bg-slate-800 z-0 rounded-full" />
          {/* Active Connecting Line Progress */}
          <div
            className="absolute top-6 left-[12%] h-1 bg-gradient-to-r from-emerald-500 to-teal-400 z-0 rounded-full transition-all duration-500"
            style={{
              width: isRejected
                ? "0%"
                : `${Math.min(100, Math.max(0, ((currentStageIndex - 1) / 3) * 76))}%`,
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-lg ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-emerald-900/50 ring-4 ring-emerald-950"
                      : isCurrent
                      ? "bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 ring-4 ring-emerald-500/40 animate-pulse"
                      : "bg-slate-800 text-slate-500 border border-slate-700 ring-4 ring-slate-900"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isCurrent ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-950 animate-ping" />
                  ) : (
                    <span>{stage.stageIndex}</span>
                  )}
                </div>

                {/* Stage Titles & Description */}
                <div className="mt-4 space-y-1">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                        : isCurrent
                        ? "bg-teal-900/80 text-teal-200 border border-teal-500/50"
                        : "bg-slate-800/60 text-slate-400"
                    }`}
                  >
                    {isCompleted ? "Selesai ✓" : isCurrent ? "Tahap Aktif ⚡" : "Masa Depan"}
                  </span>
                  <p className={`text-sm font-bold ${isCurrent ? "text-white text-base" : isCompleted ? "text-emerald-200" : "text-slate-400"}`}>
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight max-w-[180px]">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Milestone Timeline */}
        <div className="lg:hidden space-y-6 relative pl-6 border-l-2 border-emerald-800/60 ml-2">
          {STAGES_CONFIG.map((stage) => {
            const isCompleted = !isRejected && stage.stageIndex < currentStageIndex;
            const isCurrent = !isRejected && stage.stageIndex === currentStageIndex;

            return (
              <div key={stage.stageIndex} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-[31px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-teal-400 text-slate-950 ring-4 ring-teal-500/30"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isCompleted ? "✓" : stage.stageIndex}
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-[#061f1d] border-teal-500/60 shadow-lg shadow-teal-950/40"
                      : isCompleted
                      ? "bg-[#0c2b29]/80 border-emerald-800/40"
                      : "bg-[#061f1d]/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-bold ${isCurrent ? "text-white" : isCompleted ? "text-emerald-200" : "text-slate-400"}`}>
                      {stage.title}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {isCompleted ? "Selesai" : isCurrent ? "Aktif" : "Menunggu"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Special Box for HR Notes & Interview Instructions */}
      <div className="bg-gradient-to-br from-[#0c2b29] to-[#0a2322] border border-emerald-700/50 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-900/80 border border-teal-600/50 flex items-center justify-center text-teal-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Catatan & Instruksi Khusus Rekruiter (HR)</h3>
            <p className="text-xs text-emerald-200/70">Pesan resmi dari tim talent acquisition mengenai kelanjutan proses Anda.</p>
          </div>
        </div>

        <div className="bg-[#061f1d] rounded-xl p-5 border border-emerald-800/40 space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
            {application.hr_notes || "Belum ada catatan khusus dari HR. Silakan periksa halaman ini secara berkala."}
          </p>

          {/* Conditional Interview Schedule Details */}
          {application.interview_date && (
            <div className="pt-4 border-t border-emerald-900/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-emerald-950/60 p-3.5 rounded-lg border border-emerald-800/40">
                <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase">Jadwal Sesi Interview</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {new Date(application.interview_date).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </p>
                </div>
              </div>

              {application.interview_link && (
                <div className="flex items-start gap-3 bg-teal-950/60 p-3.5 rounded-lg border border-teal-800/40">
                  <Video className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-teal-300 uppercase">Tautan Pertemuan Video</p>
                    <a
                      href={application.interview_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md transition-colors"
                    >
                      <span>Buka Google Meet</span>
                      <Video className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
