"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, type AuthActionResult } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionResult | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Check URL error or verified query parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const verifiedParam = searchParams.get("verified");
    if (errorParam) {
      setState({
        success: false,
        message: errorParam,
      });
    } else if (verifiedParam) {
      setState({
        success: true,
        message: "Email Anda berhasil diverifikasi! Silakan masuk ke akun Anda.",
      });
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signInAction(null, formData);
      setState(result);
      if (result.success && result.redirectTo) {
        const redirectPath = searchParams.get("redirect") || result.redirectTo;
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      }
    });
  };

  const handleOAuthSignIn = async (provider: "google" | "linkedin_oidc") => {
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
        message: "Terjadi kesalahan saat menghubungkan ke layanan autentikasi.",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-emerald-900/10 shadow-xl shadow-emerald-950/5">
      {/* Notification Banners */}
      {state && !state.success && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-fade-in-up">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-red-800">Gagal Masuk</p>
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
            <p className="font-semibold text-emerald-950">Autentikasi Berhasil!</p>
            <p className="mt-0.5">{state.message}</p>
          </div>
        </div>
      )}

      <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Alamat Email
          </label>
          <div className="relative">
            <input
              id="login-email"
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Kata Sandi
            </label>
            <Link href="/forgot-password" className="text-xs text-emerald-800 font-bold hover:underline">
              Lupa Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              className="form-input pr-10 transition-all"
              required
              autoComplete="current-password"
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
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="remember-me"
            type="checkbox"
            name="remember"
            className="w-4 h-4 accent-emerald-800 rounded border-slate-300 cursor-pointer"
          />
          <label htmlFor="remember-me" className="text-xs text-slate-600 cursor-pointer font-medium">
            Ingat Sesi Saya (30 Hari)
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="login-submit-btn"
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
              Memverifikasi Akun...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Masuk ke Akun
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      

      {/* Register Link */}
      <p className="text-center text-xs text-slate-600 mt-6 font-medium">
        Belum memiliki akun kandidat?{" "}
        <Link href="/register" className="text-emerald-800 font-bold hover:underline">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Cubes */}
      <div
        className="geo-cube animate-float w-32 h-32 top-16 right-[8%] opacity-30 fixed pointer-events-none"
        style={{ borderColor: "rgba(21, 128, 61, 0.25)" }}
      />
      <div
        className="geo-cube animate-float-2 w-24 h-24 bottom-16 left-[6%] opacity-25 fixed pointer-events-none"
        style={{ borderColor: "rgba(12, 43, 41, 0.3)" }}
      />

      <div className="w-full max-w-md relative z-10 my-6">
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
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-600 text-sm">
            Masuk untuk melacak lamaran kerja & update status pendaftaran Anda.
          </p>
        </div>

        {/* Suspense Wrapper for searchParams */}
        <Suspense
          fallback={
            <div className="bg-white/95 rounded-2xl p-8 border border-slate-200 shadow-xl flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
                <div className="w-5 h-5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                Memuat Form Login...
              </div>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-500 mt-5 flex items-center justify-center gap-1.5 font-medium">
          <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Sesi Otentikasi Terenkripsi SSL 256-bit
        </p>
      </div>
    </div>
  );
}
