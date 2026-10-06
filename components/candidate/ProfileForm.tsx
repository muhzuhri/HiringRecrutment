"use client";

import React, { useState } from "react";
import { updateCandidateProfile } from "@/app/actions/candidate";
import { CandidateProfile, EducationItem, ExperienceItem } from "@/types/candidate";
import { User, GraduationCap, Briefcase, Award, Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

interface ProfileFormProps {
  initialProfile: CandidateProfile;
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 45 }, (_, i) => (CURRENT_YEAR + 5 - i).toString());

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states - pure candidate data from Supabase
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialProfile.whatsapp || initialProfile.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile.portfolio_url || "");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [bio, setBio] = useState(initialProfile.bio || "");

  // Education state
  const [educationList, setEducationList] = useState<EducationItem[]>(
    initialProfile.education || []
  );

  // Skills state
  const [skillsList, setSkillsList] = useState<string[]>(
    initialProfile.skills || []
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Helper parsing for experience items
  const parseExpItem = (exp: ExperienceItem) => {
    let startMonth = "Januari";
    let startYear = "2022";
    let endMonth = "Desember";
    let endYear = "2024";
    let isCurrent = false;

    if (exp.period) {
      const parts = exp.period.split("–").map((s) => s.trim());
      if (parts[0]) {
        const p = parts[0].split(" ");
        if (p.length === 2 && MONTHS.includes(p[0])) {
          startMonth = p[0];
          startYear = p[1];
        } else if (p.length === 1 && !isNaN(Number(p[0]))) {
          startYear = p[0];
        }
      }
      if (parts[1]) {
        if (parts[1].toLowerCase().includes("sekarang") || parts[1].toLowerCase().includes("present")) {
          isCurrent = true;
        } else {
          const p = parts[1].split(" ");
          if (p.length === 2 && MONTHS.includes(p[0])) {
            endMonth = p[0];
            endYear = p[1];
          } else if (p.length === 1 && !isNaN(Number(p[0]))) {
            endYear = p[0];
          }
        }
      }
    }

    return {
      ...exp,
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrent,
    };
  };

  // Experience state with interactive Month/Year picker fields
  const [experienceStateList, setExperienceStateList] = useState<
    Array<{
      id: string;
      company: string;
      position: string;
      description: string;
      startMonth: string;
      startYear: string;
      endMonth: string;
      endYear: string;
      isCurrent: boolean;
    }>
  >(
    (initialProfile.experience || []).map((exp) => parseExpItem(exp))
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
        startYear: CURRENT_YEAR.toString(),
        endYear: (CURRENT_YEAR + 4).toString(),
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
    setExperienceStateList([
      ...experienceStateList,
      {
        id: `exp-${Date.now()}`,
        company: "",
        position: "",
        description: "",
        startMonth: "Januari",
        startYear: (CURRENT_YEAR - 2).toString(),
        endMonth: "Desember",
        endYear: CURRENT_YEAR.toString(),
        isCurrent: true,
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceStateList(experienceStateList.filter((item) => item.id !== id));
  };

  const handleExpFieldChange = (id: string, field: string, value: any) => {
    setExperienceStateList(
      experienceStateList.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    // Format experience list back into standardized items
    const formattedExperience: ExperienceItem[] = experienceStateList.map((exp) => {
      const periodStr = exp.isCurrent
        ? `${exp.startMonth} ${exp.startYear} – Sekarang`
        : `${exp.startMonth} ${exp.startYear} – ${exp.endMonth} ${exp.endYear}`;

      return {
        id: exp.id,
        company: exp.company,
        position: exp.position,
        period: periodStr,
        description: exp.description,
      };
    });

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
      experience: formattedExperience,
    };

    const res = await updateCandidateProfile(payload);
    setLoading(false);

    if (res.success) {
      setStatusMsg({
        type: "success",
        text: "Data profil terstruktur Anda telah tersimpan secara permanen di database Supabase!",
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal memperbarui profil. Silakan coba lagi.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 animate-fade-in-up ${
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
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">1. Informasi Kontak Utama & Bio</h2>
            <p className="text-xs text-emerald-200/70">Lengkapi informasi identitas diri Anda secara akurat.</p>
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
              placeholder="Contoh: Ahmad Rizky"
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
              className="w-full px-4 py-2.5 rounded-xl bg-[#061f1d]/50 border border-emerald-900/40 text-slate-400 cursor-not-allowed font-medium"
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
              placeholder="Contoh: Frontend Engineer | Ex-Startup Software Developer"
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
              placeholder="Tuliskan ringkasan pengalaman, minat industri, dan kekuatan utama Anda..."
            />
          </div>
        </div>
      </div>

      {/* 2. Riwayat Pendidikan */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">2. Form Riwayat Pendidikan</h2>
              <p className="text-xs text-emerald-200/70">Tambahkan riwayat pendidikan formal Anda.</p>
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

        {educationList.length === 0 ? (
          <div className="p-8 text-center bg-[#061f1d]/50 border border-dashed border-emerald-800/60 rounded-xl text-slate-400 text-xs space-y-2">
            <p className="font-semibold text-slate-300">Belum Ada Riwayat Pendidikan</p>
            <p>Klik tombol "+ Tambah Pendidikan" di atas untuk menambahkan institusi pendidikan Anda.</p>
          </div>
        ) : (
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

                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                      Nama Sekolah / Universitas *
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

                  {/* Year Selectors */}
                  <div>
                    <label className="block text-xs font-medium text-emerald-300 mb-1">
                      Tahun Lulus *
                    </label>
                    <select
                      value={edu.endYear}
                      onChange={(e) => handleEducationChange(edu.id, "endYear", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sertifikasi & Keahlian (Skills) */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">3. Form Keahlian & Sertifikasi (Skills)</h2>
            <p className="text-xs text-emerald-200/70">Daftar skill dan keahlian teknis yang Anda kuasai.</p>
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
              placeholder="Ketik keahlian (contoh: Next.js, React, Node.js, SQL) lalu tekan Tambah"
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
          {skillsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada skill ditambahkan.</p>
          ) : (
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
                    className="text-slate-400 hover:text-rose-400 transition-colors ml-1 text-sm font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Riwayat Pengalaman Kerja (Interactive Month & Year Picker) */}
      <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4. Form Riwayat Pengalaman Kerja</h2>
              <p className="text-xs text-emerald-200/70">
                Pilih periode bulan dan tahun menggunakan dropdown interaktif di bawah.
              </p>
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

        {experienceStateList.length === 0 ? (
          <div className="p-8 text-center bg-[#061f1d]/50 border border-dashed border-emerald-800/60 rounded-xl text-slate-400 text-xs space-y-2">
            <p className="font-semibold text-slate-300">Belum Ada Riwayat Pengalaman Kerja</p>
            <p>Klik tombol "+ Tambah Pengalaman" untuk mengisi riwayat pekerjaan Anda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {experienceStateList.map((exp, idx) => (
              <div
                key={exp.id}
                className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-5 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Pengalaman #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-emerald-300 mb-1">
                      Nama Perusahaan *
                    </label>
                    <input
                      type="text"
                      required
                      value={exp.company}
                      onChange={(e) => handleExpFieldChange(exp.id, "company", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      placeholder="Contoh: PT Nusantara Tech"
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
                      onChange={(e) => handleExpFieldChange(exp.id, "position", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      placeholder="Contoh: Frontend Web Developer"
                    />
                  </div>

                  {/* Interactive Month & Year Picker */}
                  <div className="sm:col-span-2 bg-[#0c2b29]/80 border border-emerald-800/60 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Periode Waktu Kerja (Bulan & Tahun Interaktif)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Start Date Dropdowns */}
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Bulan & Tahun Mulai *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={exp.startMonth}
                            onChange={(e) => handleExpFieldChange(exp.id, "startMonth", e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>

                          <select
                            value={exp.startYear}
                            onChange={(e) => handleExpFieldChange(exp.id, "startYear", e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* End Date Dropdowns / Current Checkbox */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-400">Bulan & Tahun Selesai</label>
                          <label className="flex items-center gap-1 text-[11px] text-emerald-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => handleExpFieldChange(exp.id, "isCurrent", e.target.checked)}
                              className="w-3.5 h-3.5 accent-emerald-600 rounded"
                            />
                            <span>Masih Bekerja (Saat Ini)</span>
                          </label>
                        </div>

                        {!exp.isCurrent ? (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={exp.endMonth}
                              onChange={(e) => handleExpFieldChange(exp.id, "endMonth", e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>

                            <select
                              value={exp.endYear}
                              onChange={(e) => handleExpFieldChange(exp.id, "endYear", e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs font-bold flex items-center justify-center">
                            Present (Saat Ini)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-emerald-300 mb-1">
                      Deskripsi Tanggung Jawab & Pencapaian
                    </label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleExpFieldChange(exp.id, "description", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 text-xs resize-none"
                      placeholder="Jelaskan secara singkat tugas utama dan pencapaian Anda..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <span>Menyimpan ke Database Supabase...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Simpan Seluruh Data Profil Terstruktur</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
