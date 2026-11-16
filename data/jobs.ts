// ===== DATA: JOBS (DEFINISI TIPE & MAPPING - ZERO DUMMY DATA) =====
export type JobType = "Full-time" | "Contract" | "Part-time" | "WFH" | "WFO" | "Hybrid";

export interface Job {
  id: string;
  title: string;
  dept: string;
  type: string;
  location: string;
  salary: string;
  posted: string;
  deadline: string;
  deptColor: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  niceToHave?: string[];
  quota?: number;
  applicant_count?: number;
  created_at?: string;
  updated_at?: string;
  reopened_at?: string;
  posted_date?: string;
  deadline_date?: string;
}

export function extractQuota(description?: string, dbQuota?: number | null): number {
  if (typeof dbQuota === "number" && !isNaN(dbQuota) && dbQuota > 0) {
    return dbQuota;
  }
  if (!description) return 5;
  const match = description.match(/\[Kuota:\s*(\d+)\s*(?:orang|kandidat)?\]/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 5;
}

export function extractApplicantCount(description?: string, appCount?: number | null): number {
  if (typeof appCount === "number" && !isNaN(appCount) && appCount > 0) {
    return appCount;
  }
  if (!description) return 0;
  const match = description.match(/\[Pelamar:\s*(\d+)\]/i);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val)) return val;
  }
  return 0;
}

export function cleanJobDescription(description?: string): string {
  if (!description) return "";
  return description
    .replace(/\[Kuota:\s*\d+\s*(?:orang|kandidat)?\]/gi, "")
    .replace(/\[Pelamar:\s*\d+\]/gi, "")
    .trim();
}

/**
 * Array allJobs dikosongkan (zero dummy data).
 * Seluruh data lowongan diambil secara murni dan dinamis dari tabel Supabase 'jobs'.
 */
export const allJobs: Job[] = [];

export const departments = [
  "Semua",
  "Engineering",
  "Marketing",
  "Human Resources",
  "Design",
  "Finance",
  "Data & Analytics",
  "Operations",
];

export const typeColors: Record<string, string> = {
  "Full-time": "bg-green-50 text-green-700",
  Contract: "bg-amber-50 text-amber-700",
  "Part-time": "bg-sky-50 text-sky-700",
  WFH: "bg-purple-50 text-purple-700",
  WFO: "bg-blue-50 text-blue-700",
  Hybrid: "bg-emerald-50 text-emerald-700",
};
