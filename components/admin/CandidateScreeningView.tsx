"use client";

import React, { useState } from "react";
import { CandidateDetailedReview } from "@/types/admin";
import { AssessmentType } from "@/types/candidate";
import {
  addInternalHRNote,
  updateApplicantStatus,
  toggleCandidateQualification,
  scheduleAssessmentOrInterview,
  submitAssessmentEvaluation,
} from "@/app/actions/admin";
import AutoTagBadge from "./AutoTagBadge";
import {
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  MessageSquare,
  History,
  ExternalLink,
  CheckCircle2,
  Send,
  Loader2,
  Calendar,
  ClipboardList,
  Plus,
  X,
  Star,
  Check,
  ShieldAlert,
} from "lucide-react";

interface CandidateScreeningViewProps {
  detail: CandidateDetailedReview;
}

export default function CandidateScreeningView({ detail }: CandidateScreeningViewProps) {
  const { application, profile, assessments, internal_notes, audit_logs } = detail;
  const [activeTab, setActiveTab] = useState<"profile" | "cv" | "assessments" | "notes" | "audit">("profile");

  // State for qualification
  const [isQualified, setIsQualified] = useState(application.is_qualified ?? false);
  const [loadingQual, setLoadingQual] = useState(false);

  // HR Internal Note Form State
  const [newNoteText, setNewNoteText] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);

  // Schedule Assessment Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("Psikotes");
  const [scheduledAt, setScheduledAt] = useState("2026-10-15T09:00");
  const [evaluatorName, setEvaluatorName] = useState("Team Leader HR");
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Grading Modal State
  const [gradingAssessmentId, setGradingAssessmentId] = useState<string | null>(null);
  const [gradeScoreInput, setGradeScoreInput] = useState<string>(""); // string to distinguish empty vs 0
  const [gradeNotes, setGradeNotes] = useState("");
  const [loadingGrade, setLoadingGrade] = useState(false);

  // Toggle Qualified Candidate
  const handleToggleQualification = async () => {
    setLoadingQual(true);
    const newStatus = !isQualified;
    const res = await toggleCandidateQualification(application.id, newStatus);
    setLoadingQual(false);
    if (res.success) {
      setIsQualified(newStatus);
    } else {
      alert(res.error || "Gagal mengubah status kualifikasi.");
    }
  };

  // Status Change Handler
  const handleStatusChange = async (targetStatus: any) => {
    const res = await updateApplicantStatus(
      application.id,
      targetStatus,
      `Perubahan status menjadi ${targetStatus} oleh HR Admin`,
      `Tahap Seleksi: ${targetStatus}`
    );
    if (!res.success) {
      alert(res.error || "Gagal memperbarui status.");
    }
  };

  // Submit Internal HR Note
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

  // Schedule Assessment/Interview
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSchedule(true);
    const res = await scheduleAssessmentOrInterview({
      application_id: application.id,
      type: assessmentType,
      scheduled_at: new Date(scheduledAt).toISOString(),
      evaluator_name: evaluatorName,
    });
    setLoadingSchedule(false);

    if (res.success) {
      setShowScheduleModal(false);
    } else {
      alert(res.error || "Gagal menjadwalkan tes.");
    }
  };

  // Submit Grade Evaluation Score (0-100 scale, distinguishing 0 vs null)
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssessmentId) return;

    // Convert input: empty string = null (unscored), otherwise numeric score
    let numericScore: number | null = null;
    if (gradeScoreInput.trim() !== "") {
      const parsed = parseFloat(gradeScoreInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("Nilai evaluasi harus berupa angka antara 0 hingga 100.");
        return;
      }
      numericScore = parsed;
    }

    setLoadingGrade(true);
    const res = await submitAssessmentEvaluation({
      assessment_id: gradingAssessmentId,
      application_id: application.id,
      score: numericScore,
      notes: gradeNotes,
      evaluator_name: evaluatorName,
    });
    setLoadingGrade(false);

    if (res.success) {
      setGradingAssessmentId(null);
      setGradeScoreInput("");
      setGradeNotes("");
    } else {
      alert(res.error || "Gagal menyimpan hasil penilaian.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Candidate Header Banner */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900 border border-emerald-600/50 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  Status: {application.status}
                </span>
                {isQualified && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Qualified Candidate
                  </span>
                )}
                {application.auto_tags.map((tag) => (
                  <AutoTagBadge key={tag} tag={tag} />
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.full_name}
              </h1>

              <p className="text-emerald-200/80 text-xs sm:text-sm">
                Melamar posisi <strong>{application.job_title}</strong> ({application.department} - {application.job_type})
              </p>
            </div>
          </div>

          {/* HR Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleToggleQualification}
              disabled={loadingQual}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isQualified
                  ? "bg-amber-950 border border-amber-700 text-amber-300 hover:bg-amber-900"
                  : "bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900"
              }`}
            >
              {loadingQual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              <span>{isQualified ? "Tandai Belum Qualified" : "Tandai Qualified Candidate"}</span>
            </button>

            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="Diajukan">Ubah Status: Diajukan</option>
              <option value="Diproses">Ubah Status: Diproses (Screening)</option>
              <option value="Interview">Ubah Status: Interview & Assessment</option>
              <option value="Diterima">Ubah Status: Diterima (Hired)</option>
              <option value="Ditolak">Ubah Status: Ditolak (Rejected)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-800/40 pb-2 overflow-x-auto">
        {[
          { id: "profile", label: "Profil & Kualifikasi", icon: User },
          { id: "cv", label: "Dokumen CV (PDF)", icon: FileText },
          { id: "assessments", label: `Tes & Interview (${assessments.length})`, icon: ClipboardList },
          { id: "notes", label: `Catatan Internal HR (${internal_notes.length})`, icon: MessageSquare },
          { id: "audit", label: `Audit Trail (${audit_logs.length})`, icon: History },
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

      {/* 3. Tab Contents */}

      {/* Tab 1: Profile & Skills */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Ringkasan Kualifikasi Diri
            </h3>
            <p className="text-xs text-emerald-300 font-semibold">{profile.headline}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>

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
        </div>
      )}

      {/* Tab 2: Document CV Viewer */}
      {activeTab === "cv" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Pratinjau Dokumen CV PDF (Maksimal 2 MB)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                File dokumen CV kandidat: {profile.resume_name || "CV_Kandidat.pdf"}
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
                <span>Unduh / Buka Dokumen</span>
              </a>
            )}
          </div>

          {profile.resume_url ? (
            <div className="w-full h-[650px] rounded-xl overflow-hidden border border-emerald-800 bg-slate-900">
              <iframe src={profile.resume_url} className="w-full h-full border-none" title="CV PDF Viewer" />
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white">Dokumen CV PDF belum diunggah kandidat.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: CASE 2 Assessment & Interview Management */}
      {activeTab === "assessments" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-400" />
                Manajemen Penilaian Asesmen & Wawancara (CASE 2)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Jadwalkan tes psikotes/teknis/user, input nilai evaluasi (skala 0-100), dan bedakan nilai 0 dengan belum dinilai (null).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Tes / Interview</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Pembatasan Akses:</strong> Penilai hanya dapat memasukkan & memperbarui evaluasi kandidat yang ditugaskan kepadanya. Sistem secara ketat membedakan antara nilai 0 dengan status belum dinilai.
            </span>
          </div>

          {/* Assessment List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#061f1d] text-emerald-300 uppercase font-bold text-[11px] border-b border-emerald-800">
                <tr>
                  <th className="p-3">Jenis Tes / Wawancara</th>
                  <th className="p-3">Jadwal Pelaksanaan</th>
                  <th className="p-3">Penilai / Interviewer</th>
                  <th className="p-3">Nilai (Skala 0-100)</th>
                  <th className="p-3">Catatan Evaluasi</th>
                  <th className="p-3 text-right">Aksi HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada sesi tes atau interview yang dijadwalkan.
                    </td>
                  </tr>
                ) : (
                  assessments.map((asm) => (
                    <tr key={asm.id} className="hover:bg-[#061f1d]/60">
                      <td className="p-3 font-bold text-white">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                          {asm.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {new Date(asm.scheduled_at).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 font-semibold text-emerald-200">
                        {asm.evaluator_name}
                      </td>
                      <td className="p-3">
                        {asm.score === null ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                            Belum Dinilai
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded font-extrabold text-xs ${asm.score >= 75 ? "bg-emerald-950 text-emerald-300 border border-emerald-600" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                            Skor: {asm.score} / 100
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-[220px] truncate text-slate-300">
                        {asm.notes || "-"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setGradingAssessmentId(asm.id);
                            setGradeScoreInput(asm.score !== null ? String(asm.score) : "");
                            setGradeNotes(asm.notes || "");
                            setEvaluatorName(asm.evaluator_name);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold text-xs"
                        >
                          Input Nilai / Catatan
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: CASE 3 HR Internal Confidential Notes */}
      {activeTab === "notes" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-emerald-800/40 pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Catatan Diskusi Rahasia HR (Disembunyikan dari Kandidat)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Catatan ini khusus internal HR. Kandidat yang login TIDAK BISA melihat rincian catatan ini.
            </p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Tuliskan rekomendasi gaji, hasil diskusi interviu, atau instruksi internal..."
            />
            <button
              type="submit"
              disabled={loadingNote}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-950/50"
            >
              {loadingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Simpan Catatan HR</span>
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {internal_notes.map((note) => (
              <div key={note.id} className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300">{note.author_name}</span>
                  <span className="text-slate-400">{new Date(note.created_at).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{note.note_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: CASE 3 Audit Trail History */}
      {activeTab === "audit" && (
        <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 space-y-6">
          <div className="border-b border-emerald-800/40 pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Log Audit Trail Perubahan Status Rekrutmen
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Menyimpan status lama, status baru, tahap detail, waktu perubahan, dan pelaku perubahan (admin).
            </p>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-emerald-800/60 ml-2">
            {audit_logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-950" />
                <div className="bg-[#061f1d] border border-emerald-800/40 rounded-xl p-4 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">
                      {log.old_status} → <span className="text-emerald-300 font-extrabold">{log.new_status}</span>
                    </span>
                    <span className="text-slate-400">{new Date(log.created_at).toLocaleString("id-ID")}</span>
                  </div>
                  {log.stage_detail && <p className="text-xs text-emerald-400 font-semibold">{log.stage_detail}</p>}
                  <p className="text-xs text-slate-300">Pelaku: {log.changed_by_name}</p>
                  {log.reason && <p className="text-xs text-slate-400 italic">Catatan: {log.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Schedule Assessment */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c2b29] border border-emerald-700 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="font-bold text-white text-base">Jadwalkan Assessment / Interview</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Jenis Tes / Wawancara *</label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white"
                >
                  <option value="Psikotes">Psikotes</option>
                  <option value="Technical Test">Technical Test</option>
                  <option value="Aptitude Test">Aptitude Test</option>
                  <option value="Personality Test">Personality Test</option>
                  <option value="Interview HR">Interview HR</option>
                  <option value="Interview User">Interview User</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Jadwal Waktu Pelaksanaan *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Penilai / Interviewer Terkait *</label>
                <input
                  type="text"
                  required
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white"
                  placeholder="Nama HR / Tech Lead"
                />
              </div>

              <button
                type="submit"
                disabled={loadingSchedule}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2"
              >
                {loadingSchedule && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Jadwal Tes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grading Assessment Score */}
      {gradingAssessmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c2b29] border border-emerald-700 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="font-bold text-white text-base">Input Nilai Evaluasi (Skala 0 - 100)</h3>
              <button onClick={() => setGradingAssessmentId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-emerald-300 mb-1">
                  Nilai Angka (0 – 100, Kosongkan untuk Belum Dinilai) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gradeScoreInput}
                  onChange={(e) => setGradeScoreInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white"
                  placeholder="Contoh: 85 (atau 0 untuk nilai 0)"
                />
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  * Sistem membedakan nilai 0 dengan status belum dinilai (null).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Nama Penilai *</label>
                <input
                  type="text"
                  required
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 mb-1">Catatan Evaluasi Penilai *</label>
                <textarea
                  rows={3}
                  required
                  value={gradeNotes}
                  onChange={(e) => setGradeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800 text-white resize-none"
                  placeholder="Berikan ringkasan kelebihan & catatan hasil tes..."
                />
              </div>

              <button
                type="submit"
                disabled={loadingGrade}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2"
              >
                {loadingGrade && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Hasil Evaluasi</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
