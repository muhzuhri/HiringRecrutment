import React from "react";
import { ApplicationStatus } from "@/types/candidate";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  let badgeStyles = "";
  let iconSymbol = "";
  const s = (status || "").toLowerCase();

  if (s === "diajukan" || s === "applied") {
    // 1. Blue - Diajukan
    badgeStyles =
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40";
    iconSymbol = "📄";
  } else if (s === "screening hr" || s === "screening" || s === "diproses" || s === "in review") {
    // 2. Amber - Screening HR
    badgeStyles =
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40";
    iconSymbol = "🔍";
  } else if (s.includes("assessment") || s.includes("tes") || s.includes("technical") || s.includes("psikotes")) {
    // 3. Purple - Assessment / Tes
    badgeStyles =
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/40";
    iconSymbol = "📝";
  } else if (s === "interview user") {
    // 5. Cyan - Interview User
    badgeStyles =
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/40";
    iconSymbol = "👥";
  } else if (s.includes("interview")) {
    // 4. Indigo - Interview HR
    badgeStyles =
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40";
    iconSymbol = "🎙️";
  } else if (s === "diterima" || s === "offered" || s === "hired") {
    // 6. Emerald - Diterima
    badgeStyles =
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40";
    iconSymbol = "🎉";
  } else if (s === "ditolak" || s === "rejected") {
    // Rose - Ditolak
    badgeStyles =
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40";
    iconSymbol = "❌";
  } else {
    badgeStyles =
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    iconSymbol = "📌";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-semibold",
    lg: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${sizeClasses} ${badgeStyles}`}
    >
      <span className="text-xs leading-none shrink-0">{iconSymbol}</span>
      <span className="capitalize">{status}</span>
    </span>
  );
}
