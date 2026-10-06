"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, type AuthActionResult } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

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
      {/* Decorative background blobs/cubes in Dark Teal */}
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 1 ? "text-white shadow-md shadow-emerald-900/20" : "text-slate-400 bg-slate-100"
                }`}
                style={step === 1 ? { background: "#0c2b29" } : {}}
              >
                {step}
              </div>
              {step < 3 && (
                <div className={`h-0.5 w-8 rounded ${step === 1 ? "bg-emerald-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-medium text-emerald-800 mb-6">
          Langkah 1 dari 3 – Pendaftaran Akun Utama
        </p>

        {/* Card Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-emerald-900/10 shadow-xl shadow-emerald-950/5">
          {/* Notification Banners */}
          {state && !state.success && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in-up">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800">Gagal Mendaftar</p>
                <p className="mt-0.5">{state.message}</p>
              </div>
            </div>
          )}

          {state && state.success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in-up">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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

            {/* Email Field */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Email <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="nama@domain.com"
                  className="form-input pl-10 transition-all"
                  required
                  autoComplete="email"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="form-input pr-10 transition-all"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 p-1 rounded-md transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.97 8.97 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
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
                              ? "bg-red-500"
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
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="form-input pr-10 transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 p-1 rounded-md transition-colors"
                  aria-label="Toggle visibility"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.97 8.97 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">Kata sandi belum cocok</p>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Social Register Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Atau Daftar Dengan</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="register-with-google"
              type="button"
              onClick={() => handleOAuthSignUp("google")}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:border-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 shadow-sm"
            >
              {socialLoading === "google" ? (
                <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Google
            </button>

            <button
              id="register-with-linkedin"
              type="button"
              onClick={() => handleOAuthSignUp("linkedin_oidc")}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:border-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 shadow-sm"
            >
              {socialLoading === "linkedin_oidc" ? (
                <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              )}
              LinkedIn
            </button>
          </div>

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
          <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Keamanan Terjamin & Encrypted dengan Supabase Auth SSL
        </p>
      </div>
    </div>
  );
}
