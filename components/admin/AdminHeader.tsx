"use client";

import React from "react";
import Link from "next/link";
import { CandidateProfile } from "@/types/candidate";
import { ShieldCheck, UserCheck, Search, Bell, Sparkles } from "lucide-react";

interface AdminHeaderProps {
  userEmail: string;
  profile?: CandidateProfile | null;
}

export default function AdminHeader({ userEmail, profile }: AdminHeaderProps) {
  const displayName = profile?.full_name || userEmail.split("@")[0] || "Recruiter HR";

  return (
    <header className="bg-[#0c2b29] border-b border-emerald-800/40 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-md">
      {/* Search Input Placeholder */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          HR Portal System Active
        </span>
      </div>

      {/* User Info & Navigation */}
      <div className="flex items-center gap-4">


        <div className="h-4 w-px bg-emerald-800/60" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-bold text-white">{displayName}</p>
            <p className="text-[10px] text-emerald-400 font-semibold">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
