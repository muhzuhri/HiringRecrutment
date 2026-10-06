"use client";

import React, { useState } from "react";
import { CandidateDetailedReview } from "@/types/admin";
import { addInternalHRNote, updateApplicantStatus } from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import { FileText, User, GraduationCap, Briefcase, Award, MessageSquare, History, ExternalLink, CheckCircle2, Send, Loader2, Calendar, Video, Clock } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/candidate/StatusBadge";

interface CandidateScreeningViewProps {
  detail: CandidateDetailedReview;
}

export default function CandidateScreeningView({ detail }: CandidateScreeningViewProps) {
  const { application, profile, internal_notes, audit_logs } = detail;
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "notes" | "audit">("profile");

  // HR Note Form
  const [newNoteText, setNewNoteText] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);

  // Add Note Handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setLoadingNote(true);
    const res = await addInternalHRNote(application.id, newNoteText);
    setLoadingNote(false);

    if (res.success) {
      setNewNoteText("");
    } else {
      alert(res.error || "Gagal menambahkan catatan.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Candidate Header Card */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900 border border-emerald-600/50 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge status={application.status} size="sm" />
                {application.auto_tags.map((tag) => (
                  <AutoTagBadge key={tag} tag={tag} />
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.full_name}
              </h1>

              <p className="text-emerald-200/80 text-xs sm:text-sm mt-0.5">
                Melamar posisi <strong>{application.job_title}</strong> ({application.department})
              </p>
            </div>
          </div>

          {/* Quick Contact & Info */}
          <div className="bg-[#061f1d] p-4 rounded-xl border border-emerald-800/40 text-xs text-slate-300 space-y-1.5 min-w-[220px]">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>WhatsApp:</strong> {profile.whatsapp || profile.phone || "-"}</p>
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Profile LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-800/40 pb-2 overflow-x-auto">
        {[
          { id: "profile", label: "Data Terstruktur & Pengalaman", icon: User },
          { id: "cv", label: "Pratinjau Dokumen CV (PDF)", icon: FileText },
          { id: "notes", label: `Catatan Rahasia HR (${internal_notes.length})`, icon: MessageSquare },
          { id: "audit", label: `Log Audit Status (${audit_logs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "bg-[#0c2b29] text-slate-300 hover:text-white border border-emerald-900/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Area */}

      {/* Tab 1: Data Terstruktur & Pengalaman */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Bio & Headline */}
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Ringkasan Kualifikasi Diri
            </h3>
            <p className="text-xs text-emerald-300 font-semibold">{profile.headline}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Pendidikan */}
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Riwayat Pendidikan Terstruktur
            </h3>
            <div className="space-y-3">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="bg-[#061f1d] p-4 rounded-xl border border-emerald-800/40 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-300">
                    <span>{edu.level} - {edu.school}</span>
                    <span className="text-slate-400">Lulus {edu.endYear}</span>
                  </div>
                  <p className="text-xs text-white">Jurusan / Program Studi: {edu.major}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keahlian & Skill */}
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Daftar Keahlian & Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#061f1d] text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Pengalaman Kerja */}
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Riwayat Pengalaman Kerja
            </h3>
            <div className="space-y-3">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="bg-[#061f1d] p-4 rounded-xl border border-emerald-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{exp.position}</span>
                    <span className="text-xs text-emerald-300 font-semibold">{exp.period}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{exp.company}</p>
                  <p className="text-xs text-slate-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pratinjau Dokumen CV (PDF Viewer) */}
      {activeTab === "cv" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Pratinjau Dokumen CV PDF (Supabase Storage)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                File berkas CV resmi kandidat: {profile.resume_name || "Dokumen_CV_Kandidat.pdf"}
              </p>
            </div>

            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Unduh / Buka di Tab Baru</span>
              </a>
            )}
          </div>

          {profile.resume_url ? (
            <div className="w-full h-[650px] rounded-xl overflow-hidden border border-emerald-800 bg-slate-900">
              <iframe
                src={profile.resume_url}
                className="w-full h-full border-none"
                title="CV PDF Viewer"
              />
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white">Dokumen CV PDF belum diunggah kandidat.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Catatan Rahasia HR (Internal Discussion Notes) */}
      {activeTab === "notes" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-emerald-800/40 pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Ruang Diskusi Rahasia HR (Internal Notes)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Catatan ini khusus dapat dibaca oleh tim Admin / Recruiter HR dan disembunyikan dari kandidat.
            </p>
          </div>

          {/* Form Tambah Catatan */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Tuliskan evaluasi internal, rekomendasi gaji, atau instruksi wawancara untuk sesama HR..."
            />
            <button
              type="submit"
              disabled={loadingNote}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-950/50"
            >
              {loadingNote ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Kirim Catatan HR</span>
            </button>
          </form>

          {/* Daftar Catatan Internal */}
          <div className="space-y-3 pt-2">
            {internal_notes.map((note) => (
              <div key={note.id} className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300">{note.author_name}</span>
                  <span className="text-slate-400">
                    {new Date(note.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{note.note_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Log Audit Status (Audit Trail) */}
      {activeTab === "audit" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-emerald-800/40 pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Log Audit & Riwayat Perubahan Status Rekrutmen
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Jejak riwayat kronologis otomatis atas setiap pergeseran status kandidat di database Supabase.
            </p>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-emerald-800/60 ml-2">
            {audit_logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-950" />
                <div className="bg-[#061f1d] border border-emerald-800/40 rounded-xl p-4 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">
                      Status Diubah ke "{log.new_status}"
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300 font-medium">Oleh: {log.changed_by_name}</p>
                  {log.reason && <p className="text-xs text-slate-300 mt-1">Alasan: {log.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
