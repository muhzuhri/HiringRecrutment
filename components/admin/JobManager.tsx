"use client";

import React, { useState } from "react";
import { JobPosting } from "@/types/admin";
import { createJobPosting, updateJobPosting, deleteJobPosting, toggleJobStatus } from "@/app/actions/admin";
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  X,
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  Building2,
  DollarSign,
  GraduationCap,
  Tag,
  Users,
} from "lucide-react";

interface JobManagerProps {
  initialJobs: JobPosting[];
}

export default function JobManager({ initialJobs }: JobManagerProps) {
  const [jobs, setJobs] = useState<JobPosting[]>(initialJobs);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [viewingJob, setViewingJob] = useState<JobPosting | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Create & Edit
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("Engineering");
  const [type, setType] = useState("Hybrid");
  const [location, setLocation] = useState("Jakarta, Hybrid");
  const [salary, setSalary] = useState("Rp 18.000.000 – Rp 28.000.000 / bulan");
  const [description, setDescription] = useState("");
  const [minEducation, setMinEducation] = useState<"SMA" | "D3" | "S1" | "S2" | "S3">("S1");
  const [requiredSkillsInput, setRequiredSkillsInput] = useState("React.js, Next.js, TypeScript, PostgreSQL");
  const [deadlineDate, setDeadlineDate] = useState("2026-11-30T23:59");
  const [statusOption, setStatusOption] = useState<"Active" | "Closed">("Active");

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDept("Engineering");
    setType("Hybrid");
    setLocation("Jakarta, Hybrid");
    setSalary("Rp 18.000.000 – Rp 28.000.000 / bulan");
    setDescription("");
    setMinEducation("S1");
    setRequiredSkillsInput("React.js, Next.js, TypeScript, PostgreSQL");
    setDeadlineDate("2026-11-30T23:59");
    setStatusOption("Active");
  };

  // Open Edit Modal with Pre-filled Data
  const handleOpenEdit = (job: JobPosting) => {
    setEditingJob(job);
    setTitle(job.title);
    setDept(job.dept || "Engineering");
    setType(job.type || "Hybrid");
    setLocation(job.location || "Jakarta");
    setSalary(job.salary || "");
    setDescription(job.description || "");
    setMinEducation(job.min_education || "S1");
    setRequiredSkillsInput((job.required_skills || []).join(", "));

    if (job.deadline_date) {
      const d = new Date(job.deadline_date);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDeadlineDate(isoLocal);
    } else {
      setDeadlineDate("");
    }
    setStatusOption(job.status);
  };

  // 1. Create Job Action
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const skillsArray = requiredSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await createJobPosting({
      title,
      dept,
      type,
      location,
      salary,
      description,
      min_education: minEducation,
      required_skills: skillsArray,
      deadline_date: deadlineDate ? new Date(deadlineDate).toISOString() : undefined,
      status: statusOption,
    });

    setLoading(false);

    if (res.success) {
      const newJobItem: JobPosting = {
        id: `job-${Date.now()}`,
        title,
        dept,
        type,
        location,
        salary,
        description,
        min_education: minEducation,
        required_skills: skillsArray,
        posted_date: new Date().toISOString(),
        deadline_date: deadlineDate ? new Date(deadlineDate).toISOString() : undefined,
        status: statusOption,
        applicant_count: 0,
        time_to_hire: "Belum tersedia",
      };
      setJobs((prev) => [newJobItem, ...prev]);

      setShowCreateModal(false);
      resetForm();
      setStatusMsg(`Lowongan pekerjaan "${title}" berhasil diterbitkan!`);
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setErrorMsg(res.error || "Gagal membuat lowongan pekerjaan.");
    }
  };

  // 2. Edit Job Action
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setLoading(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const skillsArray = requiredSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await updateJobPosting(editingJob.id, {
      title,
      dept,
      type,
      location,
      salary,
      description,
      min_education: minEducation,
      required_skills: skillsArray,
      deadline_date: deadlineDate ? new Date(deadlineDate).toISOString() : undefined,
      status: statusOption,
    });

    setLoading(false);

    if (res.success) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
            ? {
                ...j,
                title,
                dept,
                type,
                location,
                salary,
                description,
                min_education: minEducation,
                required_skills: skillsArray,
                deadline_date: deadlineDate ? new Date(deadlineDate).toISOString() : undefined,
                status: statusOption,
              }
            : j
        )
      );

      setEditingJob(null);
      resetForm();
      setStatusMsg(`Perubahan data lowongan "${title}" berhasil disimpan ke database!`);
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui lowongan pekerjaan.");
    }
  };

  // 3. Toggle Status (Buka / Tutup)
  const handleToggleStatus = async (job: JobPosting) => {
    const targetStatus = job.status === "Active" ? "Closed" : "Active";
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: targetStatus } : j))
    );

    const res = await toggleJobStatus(job.id);
    if (res.success) {
      setStatusMsg(
        `Status lowongan "${job.title}" diubah menjadi ${
          targetStatus === "Active" ? "AKTIF (Bisa Melamar)" : "DITUTUP"
        }.`
      );
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      // Revert status on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j))
      );
      setErrorMsg(res.error || "Gagal mengubah status lowongan.");
    }
  };

  // 4. Delete Job Action
  const handleDeleteJob = async (jobId: string) => {
    setLoading(true);
    const targetJob = jobs.find((j) => j.id === jobId);

    const res = await deleteJobPosting(jobId);
    setLoading(false);
    setDeletingJobId(null);

    if (res.success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setStatusMsg(`Lowongan "${targetJob?.title || "Pekerjaan"}" telah berhasil dihapus dari database.`);
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      setErrorMsg(res.error || "Gagal menghapus lowongan pekerjaan.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback Messages */}
      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-sm flex items-center justify-between gap-3 shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & Publish Action Button */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Manajemen Lowongan Pekerjaan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Daftar & Kontrol Lowongan Perusahaan
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Kelola posisi lowongan, perbarui kriteria (Edit), atur status pendaftaran (Buka/Tutup), dan hapus lowongan yang tidak aktif dengan integrasi Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/60 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Lowongan Baru</span>
        </button>
      </div>

      {/* Job Postings Master Table */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-[#061f1d] text-emerald-300 uppercase font-bold text-[11px] border-b border-emerald-800">
              <tr>
                <th className="p-4">Posisi Lowongan</th>
                <th className="p-4">Divisi & Tipe Kerja</th>
                <th className="p-4">Batas Akhir (Deadline)</th>
                <th className="p-4">Total Pelamar</th>
                <th className="p-4">Time-to-Hire</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Menu Aksi HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Belum ada lowongan pekerjaan. Klik "Buat Lowongan Baru" untuk menambahkan lowongan pertama.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const isExpired = job.deadline_date && new Date(job.deadline_date) < new Date();
                  const isActive = job.status === "Active" && !isExpired;

                  return (
                    <tr key={job.id} className="hover:bg-[#061f1d]/60 transition-colors group">
                      <td className="p-4 font-bold text-white">
                        <p className="text-sm text-emerald-100 group-hover:text-emerald-300 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-emerald-300/70 font-normal flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {job.location}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-xs">
                            {job.dept}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-200 border border-emerald-700/50 text-xs font-medium">
                            {job.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        {job.deadline_date ? (
                          <span className={`inline-flex items-center gap-1 font-semibold ${isExpired ? "text-rose-400" : "text-emerald-300"}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(job.deadline_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            {isExpired && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold ml-1">
                                Expired
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-white">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          {job.applicant_count ?? 0} Pelamar
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            job.time_to_hire && job.time_to_hire !== "Belum tersedia"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {job.time_to_hire || "Belum tersedia"}
                        </span>
                      </td>
                      <td className="p-4">
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Ditutup
                          </span>
                        )}
                      </td>

                      {/* 4 Action Buttons Toolbar */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* A. Lihat Detail */}
                          <button
                            type="button"
                            onClick={() => setViewingJob(job)}
                            className="p-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs transition-colors"
                            title="Lihat Detail Lowongan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* B. Edit Lowongan */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(job)}
                            className="p-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-xs transition-colors"
                            title="Edit Data Lowongan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* C. Toggle Buka / Tutup */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                              job.status === "Active"
                                ? "bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800"
                                : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                            }`}
                            title={job.status === "Active" ? "Tutup Lowongan Pekerjaan" : "Buka Kembali Lowongan"}
                          >
                            {job.status === "Active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {/* D. Hapus Lowongan */}
                          <button
                            type="button"
                            onClick={() => setDeletingJobId(job.id)}
                            className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition-colors"
                            title="Hapus Lowongan Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Detail Lowongan */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0c2b29] border border-emerald-700/60 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingJob(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                  {viewingJob.dept} • {viewingJob.type}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{viewingJob.title}</h2>
                <p className="text-xs text-emerald-200/70 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {viewingJob.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#061f1d] border border-emerald-800/60 rounded-xl p-4 text-xs">
              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Rentang Gaji
                </span>
                <p className="text-white font-bold text-sm">{viewingJob.salary || "Sesuai Standar Perusahaan"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" /> Min. Pendidikan
                </span>
                <p className="text-white font-bold text-sm">{viewingJob.min_education || "S1"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Batas Akhir Pendaftaran
                </span>
                <p className="text-white font-bold text-sm">
                  {viewingJob.deadline_date
                    ? new Date(viewingJob.deadline_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Tanpa Batas Waktu"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" /> Status & Total Pelamar
                </span>
                <p className="text-white font-bold text-sm">
                  {viewingJob.status === "Active" ? "● Aktif" : "○ Ditutup"} ({viewingJob.applicant_count ?? 0} Pelamar)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1">
                <Tag className="w-4 h-4" /> Skill / Kualifikasi yang Dibutuhkan
              </h3>
              <div className="flex flex-wrap gap-2">
                {(viewingJob.required_skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-200 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-300 uppercase">Deskripsi & Ruang Lingkup Pekerjaan</h3>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-[#061f1d] border border-emerald-800/40 p-4 rounded-xl">
                {viewingJob.description}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-800/60">
              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold transition-colors"
              >
                Tutup Ringkasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Job Form Modal */}
      {(showCreateModal || editingJob) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0c2b29] border border-emerald-700/60 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingJob(null);
                resetForm();
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                {editingJob ? <Edit3 className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {editingJob ? "Edit Lowongan Pekerjaan" : "Formulir Lowongan Pekerjaan Baru"}
                </h2>
                <p className="text-xs text-emerald-200/70">
                  {editingJob
                    ? "Perbarui kriteria, status, dan batas akhir pendaftaran di Supabase."
                    : "Terbitkan posisi lowongan baru ke portal rekrutmen internal."}
                </p>
              </div>
            </div>

            <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Judul Posisi Lowongan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: Senior Frontend Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Divisi / Departemen *</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Tipe Kerja *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="WFH">WFH (Work From Home)</option>
                    <option value="WFO">WFO (Work From Office)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Lokasi Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Jakarta HQ / Remote"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Rentang Gaji *</label>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Rp 15.000.000 - Rp 25.000.000 / bulan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Batas Akhir (Deadline)</label>
                  <input
                    type="datetime-local"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Syarat Min. Pendidikan *</label>
                  <select
                    value={minEducation}
                    onChange={(e) => setMinEducation(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SMA">SMA / SMK</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana 1 (S1)</option>
                    <option value="S2">Magister (S2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Status Publikasi Lowongan *</label>
                <select
                  value={statusOption}
                  onChange={(e) => setStatusOption(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Active">Aktif (Menerima Pendaftaran Pelamar)</option>
                  <option value="Closed">Ditutup (Pendaftaran Ditutup)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Required Skills (Pisahkan Koma) *</label>
                <input
                  type="text"
                  required
                  value={requiredSkillsInput}
                  onChange={(e) => setRequiredSkillsInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="React.js, Next.js, TypeScript, PostgreSQL"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Deskripsi Pekerjaan *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Tulis deskripsi tugas utama, tanggung jawab, dan kualifikasi yang dibutuhkan..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{editingJob ? "Simpan Perubahan Lowongan" : "Terbitkan Lowongan Baru"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm Delete Modal */}
      {deletingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0c2b29] border border-rose-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-700/60 text-rose-400 flex items-center justify-center font-bold mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-extrabold text-white">Hapus Lowongan Pekerjaan?</h2>
              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menghapus posisi ini secara permanen dari database Supabase? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingJobId(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDeleteJob(deletingJobId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Ya, Hapus Lowongan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
