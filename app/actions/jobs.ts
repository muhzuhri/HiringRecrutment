"use server";

import { createClient } from "@/lib/supabase/server";
import { Job } from "@/data/jobs";

/**
 * Fetch all job postings strictly from Supabase 'jobs' table.
 * Zero dummy data fallback: returns empty array if no jobs exist in DB.
 */
export async function getJobsFromSupabase(
  deptFilter?: string,
  searchQuery?: string
): Promise<{ jobs: Job[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (deptFilter && deptFilter !== "Semua") {
      query = query.eq("dept", deptFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return { jobs: [] };
    }

    // Filter out closed and expired jobs (pass deadline date)
    const activeData = data.filter((row: any) => {
      if (row.status && (row.status.toLowerCase() === "closed" || row.status.toLowerCase() === "nonaktif")) {
        return false;
      }
      if (row.deadline_date && new Date(row.deadline_date) < new Date()) {
        return false;
      }
      return true;
    });

    // Map DB rows to Job interface
    const mappedJobs: Job[] = activeData.map((row: any) => ({
      id: String(row.id),
      title: row.title,
      dept: row.dept,
      type: row.type || "Hybrid",
      location: row.location || "Jakarta, Hybrid",
      salary: row.salary || "Sesuai Standar Perusahaan",
      posted: new Date(row.posted_date || row.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      deadline: row.deadline_date
        ? new Date(row.deadline_date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Sesuai Kebijakan HR",
      deptColor: getDeptColor(row.dept),
      description: row.description || "Posisi lowongan pekerjaan internal perusahaan.",
      responsibilities: row.responsibilities || [
        "Merancang dan mengimplementasikan solusi teknis berkualitas tinggi",
        "Berkolaborasi dengan tim lintas divisi untuk memenuhi target proyek",
        "Memastikan standar kualitas dan dokumentasi hasil kerja",
      ],
      qualifications:
        row.required_skills && row.required_skills.length > 0
          ? row.required_skills
          : [
              `Minimal pendidikan ${row.min_education || "S1"}`,
              "Pengalaman kerja relevan di bidangnya",
              "Kemampuan komunikasi dan kerjasama tim yang baik",
            ],
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const filtered = mappedJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.dept.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
      return { jobs: filtered };
    }

    return { jobs: mappedJobs };
  } catch (err: any) {
    return { jobs: [] };
  }
}

/**
 * Fetch a single job by ID strictly from Supabase 'jobs' table.
 * Zero dummy data fallback: returns null if not found.
 */
export async function getJobByIdFromSupabase(
  jobId: string
): Promise<{ job: Job | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!error && data) {
      const mappedJob: Job = {
        id: String(data.id),
        title: data.title,
        dept: data.dept,
        type: data.type || "Hybrid",
        location: data.location || "Jakarta, Hybrid",
        salary: data.salary || "Sesuai Standar Perusahaan",
        posted: new Date(data.posted_date || data.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        deadline: data.deadline_date
          ? new Date(data.deadline_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Sesuai Kebijakan HR",
        deptColor: getDeptColor(data.dept),
        description: data.description || "Posisi lowongan pekerjaan internal perusahaan.",
        responsibilities: data.responsibilities || [
          "Merancang dan mengimplementasikan solusi teknis berkualitas tinggi",
          "Berkolaborasi dengan tim lintas divisi untuk memenuhi target proyek",
          "Memastikan standar kualitas dan dokumentasi hasil kerja",
        ],
        qualifications:
          data.required_skills && data.required_skills.length > 0
            ? data.required_skills
            : [
                `Minimal pendidikan ${data.min_education || "S1"}`,
                "Pengalaman kerja relevan di bidangnya",
                "Kemampuan pemecahan masalah yang baik",
              ],
      };

      return { job: mappedJob };
    }

    return { job: null, error: "Lowongan tidak ditemukan" };
  } catch (err: any) {
    return { job: null, error: err.message };
  }
}

function getDeptColor(dept: string): string {
  switch (dept) {
    case "Engineering":
      return "bg-blue-50 text-blue-700";
    case "Marketing":
      return "bg-purple-50 text-purple-700";
    case "Human Resources":
      return "bg-rose-50 text-rose-700";
    case "Design":
      return "bg-orange-50 text-orange-700";
    case "Finance":
      return "bg-indigo-50 text-indigo-700";
    default:
      return "bg-teal-50 text-teal-700";
  }
}
