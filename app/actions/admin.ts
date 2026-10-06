"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  HRAnalyticsSummary,
  CandidateApplicantCard,
  CandidateDetailedReview,
  JobPosting,
  InternalNote,
  AuditLog,
} from "@/types/admin";
import { ApplicationStatus, CandidateProfile } from "@/types/candidate";
import { allJobs } from "@/data/jobs";

// Mock Fallback Database State for Demo/Dev
let MOCK_INTERNAL_NOTES: Record<string, InternalNote[]> = {
  "app-101": [
    {
      id: "note-1",
      application_id: "app-101",
      author_name: "Sarah Wijaya (Lead Recruiter)",
      note_text: "Kandidat menunjukkan portofolio Next.js & Supabase yang sangat solid. Direkomendasikan lanjut ke Technical Interview.",
      created_at: "2026-09-21T10:00:00Z",
    },
  ],
};

let MOCK_AUDIT_LOGS: Record<string, AuditLog[]> = {
  "app-101": [
    {
      id: "log-1",
      application_id: "app-101",
      old_status: "Applied",
      new_status: "In Review",
      changed_by_name: "System Auto-Screening",
      reason: "Lolos saringan otomatis: Pendidikan S1 memenuhi syarat minimum.",
      created_at: "2026-09-18T11:25:00Z",
    },
    {
      id: "log-2",
      application_id: "app-101",
      old_status: "In Review",
      new_status: "Interview",
      changed_by_name: "Sarah Wijaya (Lead Recruiter)",
      reason: "Hasil peninjauan portofolio memuaskan. Undangan interview dikirim.",
      created_at: "2026-09-22T14:15:00Z",
    },
  ],
};

let MOCK_JOB_POSTINGS: JobPosting[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    dept: "Engineering",
    type: "Full-time",
    location: "Jakarta, Hybrid",
    salary: "Rp 25.000.000 – Rp 40.000.000 / bulan",
    status: "Active",
    description: "Mengembangkan arsitektur microservices dan API skalabel menggunakan Golang/Node.js dan PostgreSQL.",
    min_education: "S1",
    required_skills: ["Golang", "Node.js", "PostgreSQL", "Docker", "Redis"],
    posted_date: "2026-09-20T08:00:00Z",
    applicant_count: 14,
  },
  {
    id: "2",
    title: "Frontend Engineer (React)",
    dept: "Engineering",
    type: "Full-time",
    location: "Remote",
    salary: "Rp 18.000.000 – Rp 30.000.000 / bulan",
    status: "Active",
    description: "Membangun antarmuka web performan tinggi menggunakan Next.js App Router dan Tailwind CSS.",
    min_education: "S1",
    required_skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS"],
    posted_date: "2026-09-19T09:00:00Z",
    applicant_count: 28,
  },
  {
    id: "3",
    title: "Product Marketing Manager",
    dept: "Marketing",
    type: "Full-time",
    location: "Jakarta, On-site",
    salary: "Rp 20.000.000 – Rp 32.000.000 / bulan",
    status: "Active",
    description: "Merancang strategi go-to-market dan positioning produk TalentHub di pasar B2B.",
    min_education: "S1",
    required_skills: ["Product Marketing", "Go-To-Market", "Analytics", "Copywriting"],
    posted_date: "2026-09-15T10:00:00Z",
    applicant_count: 9,
  },
  {
    id: "4",
    title: "UI/UX Designer",
    dept: "Design",
    type: "Contract",
    location: "Remote",
    salary: "Rp 12.000.000 – Rp 22.000.000 / bulan",
    status: "Closed",
    description: "Merancang design system dan wireframe UI/UX produk TalentHub.",
    min_education: "D3",
    required_skills: ["Figma", "Design System", "Wireframing", "Usability Testing"],
    posted_date: "2026-09-01T10:00:00Z",
    applicant_count: 18,
  },
];

/**
 * 1. Fetch Overview Metrics & Analytics for HR Dashboard from Supabase Database
 */
