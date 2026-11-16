"use server";

import { createClient } from "@/lib/supabase/server";
import { Job, extractQuota, extractApplicantCount, cleanJobDescription } from "@/data/jobs";

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

    const [{ data, error }, { data: appRows }] = await Promise.all([
      query,
      supabase.from("applications").select("job_id"),
    ]);

    if (error || !data || data.length === 0) {
      return { jobs: [] };
    }

    const appCountMap: Record<string, number> = {};
    (appRows || []).forEach((a) => {
      appCountMap[a.job_id] = (appCountMap[a.job_id] || 0) + 1;
    });

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
      quota: extractQuota(row.description, row.quota),
      applicant_count: extractApplicantCount(row.description, appCountMap[String(row.id)] || row.applicant_count),
      description: cleanJobDescription(row.description) || "Posisi lowongan pekerjaan internal perusahaan.",
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
      created_at: row.created_at,
      updated_at: row.updated_at,
      reopened_at: row.reopened_at || row.updated_at,
      posted_date: row.posted_date || row.created_at,
      deadline_date: row.deadline_date,
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

    const [{ data, error }, { count: applicantCount }] = await Promise.all([
      supabase.from("jobs").select("*").eq("id", jobId).single(),
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("job_id", jobId),
    ]);

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
        quota: extractQuota(data.description, data.quota),
        applicant_count: extractApplicantCount(data.description, applicantCount || data.applicant_count),
        description: cleanJobDescription(data.description) || "Posisi lowongan pekerjaan internal perusahaan.",
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
        created_at: data.created_at,
        updated_at: data.updated_at,
        reopened_at: data.reopened_at || data.updated_at,
        posted_date: data.posted_date || data.created_at,
        deadline_date: data.deadline_date,
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
