"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { adminSignInAction, AuthActionResult } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Briefcase,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionResult | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Pastikan sesi login sebelumnya dibersihkan saat masuk ke halaman ini agar staf wajib login ulang
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.signOut();
    } catch {
      // ignore
    }
  }, []);

  // Instant redirect listener when login succeeds
  useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await adminSignInAction(null, formData);
      setState(result);
      if (result.success && result.redirectTo) {
        // Immediate redirect without hanging or delay
        window.location.href = result.redirectTo;
      }
    });
  };

  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setState(null);
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative Floating Cubes matching Candidate Login */}
      <div
        className="geo-cube animate-float w-32 h-32 top-16 right-[8%] opacity-30 fixed pointer-events-none"
        style={{ borderColor: "rgba(21, 128, 61, 0.25)" }}
      />
      <div
        className="geo-cube animate-float-2 w-24 h-24 bottom-16 left-[6%] opacity-25 fixed pointer-events-none"
        style={{ borderColor: "rgba(12, 43, 41, 0.3)" }}
      />

      <div className="w-full max-w-md relative z-10 my-6 space-y-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white p-1 border border-slate-700/40 shadow-md transition-transform group-hover:scale-105 flex items-center justify-center">
              <img
                src="/nexora-icon-trans.png"
                alt="Nexora Digital"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "#132238" }}
            >
              Nexora<span style={{ color: "#0F766E" }}> Digital</span>
            </span>
          </Link>

          

        
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-7 sm:p-8 border border-emerald-900/10 shadow-xl shadow-emerald-950/5 space-y-5">
          {/* Notification Banners */}
          {state && !state.success && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Gagal Masuk</p>
                <p className="mt-0.5 text-xs text-rose-700">{state.message}</p>
              </div>
            </div>
          )}

          {state && state.success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">Autentikasi Berhasil!</p>
                <p className="mt-0.5 text-xs text-emerald-800">Mengalihkan ke portal Anda...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Email 
              </label>
              <div className="relative flex items-center">
                {/* <UserCheck className="w-4 h-4 text-slate-400 absolute left-4 z-10" /> */}
                <input
                  type="text"
                  name="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="form-input pl-11 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative flex items-center">
                {/* <Lock className="w-4 h-4 text-slate-400 absolute left-4 z-10" /> */}
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-11 pr-11 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-emerald-700 p-1 rounded-md transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || state?.success === true}
              className="btn-primary w-full py-3.5 text-base shadow-lg shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer mt-1"
              style={{ background: "#132238" }}
            >
              {isPending || state?.success ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{state?.success ? "Mengalihkan ke Portal..." : "Memverifikasi Akun..."}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Masuk ke Sistem Staf</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="border-t border-slate-200/80 pt-4 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Pilihan Akun Uji Coba Cepat:
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillCredentials("muhzhrii", "")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-amber-700 font-bold text-[10px]">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">Akun Anda</span>
                </div>
                <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">muhzhrii</p>
                <span className="text-[9px] text-amber-600 font-bold">Admin HR</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("penilai@talenthub.com", "Penilai123!")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-teal-700 font-bold text-[10px]">
                  <ClipboardCheck className="w-3 h-3 shrink-0" />
                  <span className="truncate">Akun Penilai</span>
                </div>
                <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">penilai@talenthub</p>
                <span className="text-[9px] text-teal-600 font-bold">Interviewer</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("admin@talenthub.com", "Admin123!")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                  <Briefcase className="w-3 h-3 shrink-0" />
                  <span className="truncate">HR Admin</span>
                </div>
                <p className="text-[11px] text-slate-800 font-semibold mt-1 truncate">admin@talenthub</p>
                <span className="text-[9px] text-emerald-600 font-bold">Recruiter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Link to Candidate Portal */}
        <div className="text-center space-y-2">
          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Sesi Otentikasi Staf Terenkripsi SSL 256-bit
          </p>

          <p className="text-xs text-slate-600 font-medium">
            Bukan staf HR atau Penilai?{" "}
            <Link
              href="/login"
              className="font-bold text-teal-800 hover:text-teal-950 underline underline-offset-2"
            >
              Masuk melalui Portal Pelamar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
