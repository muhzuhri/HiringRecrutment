"use client";

import React, { useState } from "react";
import { updateStaffSelfProfile } from "@/app/actions/admin";
import { CandidateProfile } from "@/types/candidate";
import {
  User,
  Mail,
  Shield,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Key,
  Award,
  Sparkles,
} from "lucide-react";

interface AdminProfileFormProps {
  profile: CandidateProfile | null;
}

export default function AdminProfileForm({ profile }: AdminProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isHr = profile?.role === "admin" || profile?.role === "hr";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Nama lengkap tidak boleh kosong.");
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    const res = await updateStaffSelfProfile({
      full_name: fullName.trim(),
      phone: phone.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
      password: password.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      setStatusMsg("Profil akun berhasil diperbarui.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui profil.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {statusMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 dark:bg-emerald-900 border border-slate-700 dark:border-emerald-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-rose-950 border border-rose-600 text-rose-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700/50 text-xs font-semibold text-slate-700 dark:text-emerald-300">
            <User className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
            Pengaturan Akun Staf
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Profil Saya
          </h1>
          <p className="text-xs text-slate-500 dark:text-emerald-200/80">
            Perbarui data identitas pribadi, informasi kontak, dan kata sandi akun internal Anda.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4 transition-colors">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm ${
          isHr
            ? "bg-teal-600 text-white"
            : "bg-purple-600 text-white"
        }`}>
          {fullName ? fullName.charAt(0).toUpperCase() : "S"}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base truncate">{fullName || "Staf Nexora"}</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                isHr
                  ? "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800"
                  : "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
              }`}
            >
              {isHr ? <Shield className="w-3 h-3" /> : <Award className="w-3 h-3" />}
              <span>{isHr ? "Tim HR & Recruiter" : "Tim Penilai & Assessor"}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-emerald-300/80 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile?.email || "staf@talenthub.com"}</span>
          </p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-6 shadow-sm space-y-5 transition-colors text-xs">
        <div className="border-b border-slate-200 dark:border-emerald-800/40 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Informasi Identitas & Kontak</h3>
          <p className="text-[11px] text-slate-500 dark:text-emerald-300/70">Data yang ditampilkan pada saat penjadwalan dan evaluasi kandidat.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
              placeholder="Contoh: Sarah Wijaya"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
              placeholder="Contoh: 081234567890"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
            Email Akun (Tidak Dapat Diubah)
          </label>
          <input
            type="email"
            disabled
            value={profile?.email || ""}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed"
          />
        </div>

        <div className="border-b border-slate-200 dark:border-emerald-800/40 pb-3 pt-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ganti Kata Sandi (Opsional)</h3>
          <p className="text-[11px] text-slate-500 dark:text-emerald-300/70">Biarkan kosong jika Anda tidak ingin mengubah kata sandi.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Simpan Perubahan Profil</span>
          </button>
        </div>
      </form>
    </div>
  );
}
