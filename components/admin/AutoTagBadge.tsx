import React from "react";
import { CheckCircle, AlertTriangle, Sparkles, Award } from "lucide-react";

interface AutoTagBadgeProps {
  tag: string;
}

export default function AutoTagBadge({ tag }: AutoTagBadgeProps) {
  const isDanger = tag.toLowerCase().includes("bawah minimum") || tag.toLowerCase().includes("kurang");
  const isWarning = tag.toLowerCase().includes("pertimbangan") || tag.toLowerCase().includes("pending");

  let tagStyles = "bg-emerald-950/80 text-emerald-300 border-emerald-600/50";
  let Icon = CheckCircle;

  if (isDanger) {
    tagStyles = "bg-rose-950/90 text-rose-300 border-rose-600/60";
    Icon = AlertTriangle;
  } else if (isWarning) {
    tagStyles = "bg-amber-950/80 text-amber-300 border-amber-600/50";
    Icon = AlertTriangle;
  } else if (tag.toLowerCase().includes("top univ")) {
    tagStyles = "bg-purple-950/80 text-purple-300 border-purple-600/50";
    Icon = Award;
  } else if (tag.toLowerCase().includes("skilled") || tag.toLowerCase().includes("match")) {
    tagStyles = "bg-teal-950/80 text-teal-300 border-teal-600/50";
    Icon = Sparkles;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border shadow-xs ${tagStyles}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{tag}</span>
    </span>
  );
}
