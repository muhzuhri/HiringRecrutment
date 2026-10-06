"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, type AuthActionResult } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionResult | null>(null);

  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const strengthScore = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUpAction(null, formData);
      setState(result);
      if (result.success && result.redirectTo) {
        setTimeout(() => {
          router.push(result.redirectTo!);
        }, 1500);
      }
    });
  };

  const handleOAuthSignUp = async (provider: "google" | "linkedin_oidc") => {
    setSocialLoading(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setState({
          success: false,
          message: `Gagal login dengan ${provider}: ${error.message}`,
        });
      }
    } catch {
      setState({
        success: false,
        message: "Terjadi kesalahan saat menghubungkan ke layanan sosial.",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div
        className="geo-cube animate-float w-32 h-32 top-16 right-[8%] opacity-30 fixed pointer-events-none"
        style={{ borderColor: "rgba(21, 128, 61, 0.25)" }}
      />
      <div
        className="geo-cube animate-float-2 w-24 h-24 bottom-16 left-[6%] opacity-25 fixed pointer-events-none"
        style={{ borderColor: "rgba(12, 43, 41, 0.3)" }}
      />

      <div className="w-full max-w-lg relative z-10 my-6">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #15803d 0%, #0c2b29 100%)" }}
            >
              <svg className="w-6 h-6 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "#0c2b29" }}
            >
              Talent<span style={{ color: "#15803d" }}>Hub</span>
            </span>
          </Link>

          <h1
            className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "#0c2b29" }}
          >
            Buat Akun Kandidat
          </h1>
          <p className="text-slate-600 text-sm max-w-sm mx-auto">
            Bergabunglah dengan ribuan talenta dan lamar posisi impian Anda hari ini.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-emerald-900/10 shadow-xl shadow-emerald-950/5">
          {/* Notification Banners */}
          {state && !state.success && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Gagal Mendaftar</p>
                <p className="mt-0.5">{state.message}</p>
              </div>
            </div>
          )}

          {state && state.success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">Pendaftaran Berhasil!</p>
                <p className="mt-0.5">{state.message}</p>
              </div>
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-firstname" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Depan <span className="text-emerald-600">*</span>
                </label>
                <input
                  id="register-firstname"
                  type="text"
                  name="firstname"
                  placeholder="Contoh: Budi"
                  className="form-input transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-lastname" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Belakang
                </label>
                <input
                  id="register-lastname"
                  type="text"
                  name="lastname"
                  placeholder="Contoh: Santoso"
                  className="form-input transition-all"
                />
              </div>
            </div>

            {/* Email Field with fixed padding & lucide icon */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Email <span className="text-emerald-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="nama@domain.com"
                  className="form-input pl-11 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="register-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nomor WhatsApp / Telepon
              </label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 border rounded-xl text-sm font-medium text-slate-700 bg-slate-50 shrink-0"
                  style={{ borderColor: "rgba(21, 128, 61, 0.2)" }}
                >
                  <span className="text-base">🇮🇩</span> +62
                </div>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  placeholder="812 3456 7890"
                  className="form-input flex-1 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kata Sandi <span className="text-emerald-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="form-input pl-11 pr-11 transition-all"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-emerald-700 p-1 rounded-md transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          strengthScore >= level
                            ? strengthScore <= 1
                              ? "bg-rose-500"
                              : strengthScore === 2
                              ? "bg-amber-500"
                              : strengthScore === 3
                              ? "bg-emerald-500"
                              : "bg-emerald-700"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex justify-between">
                    <span>Kekuatan kata sandi:</span>
                    <span className="font-semibold text-slate-700">
                      {strengthScore <= 1 ? "Lemah" : strengthScore === 2 ? "Sedang" : strengthScore === 3 ? "Kuat" : "Sangat Kuat"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi <span className="text-emerald-600">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="form-input pl-11 pr-11 transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-emerald-700 p-1 rounded-md transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">Kata sandi belum cocok</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="register-terms"
                type="checkbox"
                name="terms"
                required
                className="w-4 h-4 accent-emerald-800 rounded mt-0.5 shrink-0 border-slate-300 cursor-pointer"
              />
              <label htmlFor="register-terms" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
                Saya menyetujui{" "}
                <Link href="/terms" className="text-emerald-800 font-bold hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="text-emerald-800 font-bold hover:underline">
                  Kebijakan Privasi
                </Link>{" "}
                TalentHub.
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 text-base shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{ background: "#0c2b29" }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses Pendaftaran...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Daftar Akun Sekarang
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          

          {/* Existing account link */}
          <p className="text-center text-xs text-slate-600 mt-6 font-medium">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="text-emerald-800 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Security Footer */}
        <p className="text-center text-xs text-slate-500 mt-5 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Keamanan Terjamin & Encrypted dengan Supabase Auth SSL
        </p>
      </div>
    </div>
  );
}
