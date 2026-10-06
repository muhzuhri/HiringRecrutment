"use server";

import { createClient } from "@/lib/supabase/server";
import { allJobs, Job } from "@/data/jobs";

/**
 * Fetch all job postings from Supabase 'jobs' table, falling back to allJobs mock array.
 */
export async function getJobsFromSupabase(deptFilter?: string, searchQuery?: string): Promise<{ jobs: Job[]; error?: string }> {
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
      // Filter mock jobs if Supabase DB is empty
      let filteredMock = [...allJobs];
      if (deptFilter && deptFilter !== "Semua") {
        filteredMock = filteredMock.filter((j) => j.dept === deptFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredMock = filteredMock.filter(
          (j) => j.title.toLowerCase().includes(q) || j.dept.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
        );
      }
      return { jobs: filteredMock };
    }

    // Map DB rows to Job interface
    const mappedJobs: Job[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      dept: row.dept,
      type: row.type || "Hybrid",
      location: row.location || "Jakarta, Hybrid",
      salary: row.salary || "Rp 18.000.000 – Rp 30.000.000 / bulan",
      posted: new Date(row.posted_date || row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      deadline: row.deadline_date ? new Date(row.deadline_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "30 November 2026",
      deptColor: getDeptColor(row.dept),
      description: row.description || "Posisi lowongan pekerjaan internal perusahaan.",
      responsibilities: row.responsibilities || [
        "Merancang dan mengimplementasikan solusi teknis berkualitas tinggi",
        "Berkolaborasi dengan tim lintas divisi untuk memenuhi target proyek",
        "Memastikan standar kualitas dan dokumentasi hasil kerja",
      ],
      qualifications: row.required_skills || [
        `Minimal pendidikan ${row.min_education || "S1"}`,
        "Pengalaman kerja relevan di bidangnya",
        "Kemampuan komunikasi dan kerjasama tim yang kuat",
      ],
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const filtered = mappedJobs.filter(
        (j) => j.title.toLowerCase().includes(q) || j.dept.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
      );
      return { jobs: filtered };
    }

    return { jobs: mappedJobs };
  } catch (err: any) {
    return { jobs: allJobs };
  }
}

/**
 * Fetch a single job by ID from Supabase 'jobs' table
 */
export async function getJobByIdFromSupabase(jobId: string): Promise<{ job: Job | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!error && data) {
      const mappedJob: Job = {
        id: data.id,
        title: data.title,
        dept: data.dept,
        type: data.type || "Hybrid",
        location: data.location || "Jakarta, Hybrid",
        salary: data.salary || "Rp 18.000.000 – Rp 30.000.000 / bulan",
        posted: new Date(data.posted_date || data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        deadline: data.deadline_date ? new Date(data.deadline_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "30 November 2026",
        deptColor: getDeptColor(data.dept),
        description: data.description || "Posisi lowongan pekerjaan internal perusahaan.",
        responsibilities: data.responsibilities || [
          "Merancang dan mengimplementasikan arsitektur solusi internal",
          "Mengembangkan REST / GraphQL API dan antarmuka terintegrasi",
          "Melakukan optimasi performa dan dokumentasi teknis",
        ],
        qualifications: data.required_skills && data.required_skills.length > 0 ? data.required_skills : [
          `Minimal pendidikan ${data.min_education || "S1"}`,
          "Pengalaman kerja relevan minimal 2-3 tahun",
          "Kemampuan pemecahan masalah yang baik",
        ],
      };

      return { job: mappedJob };
    }

    const fallback = allJobs.find((j) => j.id === jobId) || allJobs[0];
    return { job: fallback };
  } catch (err: any) {
    const fallback = allJobs.find((j) => j.id === jobId) || allJobs[0];
    return { job: fallback };
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
