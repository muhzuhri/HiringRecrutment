"use client";

import React, { useState } from "react";
import { CandidateProfile } from "@/types/candidate";
import { Job } from "@/data/jobs";
import { applyForJob } from "@/app/actions/candidate";
import { CheckCircle2, AlertCircle, FileText, Send, X, Loader2, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";

interface QuickApplyModalProps {
  job: Job | null;
  profile: CandidateProfile | null;
  onClose: () => void;
  onSuccess: (jobId: string, message: string) => void;
}

export default function QuickApplyModal({ job, profile, onClose, onSuccess }: QuickApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!job) return null;

  const hasCv = Boolean(profile?.resume_url);
  const hasWhatsapp = Boolean(profile?.whatsapp || profile?.phone);

  const handleConfirmApply = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await applyForJob(job.id);
    setLoading(false);

    if (res.success) {
      onSuccess(job.id, res.message || "Lamaran berhasil dikirim!");
      onClose();
    } else {
      setErrorMsg(res.error || "Gagal mengirimkan lamaran.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[#0c2b29] border border-emerald-700/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Feature Lamar Cepat
            </span>
            <h2 className="text-xl font-extrabold text-white leading-tight mt-1">
              Konfirmasi Lamaran Cepat
            </h2>
          </div>
        </div>

        {/* Target Job Summary */}
        <div className="bg-[#061f1d] border border-emerald-800/60 rounded-xl p-4 space-y-2">
          <p className="text-xs text-emerald-300 font-semibold uppercase">Posisi Yang Dilamar:</p>
          <h3 className="text-lg font-extrabold text-white">{job.title}</h3>
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <span>{job.dept}</span> • <span>{job.type}</span> • <span>{job.location}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Structured Profile Preview Card */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Data Terstruktur Yang Akan Terkirim:
          </p>

          <div className="bg-[#061f1d]/80 rounded-xl p-4 border border-emerald-900/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Pelamar:</span>
              <span className="font-bold text-white">{profile?.full_name || "Kandidat"}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-950 pt-1.5">
              <span className="text-slate-400">Email:</span>
              <span className="font-medium text-slate-200">{profile?.email}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-950 pt-1.5">
              <span className="text-slate-400">No. WhatsApp:</span>
              <span className="font-medium text-slate-200">{profile?.whatsapp || profile?.phone || "-"}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-950 pt-1.5">
              <span className="text-slate-400">LinkedIn / Portofolio:</span>
              <span className="font-medium text-emerald-300 truncate max-w-[200px]">
                {profile?.linkedin_url || "Tersedia"}
              </span>
            </div>
            <div className="flex justify-between border-t border-emerald-950 pt-1.5 items-center">
              <span className="text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Dokumen CV PDF:
              </span>
              {hasCv ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {profile?.resume_name || "CV_Terlampir.pdf"}
                </span>
              ) : (
                <span className="font-bold text-amber-400">Belum Ada PDF</span>
              )}
            </div>
          </div>
        </div>

        {!hasCv && (
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-xl text-amber-200 text-xs space-y-1.5">
            <p className="font-bold flex items-center gap-1">
              ⚠️ Dokumen CV belum diunggah!
            </p>
            <p className="text-[11px] text-amber-300/80">
              Sangat disarankan mengunggah dokumen CV terlebih dahulu agar peluang seleksi berkas lebih tinggi.
            </p>
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              className="inline-block text-xs font-bold text-emerald-300 underline hover:text-emerald-200 mt-1"
            >
              Lengkapi CV di Halaman Profil →
            </Link>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#061f1d] hover:bg-emerald-950 border border-emerald-800/60 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmApply}
            disabled={loading}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirimkan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Lamaran Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
