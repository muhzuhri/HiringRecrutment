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
  const hasNik = Boolean(profile?.nik && profile.nik.trim().length === 16);
  const hasKtp = Boolean(profile?.ktp_url);
  const hasEdu = Boolean(profile?.education && profile.education.length > 0);
  const hasExp = Boolean(profile?.experience && profile.experience.length > 0);

  const missingItems: string[] = [];
  if (!profile?.full_name?.trim()) missingItems.push("Nama Lengkap");
  if (!hasNik) missingItems.push("NIK (16 Digit KTP)");
  if (!hasKtp) missingItems.push("Berkas / Foto KTP");
  if (!hasCv) missingItems.push("Berkas CV (PDF)");
  if (!hasEdu) missingItems.push("Riwayat Pendidikan");
  if (!hasExp) missingItems.push("Pengalaman / Organisasi");

  const isProfileComplete = missingItems.length === 0;

  const handleConfirmApply = async () => {
    if (!isProfileComplete) {
      setErrorMsg(`Profil Anda belum 100% lengkap! Wajib melengkapi: ${missingItems.join(", ")}.`);
      return;
    }

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
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-700/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-slate-100 space-y-6 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles className="w-6 h-6 text-amber-400 dark:text-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-emerald-400 uppercase tracking-widest bg-slate-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-slate-200 dark:border-emerald-800">
              Lamar Cepat (1-Click Apply)
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1">
              Konfirmasi Pengajuan Lamaran
            </h2>
          </div>
        </div>

        {/* Target Job Summary */}
        <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-1.5">
          <p className="text-[11px] text-slate-500 dark:text-emerald-300 font-bold uppercase tracking-wider">Posisi Yang Dilamar:</p>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{job.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="font-semibold">{job.dept}</span> • <span>{job.type}</span> • <span>{job.location}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Structured Profile Preview Card */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-slate-600 dark:text-emerald-400" />
            Data Identitas & Berkas Terkirim:
          </p>

          <div className="bg-slate-50 dark:bg-[#061f1d]/80 rounded-xl p-4 border border-slate-200 dark:border-emerald-900/60 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Nama Pelamar:</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile?.full_name || "Kandidat"}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 dark:border-emerald-950 pt-1.5">
              <span className="text-slate-500 dark:text-slate-400">NIK KTP (16 Digit):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {profile?.nik || <span className="text-rose-500">Belum Ada NIK</span>}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 dark:border-emerald-950 pt-1.5">
              <span className="text-slate-500 dark:text-slate-400">Dokumen KTP:</span>
              {hasKtp ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah
                </span>
              ) : (
                <span className="font-bold text-rose-500">Belum Diunggah</span>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 dark:border-emerald-950 pt-1.5">
              <span className="text-slate-500 dark:text-slate-400">Berkas CV (PDF):</span>
              {hasCv ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[180px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {profile?.resume_name || "CV_Terlampir.pdf"}
                </span>
              ) : (
                <span className="font-bold text-rose-500">Belum Ada PDF</span>
              )}
            </div>
          </div>
        </div>

        {!isProfileComplete && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <p className="font-bold flex items-center gap-1">
              ⚠️ Profil Belum Lengkap 100%!
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Anda wajib melengkapi data profil dan mengunggah berkas KTP serta CV terlebih dahulu sebelum dapat mengirimkan lamaran: <strong>{missingItems.join(", ")}</strong>.
            </p>
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              className="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-600 dark:hover:text-emerald-200 mt-1"
            >
              Lengkapi Seluruh Data di Halaman Profil →
            </Link>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#061f1d] dark:hover:bg-emerald-950 border border-slate-300 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmApply}
            disabled={loading || !isProfileComplete}
            className={`flex-1 py-3 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              isProfileComplete
                ? "bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirimkan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isProfileComplete ? "Kirim Lamaran Sekarang" : "Profil Belum 100%"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
