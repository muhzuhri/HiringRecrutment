"use client";

import React, { useState, useMemo } from "react";
import { updateCandidateProfile, uploadCandidateDocumentFile, uploadKtpFile, deleteKtpFile, uploadAvatarFile, deleteAvatarFile } from "@/app/actions/candidate";
import { CandidateProfile, EducationItem, ExperienceItem, CertificationItem } from "@/types/candidate";
import ResumeUploader from "./ResumeUploader";
import ResumeGenerator from "./ResumeGenerator";
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Building2,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Phone,
  MessageSquare,
  MapPin,
  IdCard,
  Layers,
  Check,
  Upload,
  Paperclip,
  FileCheck,
  Camera
} from "lucide-react";

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
const EXPIRY_YEARS = Array.from({ length: 25 }, (_, i) => (CURRENT_YEAR + 15 - i).toString());

const POPULAR_SKILL_TAGS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Project Management",
  "UI/UX Design",
  "Docker",
  "Git & GitHub",
  "Rest API",
  "Graphic Design",
  "Data Analysis",
];

const CERT_TYPE_OPTIONS = [
  "Certificate of Completion",
  "Certificate of Appreciation / Penghargaan",
  "Professional License",
  "Course Badge",
  "Professional Certification",
  "Workshop & Bootcamp",
];

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<
    "personal" | "education" | "certifications" | "experience" | "skills" | "cv" | "generate_cv"
  >("personal");

  const [loading, setLoading] = useState(false);
  const [uploadingMediaKey, setUploadingMediaKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Personal & Contact State (MagangHub standard)
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nik, setNik] = useState(initialProfile.nik || "");
  const [ktpUrl, setKtpUrl] = useState(initialProfile.ktp_url || "");
  const [ktpName, setKtpName] = useState(initialProfile.ktp_name || "");
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [whatsapp, setWhatsapp] = useState(initialProfile.whatsapp || initialProfile.phone || "");
  const [address, setAddress] = useState(initialProfile.address || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(initialProfile.github_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile.portfolio_url || "");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [bio, setBio] = useState(initialProfile.bio || "");

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran client-side (Max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({
        type: "error",
        text: `Ukuran foto profil (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB. Silakan gunakan foto yang lebih kecil.`,
      });
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setStatusMsg({
        type: "error",
        text: "Format berkas harus berupa gambar (JPG, PNG, atau WEBP).",
      });
      return;
    }

    setUploadingAvatar(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("avatarFile", file);

    const res = await uploadAvatarFile(formData);
    setUploadingAvatar(false);

    if (res.success && res.avatarUrl) {
      setAvatarUrl(res.avatarUrl);
      setStatusMsg({
        type: "success",
        text: "Foto profil Anda berhasil diunggah!",
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal mengunggah foto profil.",
      });
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;
    setUploadingAvatar(true);
    const res = await deleteAvatarFile();
    setUploadingAvatar(false);
    if (res.success) {
      setAvatarUrl("");
      setStatusMsg({
        type: "success",
        text: "Foto profil berhasil dihapus.",
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal menghapus foto profil.",
      });
    }
  };

  // 2. Education State
  const [educationList, setEducationList] = useState<EducationItem[]>(
    initialProfile.education || []
  );

  // 3. Certifications & Training State
  const [certificationsList, setCertificationsList] = useState<CertificationItem[]>(
    initialProfile.certifications || []
  );

  // KTP Upload Handler
  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran client-side (Max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({
        type: "error",
        text: `Ukuran berkas KTP (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB. Silakan kompres atau pilih berkas yang lebih kecil.`,
      });
      return;
    }

    setUploadingKtp(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("ktpFile", file);

    const res = await uploadKtpFile(formData);
    setUploadingKtp(false);

    if (res.success && res.ktpUrl) {
      setKtpUrl(res.ktpUrl);
      setKtpName(res.ktpName || file.name);
      setStatusMsg({
        type: "success",
        text: `Berkas KTP "${res.ktpName || file.name}" berhasil diunggah dan tersimpan di database!`,
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal mengunggah berkas KTP. Pastikan ukuran max 2MB dan format Gambar/PDF.",
      });
    }
  };

  const handleDeleteKtp = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas KTP ini?")) return;
    setUploadingKtp(true);
    const res = await deleteKtpFile();
    setUploadingKtp(false);
    if (res.success) {
      setKtpUrl("");
      setKtpName("");
      setStatusMsg({
        type: "success",
        text: "Berkas KTP berhasil dihapus dari profil kandidat.",
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal menghapus berkas KTP.",
      });
    }
  };

  // File Upload Handler for Education, Certification, and Experience attachments
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (fileUrl: string, fileName: string) => void,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMediaKey(key);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadCandidateDocumentFile(formData);
    setUploadingMediaKey(null);

    if (res.success && res.fileUrl) {
      onSuccess(res.fileUrl, res.fileName || file.name);
      setStatusMsg({
        type: "success",
        text: `Berkas "${res.fileName || file.name}" berhasil diunggah secara permanen ke Supabase Storage!`,
      });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal mengunggah berkas media. Pastikan ukuran max 2MB dan format PDF/Gambar.",
      });
    }
  };

  // Helper parsing for experience items
  const parseExpItem = (exp: ExperienceItem) => {
    let startMonth = exp.startMonth || "Januari";
    let startYear = exp.startYear || (CURRENT_YEAR - 2).toString();
    let endMonth = exp.endMonth || "Desember";
    let endYear = exp.endYear || CURRENT_YEAR.toString();
    let isCurrent = exp.isCurrent ?? false;

    if (exp.period && !exp.startMonth) {
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
      id: exp.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: exp.company || "",
      position: exp.position || "",
      description: exp.description || "",
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrent,
      mediaUrl: exp.mediaUrl || "",
      mediaName: exp.mediaName || "",
    };
  };

  // 4. Experience State
  const [experienceStateList, setExperienceStateList] = useState(
    (initialProfile.experience || []).map((exp) => parseExpItem(exp))
  );

  // 5. Skills State
  const [skillsList, setSkillsList] = useState<string[]>(
    initialProfile.skills || []
  );
  const [newSkillInput, setNewSkillInput] = useState("");
  const [hardSkills, setHardSkills] = useState(initialProfile.hard_skills || "");
  const [softSkills, setSoftSkills] = useState(initialProfile.soft_skills || "");
  const [languages, setLanguages] = useState(initialProfile.languages || "");

  // Calculate realtime Profile Completeness Percentage (Mandatory 100% to apply)
  const completenessScore = useMemo(() => {
    let score = 0;
    if (fullName.trim()) score += 10;
    if (nik.trim().length === 16) score += 15;
    if (ktpUrl.trim()) score += 15;
    if (whatsapp.trim() || phone.trim()) score += 10;
    if (address.trim()) score += 10;
    if (headline.trim() || bio.trim()) score += 10;
    if (educationList.length > 0) score += 15;
    if (experienceStateList.length > 0) score += 10;
    if (skillsList.length > 0) score += 5;
    if (initialProfile.resume_url) score += 10;
    return Math.min(score, 100);
  }, [
    fullName,
    nik,
    ktpUrl,
    whatsapp,
    phone,
    address,
    headline,
    bio,
    educationList,
    experienceStateList,
    skillsList,
    initialProfile.resume_url,
  ]);

  // List of fields required to achieve 100% profile completeness
  const missingItems = useMemo(() => {
    const list: string[] = [];
    if (!fullName.trim()) list.push("Nama Lengkap");
    if (nik.trim().length !== 16) list.push("NIK (16 Digit KTP)");
    if (!ktpUrl.trim()) list.push("Unggahan Berkas KTP");
    if (!whatsapp.trim() && !phone.trim()) list.push("Nomor WhatsApp/HP");
    if (!address.trim()) list.push("Alamat Domisili");
    if (!headline.trim() && !bio.trim()) list.push("Ringkasan / Headline");
    if (educationList.length === 0) list.push("Pendidikan Terakhir (min. 1)");
    if (experienceStateList.length === 0) list.push("Pengalaman / Organisasi (min. 1)");
    if (skillsList.length === 0) list.push("Keahlian / Skill (min. 1)");
    if (!initialProfile.resume_url) list.push("Unggahan Berkas CV (PDF)");
    return list;
  }, [
    fullName,
    nik,
    ktpUrl,
    whatsapp,
    phone,
    address,
    headline,
    bio,
    educationList,
    experienceStateList,
    skillsList,
    initialProfile.resume_url,
  ]);

  // Education Handlers
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: `edu-${Date.now()}`,
        level: "S1",
        school: "",
        major: "",
        gpa: "",
        startYear: (CURRENT_YEAR - 4).toString(),
        endYear: CURRENT_YEAR.toString(),
      },
    ]);
  };

  const handleRemoveEducation = (id?: string) => {
    setEducationList(educationList.filter((item) => item.id !== id));
  };

  const handleEducationChange = (id: string | undefined, field: keyof EducationItem, value: any) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleEducationMedia = (id: string | undefined, mediaUrl: string, mediaName: string) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mediaUrl, mediaName } : item))
    );
  };

  // Certifications Handlers
  const handleAddCertification = () => {
    setCertificationsList([
      ...certificationsList,
      {
        id: `cert-${Date.now()}`,
        title: "",
        certType: "",
        issuer: "",
        issueMonth: "Januari",
        issueYear: CURRENT_YEAR.toString(),
        expiryMonth: "Desember",
        expiryYear: (CURRENT_YEAR + 3).toString(),
        noExpiry: false,
        credentialUrl: "",
        mediaUrl: "",
        mediaName: "",
      },
    ]);
  };

  const handleRemoveCertification = (id?: string) => {
    setCertificationsList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCertChange = (id: string | undefined, field: keyof CertificationItem, value: any) => {
    setCertificationsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCertMedia = (id: string | undefined, mediaUrl: string, mediaName: string) => {
    setCertificationsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mediaUrl, mediaName } : item))
    );
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
        isCurrent: false,
        mediaUrl: "",
        mediaName: "",
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceStateList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExpFieldChange = (id: string, field: string, value: any) => {
    setExperienceStateList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleExpMedia = (id: string, mediaUrl: string, mediaName: string) => {
    setExperienceStateList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mediaUrl, mediaName } : item))
    );
  };

  // Skills Handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || newSkillInput).trim();
    if (val && !skillsList.includes(val)) {
      setSkillsList([...skillsList, val]);
      if (!skillToAdd) setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    // Format experience list back into standardized items with period string
    const formattedExperience: ExperienceItem[] = experienceStateList.map((exp) => {
      const periodStr = `${exp.startMonth} ${exp.startYear} – ${exp.endMonth} ${exp.endYear}`;

      return {
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startMonth: exp.startMonth,
        startYear: exp.startYear,
        endMonth: exp.endMonth,
        endYear: exp.endYear,
        isCurrent: false,
        period: periodStr,
        description: exp.description,
        mediaUrl: exp.mediaUrl || "",
        mediaName: exp.mediaName || "",
      };
    });

    const payload = {
      full_name: fullName,
      avatar_url: avatarUrl,
      nik,
      ktp_url: ktpUrl,
      ktp_name: ktpName,
      phone,
      whatsapp,
      address,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      headline,
      bio,
      education: educationList,
      certifications: certificationsList,
      skills: skillsList,
      hard_skills: hardSkills,
      soft_skills: softSkills,
      languages: languages,
      experience: formattedExperience,
    };

    const res = await updateCandidateProfile(payload);
    setLoading(false);

    if (res.success) {
      setStatusMsg({
        type: "success",
        text: "Data profil terstruktur kandidat berhasil disimpan secara permanen di database Supabase!",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStatusMsg({
        type: "error",
        text: res.error || "Gagal memperbarui profil. Silakan periksa kembali data Anda.",
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Profile Banner & Completeness Indicator */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-300 dark:border-emerald-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 dark:bg-gradient-to-br dark:from-emerald-600 dark:to-teal-800 border-2 border-slate-300 dark:border-emerald-500/50 flex items-center justify-center font-extrabold text-white text-2xl sm:text-3xl shadow-sm">
                  {fullName ? fullName.charAt(0).toUpperCase() : "K"}
                </div>
              )}

              {/* Upload trigger button on avatar */}
              <label
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md cursor-pointer transition-transform hover:scale-110 border-2 border-white dark:border-slate-800 flex items-center justify-center"
                title="Unggah / Ganti Foto Profil"
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-teal-950 text-slate-700 dark:text-teal-300 border border-slate-200 dark:border-teal-700/50 text-xs font-semibold">
                  Akun Kandidat
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {fullName || "Profil Kandidat"}
              </h1>

              <p className="text-slate-500 dark:text-emerald-200/80 text-xs sm:text-sm">
                {headline || "Lengkapi profil terstruktur Anda untuk memperbesar peluang lolos seleksi HR."}
              </p>
            </div>
          </div>

          {/* Completeness Bar Card */}
          <div className="bg-slate-50 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 w-full md:w-80 shrink-0 space-y-2.5 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${completenessScore === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`} />
                Kelengkapan Profil
              </span>
              <span className={`font-black text-sm ${completenessScore === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {completenessScore}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden border border-slate-300 dark:border-emerald-900">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completenessScore === 100
                    ? "bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-400"
                    : "bg-amber-500 dark:bg-amber-400"
                }`}
                style={{ width: `${completenessScore}%` }}
              />
            </div>

            {completenessScore === 100 ? (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold leading-snug">
                ✓ Profil 100% lengkap! Anda memenuhi syarat untuk melamar pekerjaan.
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-snug">
                  Wajib 100% sebelum dapat melamar lowongan.
                </p>
                {missingItems.length > 0 && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Belum diisi: {missingItems.slice(0, 3).join(", ")}{missingItems.length > 3 ? ` +${missingItems.length - 3} lainnya` : ""}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Feedback Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-3 animate-fade-in-up ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-500/60 dark:text-emerald-200"
              : "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/90 dark:border-rose-500/60 dark:text-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-emerald-800/40 pb-2 overflow-x-auto">
        {[
          { id: "personal", label: "Pribadi & Kontak", icon: User },
          { id: "education", label: `Pendidikan (${educationList.length})`, icon: GraduationCap },
          { id: "certifications", label: `Sertifikasi (${certificationsList.length})`, icon: Award },
          { id: "experience", label: `Pengalaman (${experienceStateList.length})`, icon: Briefcase },
          { id: "skills", label: `Keahlian (${skillsList.length})`, icon: Layers },
          { id: "cv", label: "Berkas CV Utama", icon: FileText },
          { id: "generate_cv", label: "Generate Resume (PDF)", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-[#0c2b29] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-emerald-900/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-emerald-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB 1: INFORMASI PRIBADI & KONTAK */}
        {activeTab === "personal" && (
          <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-emerald-800/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/50 flex items-center justify-center text-slate-700 dark:text-emerald-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Informasi Pribadi & Kontak Komprehensif
                </h2>
                <p className="text-xs text-slate-500 dark:text-emerald-200/70">
                  Sesuai standar MagangHub untuk verifikasi identitas resmi dan mempermudah kontak awal oleh HR Recruiter.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              {/* FOTO PROFIL KANDIDAT */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-[#061f1d]/90 border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 dark:border-emerald-500/60 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-emerald-900/60 text-white dark:text-emerald-300 flex items-center justify-center font-extrabold text-xl border border-slate-300 dark:border-emerald-700/60">
                        {fullName ? fullName.charAt(0).toUpperCase() : "K"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 text-center sm:text-left">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                      <Camera className="w-4 h-4 text-slate-700 dark:text-emerald-400" />
                      Foto Profil Kandidat
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Format file: PNG, JPG, JPEG, atau WEBP. Maksimal 5 MB. Foto formal mempermudah pengenalan oleh tim rekruter.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    {uploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{avatarUrl ? "Ganti Foto" : "Unggah Foto Profil"}</span>
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={handleDeleteAvatar}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="Contoh: Ahmad Rizky"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  NIK (Nomor Induk Kependudukan - 16 Digit) *
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={16}
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="3171012345678900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Wajib 16 digit angka sesuai KTP. 1 NIK hanya berlaku untuk 1 akun kandidat.
                </p>
              </div>

              {/* DOKUMEN / FOTO KTP */}
              <div className="md:col-span-2 bg-slate-50 dark:bg-[#061f1d]/90 border border-slate-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-bold text-slate-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <IdCard className="w-4 h-4 text-slate-700 dark:text-emerald-400" />
                      Unggah Dokumen / Foto KTP (Wajib untuk Verifikasi & 100% Profil) *
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Format file: JPG, PNG, WEBP, atau PDF. Maksimal 5 MB. Digunakan untuk validasi 1 orang = 1 akun tunggal.
                    </p>
                  </div>
                  {ktpUrl && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      KTP Terunggah
                    </span>
                  )}
                </div>

                {ktpUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-700">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {ktpName || "Dokumen_KTP_Terlampir"}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Tersimpan aman di Supabase Storage
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={ktpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#061f1d] hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-300 text-xs font-semibold border border-slate-200 dark:border-emerald-800 transition-colors"
                      >
                        Lihat Berkas KTP
                      </a>
                      <button
                        type="button"
                        disabled={uploadingKtp}
                        onClick={handleDeleteKtp}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-emerald-800/80 hover:border-slate-400 dark:hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white dark:bg-[#0c2b29]">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={handleKtpUpload}
                        disabled={uploadingKtp}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        {uploadingKtp ? (
                          <Loader2 className="w-6 h-6 text-slate-600 dark:text-emerald-400 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-500 dark:text-emerald-400" />
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {uploadingKtp ? "Mengunggah Berkas KTP..." : "Pilih atau Seret Foto/Scan KTP"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Format PNG, JPG, JPEG, atau Dokumen PDF (Maksimal 5 MB)
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Nomor Telepon Seluler
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Alamat Domisili Lengkap *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="Jl. Sudirman No. 12, Jakarta Selatan, DKI Jakarta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Tautan Profil LinkedIn
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Tautan Profil GitHub
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Tautan Portofolio Web / Website Pribadi
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                    placeholder="https://myportfolio.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Headline Profesional *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
                  placeholder="Contoh: Frontend Engineer | Ex-Tech Intern at MagangHub"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                  Bio & Ringkasan Kualifikasi Diri *
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors resize-none text-xs sm:text-sm"
                  placeholder="Tuliskan perkenalan singkat, latar belakang pendidikan, dan ambisi karier Anda..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT PENDIDIKAN */}
        {activeTab === "education" && (
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Riwayat Pendidikan Terstruktur</h2>
                  <p className="text-xs text-emerald-200/70">Tambahkan jenjang sekolah/universitas yang pernah Anda tempuh.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pendidikan</span>
              </button>
            </div>

            {educationList.length === 0 ? (
              <div className="p-8 text-center bg-[#061f1d]/60 border border-dashed border-emerald-800/60 rounded-xl text-slate-400 text-xs space-y-2">
                <GraduationCap className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-300">Belum Ada Riwayat Pendidikan</p>
                <p>Klik tombol "+ Tambah Pendidikan" di atas untuk memasukkan riwayat akademik Anda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {educationList.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Jenjang Pendidikan *
                        </label>
                        <select
                          value={edu.level}
                          onChange={(e) => handleEducationChange(edu.id, "level", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="SMA/SMK">SMA / SMK / Sederajat</option>
                          <option value="D3">Diploma 3 (D3)</option>
                          <option value="S1">Sarjana (S1)</option>
                          <option value="S2">Magister (S2)</option>
                          <option value="S3">Doktor (S3)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Nama Institusi *
                        </label>
                        <input
                          type="text"
                          required
                          value={edu.school}
                          onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Universitas Indonesia"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Jurusan / Prodi *
                        </label>
                        <input
                          type="text"
                          required
                          value={edu.major}
                          onChange={(e) => handleEducationChange(edu.id, "major", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Teknik Informatika"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          IPK / Nilai Akhir
                        </label>
                        <input
                          type="text"
                          value={edu.gpa || ""}
                          onChange={(e) => handleEducationChange(edu.id, "gpa", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="3.85 / 4.00"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Tahun Masuk – Lulus *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={edu.startYear}
                            onChange={(e) => handleEducationChange(edu.id, "startYear", e.target.value)}
                            className="px-2 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                          <select
                            value={edu.endYear}
                            onChange={(e) => handleEducationChange(edu.id, "endYear", e.target.value)}
                            className="px-2 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs"
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

                    {/* Additional Education details for CV (Coursework & Thesis) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-3 border-t border-emerald-800/40">
                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Mata Kuliah Relevan (Dipisahkan Koma)
                        </label>
                        <input
                          type="text"
                          value={edu.coursework || ""}
                          onChange={(e) => handleEducationChange(edu.id, "coursework", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Pengembangan Aplikasi Web, Sistem Basis Data, UI/UX..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Judul Skripsi / Tugas Akhir (Opsional)
                        </label>
                        <input
                          type="text"
                          value={edu.thesis || ""}
                          onChange={(e) => handleEducationChange(edu.id, "thesis", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Rancang Bangun Aplikasi Monitoring..."
                        />
                      </div>
                    </div>

                    {/* Attachment / File Upload for Education */}
                    <div className="pt-2 border-t border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-200">Lampiran Ijazah / Transkrip (PDF/Gambar Max 2MB):</span>
                        {edu.mediaUrl ? (
                          <a
                            href={edu.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline bg-emerald-950 px-2 py-1 rounded border border-emerald-700/60"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{edu.mediaName || "Lihat Dokumen"}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada berkas terlampir</span>
                        )}
                      </div>

                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-xs border border-emerald-700/60 cursor-pointer transition-colors shrink-0">
                        {uploadingMediaKey === `edu-${edu.id}` ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{edu.mediaUrl ? "Ganti Berkas" : "Unggah Dokumen"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (url, name) => handleEducationMedia(edu.id, url, name),
                              `edu-${edu.id}`
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SERTIFIKASI & PELATIHAN */}
        {activeTab === "certifications" && (
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Sertifikasi & Pelatihan Profesional</h2>
                  <p className="text-xs text-emerald-200/70">Daftar lisensi, sertifikasi keahlian, atau kursus yang diselesaikan.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCertification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Sertifikasi</span>
              </button>
            </div>

            {certificationsList.length === 0 ? (
              <div className="p-8 text-center bg-[#061f1d]/60 border border-dashed border-emerald-800/60 rounded-xl text-slate-400 text-xs space-y-2">
                <Award className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-300">Belum Ada Sertifikasi</p>
                <p>Klik tombol "+ Tambah Sertifikasi" di atas untuk menyertakan kredensial Anda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificationsList.map((cert, idx) => (
                  <div
                    key={cert.id || idx}
                    className="bg-[#061f1d] border border-emerald-800/50 rounded-xl p-4 sm:p-5 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Sertifikasi #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(cert.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                        title="Hapus sertifikasi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Nama Sertifikat / Pelatihan *
                        </label>
                        <input
                          type="text"
                          required
                          value={cert.title}
                          onChange={(e) => handleCertChange(cert.id, "title", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Tipe Sertifikat
                        </label>
                        <input
                          type="text"
                          list={`cert-types-${idx}`}
                          value={cert.certType || ""}
                          onChange={(e) => handleCertChange(cert.id, "certType", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Ketik tipe (misal: Certificate of Completion)"
                        />
                        <datalist id={`cert-types-${idx}`}>
                          {CERT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Lembaga Penerbit *
                        </label>
                        <input
                          type="text"
                          required
                          value={cert.issuer}
                          onChange={(e) => handleCertChange(cert.id, "issuer", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Amazon Web Services / Dicoding"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-2 border-t border-emerald-800/40">
                      {/* Waktu Perolehan */}
                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          Waktu Perolehan (Bulan & Tahun) *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={cert.issueMonth || "Januari"}
                            onChange={(e) => handleCertChange(cert.id, "issueMonth", e.target.value)}
                            className="px-2.5 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>

                          <select
                            value={cert.issueYear || CURRENT_YEAR.toString()}
                            onChange={(e) => handleCertChange(cert.id, "issueYear", e.target.value)}
                            className="px-2.5 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Masa Kadaluarsa */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-emerald-300">
                            Masa Kadaluarsa
                          </label>
                          <label className="flex items-center gap-1 text-[11px] text-emerald-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cert.noExpiry || false}
                              onChange={(e) => handleCertChange(cert.id, "noExpiry", e.target.checked)}
                              className="w-3.5 h-3.5 accent-emerald-600 rounded"
                            />
                            <span>Selamanya</span>
                          </label>
                        </div>

                        {!cert.noExpiry ? (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={cert.expiryMonth || "Desember"}
                              onChange={(e) => handleCertChange(cert.id, "expiryMonth", e.target.value)}
                              className="px-2.5 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>

                            <select
                              value={cert.expiryYear || (CURRENT_YEAR + 3).toString()}
                              onChange={(e) => handleCertChange(cert.id, "expiryYear", e.target.value)}
                              className="px-2.5 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                              {EXPIRY_YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Berlaku Selamanya
                          </div>
                        )}
                      </div>

                      {/* URL Kredensial */}
                      <div>
                        <label className="block text-xs font-medium text-emerald-300 mb-1">
                          URL Kredensial / Sertifikat Online
                        </label>
                        <input
                          type="url"
                          value={cert.credentialUrl || ""}
                          onChange={(e) => handleCertChange(cert.id, "credentialUrl", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="https://credential.net/..."
                        />
                      </div>
                    </div>

                    {/* Attachment / File Upload for Certification */}
                    <div className="pt-2 border-t border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-200">Berkas Sertifikat (PDF/Gambar Max 2MB):</span>
                        {cert.mediaUrl ? (
                          <a
                            href={cert.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline bg-emerald-950 px-2 py-1 rounded border border-emerald-700/60"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{cert.mediaName || "Lihat Sertifikat"}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada berkas terlampir</span>
                        )}
                      </div>

                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-xs border border-emerald-700/60 cursor-pointer transition-colors shrink-0">
                        {uploadingMediaKey === `cert-${cert.id}` ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{cert.mediaUrl ? "Ganti Berkas" : "Unggah Sertifikat"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (url, name) => handleCertMedia(cert.id, url, name),
                              `cert-${cert.id}`
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RIWAYAT PENGALAMAN KERJA / MAGANG */}
        {activeTab === "experience" && (
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Riwayat Pengalaman Kerja / Magang</h2>
                  <p className="text-xs text-emerald-200/70">Pilih periode bulan dan tahun menggunakan dropdown interaktif di bawah.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pengalaman</span>
              </button>
            </div>

            {experienceStateList.length === 0 ? (
              <div className="p-8 text-center bg-[#061f1d]/60 border border-dashed border-emerald-800/60 rounded-xl text-slate-400 text-xs space-y-2">
                <Briefcase className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-300">Belum Ada Riwayat Pengalaman Kerja</p>
                <p>Klik tombol "+ Tambah Pengalaman" untuk melengkapi riwayat profesional Anda.</p>
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
                          Nama Perusahaan / Instansi / Organisasi *
                        </label>
                        <input
                          type="text"
                          required
                          value={exp.company}
                          onChange={(e) => handleExpFieldChange(exp.id, "company", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="BPJS Kesehatan / Universitas Sriwijaya"
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
                          className="w-full px-3 py-2 rounded-lg bg-[#0c2b29] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                          placeholder="Software Engineer Intern"
                        />
                      </div>

                      {/* Interactive Month & Year Picker */}
                      <div className="sm:col-span-2 bg-[#0c2b29]/90 border border-emerald-800/60 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          Periode Waktu Kerja (Pemilih Bulan & Tahun Interaktif)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Start Month & Year */}
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Mulai Bekerja *</label>
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

                          {/* End Month & Year */}
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Selesai Bekerja *</label>
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
                          placeholder="Jelaskan peran utama, teknologi yang digunakan, serta pencapaian kunci..."
                        />
                      </div>
                    </div>

                    {/* Attachment / File Upload for Experience */}
                    <div className="pt-2 border-t border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-emerald-200">Surat Keterangan Kerja / Paklaring (PDF/Gambar Max 2MB):</span>
                        {exp.mediaUrl ? (
                          <a
                            href={exp.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline bg-emerald-950 px-2 py-1 rounded border border-emerald-700/60"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{exp.mediaName || "Lihat Surat Keterangan"}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada berkas terlampir</span>
                        )}
                      </div>

                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-xs border border-emerald-700/60 cursor-pointer transition-colors shrink-0">
                        {uploadingMediaKey === `exp-${exp.id}` ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{exp.mediaUrl ? "Ganti Berkas" : "Unggah Surat Keterangan"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (url, name) => handleExpMedia(exp.id, url, name),
                              `exp-${exp.id}`
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: KEAHLIAN & KETERAMPILAN (SKILLS) */}
        {activeTab === "skills" && (
          <div className="bg-[#0c2b29] border border-emerald-800/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Form Keahlian & Technical Skills</h2>
                <p className="text-xs text-emerald-200/70">Tambahkan skill teknis atau soft-skill dalam bentuk badge interaktif.</p>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                  placeholder="Ketik nama skill (contoh: React, Python, Project Management) lalu tekan Tambah"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Rekomendasi Skill Populer (Klik untuk Menambahkan):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILL_TAGS.map((tag) => {
                    const isAdded = skillsList.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddSkill(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isAdded
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80 cursor-default opacity-70"
                            : "bg-[#061f1d] hover:bg-emerald-900/60 text-slate-300 hover:text-white border border-emerald-800/40"
                        }`}
                      >
                        {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Added Skills List */}
              <div className="pt-4 border-t border-emerald-800/40 space-y-2">
                <p className="text-xs font-semibold text-white">Skill Dikuasai ({skillsList.length}):</p>
                {skillsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada keahlian ditambahkan.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061f1d] border border-emerald-700/60 text-emerald-200 text-xs font-semibold shadow-sm animate-fade-in"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-400 transition-colors ml-1 text-sm font-bold"
                          title="Hapus skill ini"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rincian Kategori Informasi Tambahan (CV MagangHub Format) */}
              <div className="pt-6 border-t border-emerald-800/40 space-y-4">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Rincian Kategori Resume (MagangHub Standard)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 mb-1">
                      Hard Skills (Keahlian Teknis)
                    </label>
                    <textarea
                      rows={3}
                      value={hardSkills}
                      onChange={(e) => setHardSkills(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      placeholder="Data Analysis (SQL, Power BI), Web Development (Laravel, React, Next.js), Python..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 mb-1">
                      Soft Skills (Keterampilan Interpersonal)
                    </label>
                    <textarea
                      rows={3}
                      value={softSkills}
                      onChange={(e) => setSoftSkills(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      placeholder="Pemecahan Masalah, Berpikir Kritis, Kerja Tim, Manajemen Waktu..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 mb-1">
                      Kemampuan Bahasa (Languages)
                    </label>
                    <textarea
                      rows={3}
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#061f1d] border border-emerald-800/60 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      placeholder="Indonesia (fluent), English (intermediate)..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DOKUMEN CV UTAMA */}
        {activeTab === "cv" && (
          <ResumeUploader
            currentResumeUrl={initialProfile.resume_url}
            currentResumeName={initialProfile.resume_name}
          />
        )}

        {/* TAB 7: GENERATE RESUME / PRATINJAU CV OTOMATIS */}
        {activeTab === "generate_cv" && (
          <ResumeGenerator
            profile={{
              ...initialProfile,
              full_name: fullName,
              email: initialProfile.email,
              whatsapp: whatsapp,
              address: address,
              headline: headline,
              bio: bio,
              linkedin_url: linkedinUrl,
              portfolio_url: portfolioUrl,
              github_url: githubUrl,
              education: educationList,
              certifications: certificationsList,
              experience: experienceStateList.map((exp) => ({
                ...exp,
                period: exp.isCurrent
                  ? `${exp.startMonth} ${exp.startYear} – Sekarang`
                  : `${exp.startMonth} ${exp.startYear} – ${exp.endMonth} ${exp.endYear}`,
              })),
              skills: skillsList,
            }}
          />
        )}

        {/* Floating Save Button */}
        <div className="sticky bottom-4 z-20 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan Seluruh Data Profil ke Database...</span>
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
    </div>
  );
}