export async function getHRAnalytics(): Promise<{ analytics: HRAnalyticsSummary }> {
  try {
    const supabase = await createClient();

    const [{ data: apps }, { data: jobs }] = await Promise.all([
      supabase.from("applications").select("id, status, job_id, job_title, department"),
      supabase.from("jobs").select("id, status"),
    ]);

    const totalApps = apps?.length || 0;
    const activeJobs = jobs?.filter((j) => j.status === "Active").length || 0;
    const interviewCount = apps?.filter((a) => a.status === "Interview").length || 0;
    const hiredCount = apps?.filter((a) => a.status === "Hired" || a.status === "Offered").length || 0;

    // Calculate applicants per job from DB
    const jobAppCounts: Record<string, { job_title: string; department: string; count: number }> = {};
    apps?.forEach((app) => {
      const key = app.job_id || app.job_title;
      if (!jobAppCounts[key]) {
        jobAppCounts[key] = {
          job_title: app.job_title || "Lowongan Pekerjaan",
          department: app.department || "General",
          count: 0,
        };
      }
      jobAppCounts[key].count += 1;
    });

    const applicantsPerJob = Object.entries(jobAppCounts).map(([jobId, info]) => ({
      job_id: jobId,
      job_title: info.job_title,
      department: info.department,
      count: info.count,
    }));

    return {
      analytics: {
        active_jobs_count: activeJobs,
        total_applicants: totalApps,
        interviewing_count: interviewCount,
        hired_count: hiredCount,
        avg_time_to_hire_days: totalApps > 0 ? 12 : 0,
        applicants_per_job: applicantsPerJob,
        monthly_trend: [],
      },
    };
  } catch (err: any) {
    return {
      analytics: {
        active_jobs_count: 0,
        total_applicants: 0,
        interviewing_count: 0,
        hired_count: 0,
        avg_time_to_hire_days: 0,
        applicants_per_job: [],
        monthly_trend: [],
      },
    };
  }
}

/**
 * 2. Fetch Applicants for Kanban Board with Real Database Candidates & Profiles
 */
