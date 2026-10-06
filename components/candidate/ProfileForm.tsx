"use client";

import React, { useState } from "react";
import { updateCandidateProfile } from "@/app/actions/candidate";
import { CandidateProfile, EducationItem, ExperienceItem } from "@/types/candidate";
import { User, Phone, Globe, GraduationCap, Briefcase, Award, Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  initialProfile: CandidateProfile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialProfile.whatsapp || initialProfile.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile.portfolio_url || "");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [bio, setBio] = useState(initialProfile.bio || "");

  // Education state
  const [educationList, setEducationList] = useState<EducationItem[]>(
    initialProfile.education && initialProfile.education.length > 0
      ? initialProfile.education
      : [
          {
            id: `edu-${Date.now()}`,
            level: "S1",
            school: "Universitas Indonesia",
            major: "Teknik Informatika",
            startYear: "2019",
            endYear: "2023",
          },
        ]
  );

  // Skills state
  const [skillsList, setSkillsList] = useState<string[]>(
    initialProfile.skills && initialProfile.skills.length > 0
      ? initialProfile.skills
      : ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Supabase", "SQL"]
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Experience state
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(
    initialProfile.experience && initialProfile.experience.length > 0
      ? initialProfile.experience
      : [
          {
            id: `exp-${Date.now()}`,
            company: "Tech Solution Indonesia",
            position: "Frontend Web Engineer",
            period: "2023 – Sekarang",
            description: "Mengembangkan aplikasi web modern berbasis Next.js App Router dan Tailwind CSS.",
          },
        ]
  );

  // Education Handlers
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: `edu-${Date.now()}`,
        level: "S1",
        school: "",
        major: "",
        startYear: "2020",
        endYear: "2024",
      },
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter((item) => item.id !== id));
  };

  const handleEducationChange = (id: string, field: keyof EducationItem, value: any) => {
    setEducationList(
      educationList.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Skill Handlers
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      {
        id: `exp-${Date.now()}`,
        company: "",
        position: "",
        period: "2022 – 2024",
        description: "",
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceList(experienceList.filter((item) => item.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperienceList(
      experienceList.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const payload = {
      full_name: fullName,
      phone,
      whatsapp,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      headline,
      bio,
      education: educationList,
      skills: skillsList,
      experience: experienceList,
    };

    const res = await updateCandidateProfile(payload);
    setLoading(false);

    if (res.success) {
      setStatusMsg({
        type: "success",
        text: "Data profil terstruktur Anda berhasil diperbarui dan tersimpan di database Supabase!",
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal memperbarui profil. Periksa koneksi Anda.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            statusMsg.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/50 text-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 1. Informasi Kontak & Bio */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">1. Informasi Kontak & Ringkasan Diri</h2>
            <p className="text-xs text-emerald-200/70">Data ini digunakan untuk identitas utama Anda di TalentHub.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="Contoh: Ahmad Rizky Supriadi"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Alamat Email (Akun)
            </label>
            <input
              type="email"
              disabled
              value={initialProfile.email}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d]/50 border border-emerald-900/40 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Nomor Telepon / HP
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="081234567890"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Nomor WhatsApp (Aktif) *
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="081234567890"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Tautan Profile LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Tautan Portofolio / GitHub / Website
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="https://github.com/username"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Headline Profesional
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="Contoh: Senior Full-Stack Engineer | Ex-Startup Tech Lead"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
              Bio / Ringkasan Kualifikasi Diri
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
              placeholder="Tuliskan gambaran singkat mengenai pengalaman, pencapaian utama, dan motivasi karier Anda..."
            />
          </div>
        </div>
      </div>

      {/* 2. Riwayat Pendidikan */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Form Riwayat Pendidikan</h2>
              <p className="text-xs text-emerald-200/70">Tambahkan riwayat pendidikan formal Anda secara lengkap.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddEducation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pendidikan</span>
          </button>
        </div>

        <div className="space-y-4">
          {educationList.map((edu, idx) => (
            <div
              key={edu.id}
              className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-4 sm:p-5 space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Pendidikan #{idx + 1}
                </span>

                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Jenjang Pendidikan *
                  </label>
                  <select
                    value={edu.level}
                    onChange={(e) => handleEducationChange(edu.id, "level", e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SMA">SMA / SMK / Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Nama Universitas / Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={edu.school}
                    onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="Contoh: Universitas Indonesia"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Jurusan / Program Studi *
                  </label>
                  <input
                    type="text"
                    required
                    value={edu.major}
                    onChange={(e) => handleEducationChange(edu.id, "major", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="Teknik Informatika"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Tahun Lulus *
                  </label>
                  <input
                    type="text"
                    required
                    value={edu.endYear}
                    onChange={(e) => handleEducationChange(edu.id, "endYear", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="2023"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sertifikasi & Keahlian (Skills) */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">3. Form Sertifikasi & Keahlian (Skills)</h2>
            <p className="text-xs text-emerald-200/70">Daftar kemampuan teknis & manajerial yang Anda kuasai.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="Ketik keahlian (contoh: Next.js, Golang, Figma, Docker) lalu tekan Tambah"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Skill</span>
            </button>
          </div>

          {/* Skill Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061f1d] border border-emerald-700/50 text-emerald-200 text-xs font-semibold shadow-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Riwayat Pengalaman Kerja */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4. Form Riwayat Pengalaman Kerja</h2>
              <p className="text-xs text-emerald-200/70">Pengalaman kerja relevan sebelumnya yang pernah Anda jalani.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddExperience}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pengalaman</span>
          </button>
        </div>

        <div className="space-y-4">
          {experienceList.map((exp, idx) => (
            <div
              key={exp.id}
              className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Pengalaman #{idx + 1}
                </span>

                {experienceList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="PT Nusantara Tech"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Posisi / Jabatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(exp.id, "position", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="Frontend Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Tahun / Periode Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={exp.period}
                    onChange={(e) => handleExperienceChange(exp.id, "period", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    placeholder="2022 – Sekarang"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-emerald-300 mb-1">
                    Deskripsi Tanggung Jawab & Tanggung Jawab
                  </label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 text-xs resize-none"
                    placeholder="Jelaskan secara singkat tanggung jawab utama dan teknologi yang Anda gunakan..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 z-20">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 border border-emerald-400/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menyimpan Profil ke Supabase...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Simpan Seluruh Data Profil Kandidat</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
