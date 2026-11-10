import React from "react";
import { CheckCircle, AlertTriangle, Sparkles, Award } from "lucide-react";

interface AutoTagBadgeProps {
  tag: string;
}

export default function AutoTagBadge({ tag }: AutoTagBadgeProps) {
  const isDanger = tag.toLowerCase().includes("bawah minimum") || tag.toLowerCase().includes("kurang");
  const isWarning = tag.toLowerCase().includes("pertimbangan") || tag.toLowerCase().includes("pending");

  let tagStyles = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/50";
  let Icon = CheckCircle;

  if (isDanger) {
    tagStyles = "bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600/60";
    Icon = AlertTriangle;
  } else if (isWarning) {
    tagStyles = "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/50";
    Icon = AlertTriangle;
  } else if (tag.toLowerCase().includes("top univ")) {
    tagStyles = "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600/50";
    Icon = Award;
  } else if (tag.toLowerCase().includes("skilled") || tag.toLowerCase().includes("match")) {
    tagStyles = "bg-slate-100 dark:bg-teal-950/80 text-slate-700 dark:text-teal-300 border-slate-300 dark:border-teal-600/50";
    Icon = Sparkles;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${tagStyles}`}
    >
      <Icon className="w-2.5 h-2.5 shrink-0" />
      <span>{tag}</span>
    </span>
  );
}
