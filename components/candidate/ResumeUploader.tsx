"use client";

import React, { useState } from "react";
import { uploadResumeFile, deleteResumeFile } from "@/app/actions/candidate";
import { FileText, Upload, Trash2, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ResumeUploaderProps {
  currentResumeUrl?: string;
  currentResumeName?: string;
}

export default function ResumeUploader({ currentResumeUrl, currentResumeName }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [resumeUrl, setResumeUrl] = useState(currentResumeUrl || "");
  const [resumeName, setResumeName] = useState(currentResumeName || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setMessage({ type: "error", text: "Hanya dokumen berformat PDF yang diperbolehkan." });
        setFile(null);
        return;
      }
      setFile(selected);
      setMessage(null);
    }
  };

  const handleUpload = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("resumeFile", file);

    const res = await uploadResumeFile(formData);
    setLoading(false);

    if (res.success && res.resumeUrl) {
      setResumeUrl(res.resumeUrl);
      setResumeName(res.resumeName || file.name);
      setFile(null);
      setMessage({ type: "success", text: "Dokumen CV PDF berhasil diunggah dan tersimpan di Supabase Storage!" });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal mengunggah dokumen." });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas CV ini?")) return;

    setLoading(true);
    const res = await deleteResumeFile();
    setLoading(false);

    if (res.success) {
      setResumeUrl("");
      setResumeName("");
      setMessage({ type: "success", text: "Dokumen CV berhasil dihapus." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menghapus berkas CV." });
    }
  };

  return (
    <div className="bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0d9488] dark:text-teal-400" />
            Manajemen Dokumen CV / Resume (PDF)
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-300/70 mt-0.5">
            Dokumen ini akan otomatis dilampirkan saat Anda menekan tombol "Lamar Cepat".
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-700/50">
          Format: PDF (Max 2MB)
        </span>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Existing Uploaded File Manager */}
      {resumeUrl ? (
        <div className="bg-slate-50 dark:bg-[#0B132B] border border-slate-200 dark:border-emerald-700/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-emerald-900/60 border border-slate-200 dark:border-emerald-600/50 flex items-center justify-center text-[#0d9488] dark:text-teal-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {resumeName || "Dokumen_CV_Kandidat.pdf"}
              </p>
              <p className="text-xs text-[#0d9488] dark:text-teal-400 flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> Tersimpan Aktif di Supabase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat CV</span>
            </a>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-emerald-800/80 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/80 dark:bg-[#0B132B]/60 hover:bg-slate-100 dark:hover:bg-[#0B132B] hover:border-[#0d9488] dark:hover:border-emerald-500/60 transition-all cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              id="cv-upload-input"
              className="hidden"
            />
            <label htmlFor="cv-upload-input" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/50 flex items-center justify-center text-[#0d9488] dark:text-teal-300 mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {file ? file.name : "Klik untuk memilih dokumen CV (PDF)"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {file
                  ? `Ukuran berkas: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "Mendukung format PDF dengan ukuran maksimum 2 MB"}
              </p>
            </label>
          </div>

          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-950/30 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah ke Supabase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Simpan Dokumen CV</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