export async function getKanbanApplicants(jobIdFilter?: string): Promise<{ applicants: CandidateApplicantCard[] }> {
  try {
    const supabase = await createClient();

    let query = supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (jobIdFilter && jobIdFilter !== "Semua") {
      query = query.eq("job_id", jobIdFilter);
    }

    const { data: dbApps, error } = await query;

    if (error || !dbApps || dbApps.length === 0) {
      return { applicants: [] };
    }

    // Fetch candidate profiles to enrich Kanban card data
    const candidateIds = Array.from(new Set(dbApps.map((item) => item.candidate_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, education, resume_url, resume_name")
      .in("id", candidateIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Transform DB rows into CandidateApplicantCards using real profiles
    const transformed: CandidateApplicantCard[] = dbApps.map((item) => {
      const prof = profileMap.get(item.candidate_id);
      const eduList = prof?.education && Array.isArray(prof.education) ? prof.education : [];
      const firstEdu = eduList[0] || {};

      return {
        id: item.id,
        candidate_id: item.candidate_id,
        candidate_name: prof?.full_name || `Kandidat #${item.id.slice(0, 5)}`,
        candidate_email: prof?.email || "pelamar@example.com",
        candidate_phone: prof?.phone || "-",
        candidate_education_level: firstEdu.level || "S1",
        candidate_university: firstEdu.school || "Perguruan Tinggi",
        candidate_major: firstEdu.major || "-",
        job_id: item.job_id,
        job_title: item.job_title,
        department: item.department,
        status: item.status as ApplicationStatus,
        current_stage_index: item.current_stage_index || 1,
        auto_tags: item.auto_tags && item.auto_tags.length > 0 ? item.auto_tags : ["Memenuhi Syarat Minimum"],
        match_score: 90,
        resume_url: prof?.resume_url || undefined,
        resume_name: prof?.resume_name || undefined,
        applied_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    return { applicants: transformed };
  } catch (err: any) {
    return { applicants: [] };
  }
}

/**
 * 3. Move Candidate Kanban Status & Record Audit Trail automatically
 */
export async function updateApplicantStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Map status to current stage index
    const stageMap: Record<ApplicationStatus, number> = {
      Applied: 1,
      "In Review": 2,
      Interview: 3,
      Offered: 4,
      Hired: 4,
      Rejected: 1,
    };

    const newStageIndex = stageMap[newStatus] || 1;
    const authorName = user?.user_metadata?.full_name || user?.email || "Admin Recruiter HR";

    // DB Update
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: newStatus,
        current_stage_index: newStageIndex,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.warn("Supabase update applicant notice:", updateError.message);
    }

    // Insert Audit Trail Log
    const newAuditLog: AuditLog = {
      id: `log-${Date.now()}`,
      application_id: applicationId,
      old_status: "Applied", // fallback
      new_status: newStatus,
      changed_by_name: authorName,
      reason: reason || `Perubahan status kandidat menjadi "${newStatus}" via Papan Kanban HR.`,
      created_at: new Date().toISOString(),
    };

    if (!MOCK_AUDIT_LOGS[applicationId]) {
      MOCK_AUDIT_LOGS[applicationId] = [];
    }
    MOCK_AUDIT_LOGS[applicationId].unshift(newAuditLog);

    await supabase.from("audit_logs").insert({
      application_id: applicationId,
      old_status: "Applied",
      new_status: newStatus,
      changed_by_name: authorName,
      reason: reason || "Perubahan status kandidat via Kanban Board.",
      created_at: new Date().toISOString(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/kanban");
    revalidatePath(`/admin/candidates/${applicationId}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui status kandidat." };
  }
}

/**
 * 4. Fetch Detailed Profile, CV PDF URL, Internal Notes, & Audit Logs for Screening Page
 */
export async function getCandidateDetailForScreening(
  applicationId: string
): Promise<{ detail: CandidateDetailedReview | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: appData } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (!appData) {
      return { detail: null, error: "Data lamaran tidak ditemukan." };
    }

    const { data: profData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", appData.candidate_id)
      .single();

    const { data: dbNotes } = await supabase
      .from("internal_notes")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    const { data: dbLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    const candidateProfile: CandidateProfile = {
      id: profData?.id || appData.candidate_id,
      email: profData?.email || "pelamar@example.com",
      full_name: profData?.full_name || "Pelamar",
      phone: profData?.phone || "-",
      whatsapp: profData?.whatsapp || "-",
      linkedin_url: profData?.linkedin_url || "",
      portfolio_url: profData?.portfolio_url || "",
      headline: profData?.headline || "Pelamar Pekerjaan",
      bio: profData?.bio || "",
      role: profData?.role || "candidate",
      education: profData?.education && Array.isArray(profData.education) ? profData.education : [],
      skills: profData?.skills && Array.isArray(profData.skills) ? profData.skills : [],
      experience: profData?.experience && Array.isArray(profData.experience) ? profData.experience : [],
      resume_url: profData?.resume_url || undefined,
      resume_name: profData?.resume_name || undefined,
      profile_completed: profData?.profile_completed ?? true,
    };

    const notes: InternalNote[] = (dbNotes || []).map((n) => ({
      id: n.id,
      application_id: n.application_id,
      author_id: n.author_id,
      author_name: n.author_name,
      note_text: n.note_text,
      created_at: n.created_at,
    }));

    const logs: AuditLog[] = (dbLogs || []).map((l) => ({
      id: l.id,
      application_id: l.application_id,
      old_status: l.old_status,
      new_status: l.new_status,
      changed_by_name: l.changed_by_name,
      reason: l.reason,
      created_at: l.created_at,
    }));

    const detail: CandidateDetailedReview = {
      application: {
        id: appData.id,
        candidate_id: appData.candidate_id,
        job_id: appData.job_id,
        job_title: appData.job_title,
        department: appData.department,
        job_type: appData.job_type || "Full-time",
        salary: appData.salary,
        location: appData.location || "Jakarta",
        status: appData.status as ApplicationStatus,
        current_stage_index: appData.current_stage_index || 1,
        hr_notes: appData.hr_notes,
        interview_date: appData.interview_date,
        interview_link: appData.interview_link,
        auto_tags: appData.auto_tags || ["Memenuhi Syarat Minimum"],
        created_at: appData.created_at,
        updated_at: appData.updated_at,
      },
      profile: candidateProfile,
      internal_notes: notes,
      audit_logs: logs,
    };

    return { detail };
  } catch (err: any) {
    return { detail: null, error: err.message };
  }
}

/**
 * 5. Add Internal HR Discussion Note (Confidential for HR)
 */
export async function addInternalHRNote(
  applicationId: string,
  noteText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const authorName = user?.user_metadata?.full_name || user?.email || "Admin Recruiter HR";

    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      application_id: applicationId,
      author_id: user?.id,
      author_name: authorName,
      note_text: noteText,
      created_at: new Date().toISOString(),
    };

    if (!MOCK_INTERNAL_NOTES[applicationId]) {
      MOCK_INTERNAL_NOTES[applicationId] = [];
    }
    MOCK_INTERNAL_NOTES[applicationId].unshift(newNote);

    await supabase.from("internal_notes").insert({
      application_id: applicationId,
      author_id: user?.id,
      author_name: authorName,
      note_text: noteText,
      created_at: new Date().toISOString(),
    });

    revalidatePath(`/admin/candidates/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambahkan catatan internal." };
  }
}

/**
 * 6. Job Posting Management: Get All Jobs, Create Job with Min. Education criteria, and Toggle Status
 */
export async function getJobPostings(): Promise<{ jobs: JobPosting[] }> {
  try {
    const supabase = await createClient();
    const [{ data: dbJobs }, { data: dbApps }] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("job_id"),
    ]);

    if (!dbJobs || dbJobs.length === 0) {
      return { jobs: [] };
    }

    const appCounts: Record<string, number> = {};
    dbApps?.forEach((app) => {
      appCounts[app.job_id] = (appCounts[app.job_id] || 0) + 1;
    });

    const jobsWithCount: JobPosting[] = dbJobs.map((job) => ({
      ...job,
      applicant_count: appCounts[job.id] || 0,
    }));

    return { jobs: jobsWithCount };
  } catch (err: any) {
    return { jobs: [] };
  }
}

export async function createJobPosting(formData: {
  title: string;
  dept: string;
  type: string;
  location: string;
  salary: string;
  description: string;
  min_education: "SMA" | "D3" | "S1" | "S2" | "S3";
  required_skills: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      title: formData.title,
      dept: formData.dept,
      type: formData.type,
      location: formData.location,
      salary: formData.salary,
      status: "Active",
      description: formData.description,
      min_education: formData.min_education,
      required_skills: formData.required_skills,
      posted_date: new Date().toISOString(),
      applicant_count: 0,
    };

    MOCK_JOB_POSTINGS.unshift(newJob);

    await supabase.from("jobs").insert({
      title: formData.title,
      dept: formData.dept,
      type: formData.type,
      location: formData.location,
      salary: formData.salary,
      status: "Active",
      description: formData.description,
      min_education: formData.min_education,
      required_skills: formData.required_skills,
    });

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat lowongan pekerjaan baru." };
  }
}

export async function toggleJobStatus(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const found = MOCK_JOB_POSTINGS.find((j) => j.id === jobId);
    if (found) {
      found.status = found.status === "Active" ? "Closed" : "Active";
    }

    await supabase
      .from("jobs")
      .update({ status: found?.status || "Closed" })
      .eq("id", jobId);

    revalidatePath("/admin/jobs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status lowongan." };
  }
}
