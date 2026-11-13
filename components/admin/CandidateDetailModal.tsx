"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  FileText,
  ExternalLink,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

export interface CandidateDetailData {
  id: string; // application id
  candidate_id?: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_whatsapp?: string;
  candidate_address?: string;
  candidate_nik?: string;
  candidate_ktp_url?: string;
  candidate_ktp_name?: string;
  candidate_avatar_url?: string;
  candidate_headline?: string;
  candidate_bio?: string;
  job_title: string;
  department: string;
  job_type?: string;
  education?: Array<{
    level: string;
    school: string;
    major: string;
    gpa?: string;
    endYear?: string;
  }>;
  experience?: Array<{
    position: string;
    company: string;
    period: string;
    description?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    title: string;
    organization?: string;
    issueYear?: string;
  }>;
  resume_url?: string;
  resume_name?: string;
  test_score?: number | null;
  test_evaluator?: string | null;
  hr_interview_score?: number | null;
  hr_interview_evaluator?: string | null;
  user_interview_score?: number | null;
  user_interview_evaluator?: string | null;
}

interface CandidateDetailModalProps {
  data: CandidateDetailData | null;
  onClose: () => void;
}

export default function CandidateDetailModal({ data, onClose }: CandidateDetailModalProps) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/90 dark:border-teal-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 text-slate-800 dark:text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-teal-800/60 pb-4">
          <div className="flex items-center gap-3.5">
            {data.candidate_avatar_url ? (
              <img
                src={data.candidate_avatar_url}
                alt={data.candidate_name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-teal-700 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-black text-xl shadow-2xs shrink-0">
                {data.candidate_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  {data.candidate_name}
                </h3>
                {data.candidate_nik && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#0F766E] dark:text-teal-400" />
                    <span>NIK: {data.candidate_nik}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-teal-200 font-semibold mt-0.5">
                Melamar: {data.job_title} ({data.department})
              </p>
              {data.candidate_headline && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                  "{data.candidate_headline}"
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-teal-950 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs">
          {/* 1. Kontak & Dokumen Identitas (KTP) */}
          <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              Kontak & Dokumen Identitas (KTP)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{data.candidate_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{data.candidate_whatsapp || data.candidate_phone || "-"}</span>
              </div>
              {data.candidate_address && (
                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{data.candidate_address}</span>
                </div>
              )}
            </div>

            {/* KTP Attachment preview link */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-teal-900/40 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                Berkas KTP: {data.candidate_ktp_name || (data.candidate_ktp_url ? "KTP Terlampir" : "Belum diunggah")}
              </span>
              {data.candidate_ktp_url ? (
                <a
                  href={data.candidate_ktp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold hover:underline"
                >
                  <span>Lihat KTP</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 italic">-</span>
              )}
            </div>
          </div>

          {/* 2. Ringkasan Bio / Tentang Saya */}
          {data.candidate_bio && (
            <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Tentang Pelamar
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                {data.candidate_bio}
              </p>
            </div>
          )}

          {/* 3. Pendidikan & Pengalaman */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pendidikan */}
            <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                Pendidikan Terstruktur
              </h4>
              {data.education && data.education.length > 0 ? (
                <div className="space-y-1.5">
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="border-b border-slate-200/60 dark:border-teal-900/40 pb-1.5 last:border-0 last:pb-0">
                      <p className="font-bold text-slate-800 dark:text-white text-xs">
                        {edu.level} • {edu.school}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {edu.major} {edu.gpa ? `(IPK: ${edu.gpa})` : ""} {edu.endYear ? `• Lulus ${edu.endYear}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Data pendidikan tidak tersedia</p>
              )}
            </div>

            {/* Pengalaman */}
            <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                Pengalaman Kerja
              </h4>
              {data.experience && data.experience.length > 0 ? (
                <div className="space-y-1.5">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="border-b border-slate-200/60 dark:border-teal-900/40 pb-1.5 last:border-0 last:pb-0">
                      <p className="font-bold text-slate-800 dark:text-white text-xs">
                        {exp.position} • {exp.company}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{exp.period}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Belum ada pengalaman terdaftar</p>
              )}
            </div>
          </div>

          {/* 4. Keahlian & Keterampilan */}
          <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              Keahlian & Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.skills && data.skills.length > 0 ? (
                data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#0c2b29] text-slate-700 dark:text-teal-200 border border-slate-200 dark:border-teal-800/60 font-semibold text-[10px]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">Tidak ada keahlian dicatat</span>
              )}
            </div>
          </div>

          {/* 5. Riwayat Nilai & Evaluasi Seleksi */}
          <div className="bg-slate-50 dark:bg-[#061f1d] p-3.5 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              Rekapitulasi Nilai Seleksi
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/60">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">1. Asesmen/Tes</p>
                <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
                  {data.test_score !== null && data.test_score !== undefined ? `${data.test_score}/100` : "-"}
                </p>
                <p className="text-[9px] text-slate-400 truncate">{data.test_evaluator || "Penilai"}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/60">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">2. Interview HR</p>
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {data.hr_interview_score !== null && data.hr_interview_score !== undefined ? `${data.hr_interview_score}/100` : "-"}
                </p>
                <p className="text-[9px] text-slate-400 truncate">{data.hr_interview_evaluator || "HR"}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/60">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">3. Interview User</p>
                <p className="text-base font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {data.user_interview_score !== null && data.user_interview_score !== undefined ? `${data.user_interview_score}/100` : "-"}
                </p>
                <p className="text-[9px] text-slate-400 truncate">{data.user_interview_evaluator || "User"}</p>
              </div>
            </div>
          </div>

          {/* 6. Dokumen CV PDF */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0c2b29] border border-slate-200/90 dark:border-teal-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                  {data.resume_name || "Berkas CV PDF Resmi"}
                </p>
                <p className="text-[10px] text-slate-400">Curriculum Vitae pelamar</p>
              </div>
            </div>

            {data.resume_url ? (
              <a
                href={data.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-xs transition-colors shadow-2xs shrink-0"
              >
                <span>Buka PDF CV</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Belum ada CV terunggah</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-teal-800/60 flex items-center justify-between gap-3">
          <Link
            href={`/admin/candidates/${data.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline dark:text-teal-300"
          >
            <span>Buka Halaman Screening & Catatan HR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-teal-950 dark:hover:bg-teal-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

