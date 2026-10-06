"use client";

import React, { useState } from "react";
import { JobPosting } from "@/types/admin";
import { createJobPosting, toggleJobStatus } from "@/app/actions/admin";
import { Briefcase, Plus, Search, CheckCircle2, Lock, Unlock, X, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface JobManagerProps {
  initialJobs: JobPosting[];
}

export default function JobManager({ initialJobs }: JobManagerProps) {
  const [jobs, setJobs] = useState<JobPosting[]>(initialJobs);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("Engineering");
  const [type, setType] = useState("Full-time");
  const [location, setLocation] = useState("Jakarta, Hybrid");
  const [salary, setSalary] = useState("Rp 18.000.000 – Rp 28.000.000 / bulan");
  const [description, setDescription] = useState("");
  const [minEducation, setMinEducation] = useState<"SMA" | "D3" | "S1" | "S2" | "S3">("S1");
  const [requiredSkillsInput, setRequiredSkillsInput] = useState("React.js, Next.js, TypeScript, SQL");

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

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
    });

    setLoading(false);

    if (res.success) {
      setShowModal(false);
      setTitle("");
      setDescription("");
      setStatusMsg("Lowongan pekerjaan baru berhasil diterbitkan!");
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      alert(res.error || "Gagal membuat lowongan.");
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: j.status === "Active" ? "Closed" : "Active" } : j
      )
    );

    const res = await toggleJobStatus(jobId);
    if (!res.success) {
      alert(res.error || "Gagal mengubah status lowongan.");
    }
  };

  return (
    <div className="space-y-8">
      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header Banner & Action Button */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Recruitment Job Postings
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Lowongan Pekerjaan
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Kelola posisi aktif, tentukan kriteria minimum saringan otomatis (Pendidikan S1, Skill), dan terbitkan lowongan baru.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/60 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Lowongan Baru</span>
        </button>
      </div>

      {/* Job Postings Table */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-[#061f1d] text-emerald-300 uppercase font-bold text-[11px] border-b border-emerald-800">
              <tr>
                <th className="p-4">Posisi Lowongan</th>
                <th className="p-4">Departemen & Tipe</th>
                <th className="p-4">Syarat Min. Pendidikan</th>
                <th className="p-4">Pelamar</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#061f1d]/50 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <p className="text-sm">{job.title}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{job.location}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      {job.dept}
                    </span>
                    <span className="ml-2 text-slate-400">{job.type}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-bold">
                      Minimal {job.min_education}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-white">
                    {job.applicant_count || 12} Pelamar
                  </td>
                  <td className="p-4">
                    {job.status === "Active" ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs">
                        ○ Ditutup
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        job.status === "Active"
                          ? "bg-rose-950/80 border border-rose-800 text-rose-200 hover:bg-rose-900/80"
                          : "bg-emerald-950 border border-emerald-800 text-emerald-200 hover:bg-emerald-900"
                      }`}
                    >
                      {job.status === "Active" ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Tutup Lowongan</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Buka Kembali</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Job Posting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0c2b29] border border-emerald-700/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Formulir Buat Lowongan Baru</h2>
                <p className="text-xs text-emerald-200/70">Atur kualifikasi minimum saringan otomatis kandidat.</p>
              </div>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Judul Posisi *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: Senior Full-Stack Engineer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Departemen *</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Syarat Min. Pendidikan (Auto-Screening) *</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Tipe Pekerjaan *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-300 uppercase mb-1">Lokasi Kerja *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Jakarta, Hybrid"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Rentang Gaji *</label>
                <input
                  type="text"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Rp 20.000.000 – Rp 35.000.000 / bulan"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-300 uppercase mb-1">Syarat Skill Wajib (Pisahkan Koma) *</label>
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
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Jelaskan tanggung jawab utama dan kualifikasi yang dicari..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Terbitkan Lowongan Baru</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
