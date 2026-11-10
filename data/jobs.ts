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
