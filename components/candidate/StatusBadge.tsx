import React from "react";
import { ApplicationStatus } from "@/types/candidate";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  let badgeStyles = "";
  let iconSymbol = "";

  switch (status) {
    case "Applied":
      // Kuning / Amber
      badgeStyles = "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-900/20";
      iconSymbol = "📄";
      break;

    case "In Review":
      // Biru / Blue
      badgeStyles = "bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-blue-900/20";
      iconSymbol = "🔍";
      break;

    case "Interview":
      // Ungu / Purple
      badgeStyles = "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-purple-900/20";
      iconSymbol = "🎙️";
      break;

    case "Offered":
      // Hijau / Emerald
      badgeStyles = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-900/20";
      iconSymbol = "🎉";
      break;

    case "Hired":
      // Teal / Emerald Deep
      badgeStyles = "bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-teal-900/20";
      iconSymbol = "🏆";
      break;

    case "Rejected":
      // Merah / Red
      badgeStyles = "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-900/20";
      iconSymbol = "❌";
      break;

    default:
      badgeStyles = "bg-slate-700/40 text-slate-300 border-slate-600/40";
      iconSymbol = "📌";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs sm:text-sm gap-2 font-semibold",
    lg: "px-4 py-1.5 text-sm sm:text-base gap-2 font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md shadow-sm transition-all duration-200 ${badgeStyles} ${sizeClasses}`}
    >
      <span className="text-xs sm:text-sm">{iconSymbol}</span>
      <span>{status}</span>
    </span>
  );
}
