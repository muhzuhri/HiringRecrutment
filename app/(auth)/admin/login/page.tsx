"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { adminSignInAction, AuthActionResult } from "@/app/actions/auth";
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
  Sparkles,
  User,
} from "lucide-react";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionResult | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen bg-[#061f1d] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white p-1.5 border border-emerald-700/60 shadow-xl flex items-center justify-center">
              <img
                src="/nexora-logo.jpg"
                alt="Nexora Digital Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c2b29] border border-emerald-700/60 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Nexora Digital · Portal Staf
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Masuk Portal HR & Penilai
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Khusus Recruiter, HR Admin, dan Tim Penilai untuk evaluasi seleksi internal.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c2b29] border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {state && !state.success && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-100">Gagal Masuk</p>
                <p className="mt-0.5">{state.message}</p>
              </div>
            </div>
          )}

          {state && state.success && (
            <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div>
                <p className="font-bold text-emerald-100">Autentikasi Berhasil!</p>
                <p className="mt-0.5 text-emerald-300">{state.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                Alamat Email atau Username Staf
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-emerald-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="muhzhrii atau penilai@talenthub.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#061f1d] border border-emerald-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bisa menggunakan username Anda (<strong>muhzhrii</strong>) atau alamat email resmi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#061f1d] border border-emerald-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || (state?.success === true)}
              className="w-full mt-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPending || state?.success ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{state?.success ? "Mengalihkan ke Portal..." : "Memverifikasi Akun..."}</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem Staf</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="border-t border-emerald-800/60 pt-4 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Pilihan Akun Uji Coba Cepat:
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillCredentials("muhzhrii", "")}
                className="p-2 rounded-xl bg-[#061f1d] hover:bg-emerald-900/40 border border-emerald-700/60 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-amber-300 font-bold text-[10px]">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">Akun Anda</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1 truncate">muhzhrii</p>
                <span className="text-[9px] text-amber-400 font-semibold">Admin HR</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("penilai@talenthub.com", "Penilai123!")}
                className="p-2 rounded-xl bg-[#061f1d] hover:bg-emerald-900/40 border border-emerald-700/60 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-emerald-300 font-bold text-[10px]">
                  <ClipboardCheck className="w-3 h-3 shrink-0" />
                  <span className="truncate">Akun Penilai</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1 truncate">penilai@talenthub</p>
                <span className="text-[9px] text-emerald-400 font-semibold">Interviewer</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials("admin@talenthub.com", "Admin123!")}
                className="p-2 rounded-xl bg-[#061f1d] hover:bg-emerald-900/40 border border-emerald-700/60 text-left transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-1 text-teal-300 font-bold text-[10px]">
                  <Briefcase className="w-3 h-3 shrink-0" />
                  <span className="truncate">HR Admin</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold mt-1 truncate">admin@talenthub</p>
                <span className="text-[9px] text-teal-400 font-semibold">Recruiter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link to Candidate Portal */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            Bukan staf HR atau Penilai?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              Masuk melalui Portal Pelamar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
