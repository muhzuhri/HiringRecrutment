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
import { ApplicationStatus, CandidateProfile, AssessmentItem, AssessmentType } from "@/types/candidate";

// Mock Fallback Database State for Demo/Dev Environments
let MOCK_ASSESSMENTS: Record<string, AssessmentItem[]> = {
  "app-101": [
    {
      id: "asm-1",
      application_id: "app-101",
      type: "Psikotes",
      scheduled_at: "2026-09-22T09:00:00Z",
      evaluator_name: "Dr. Bambang (Tim Psikologi)",
      score: 85,
      notes: "Logika analitis dan kecerdasan spasial di atas rata-rata.",
      status: "Completed",
      created_at: "2026-09-21T10:00:00Z",
    },
    {
      id: "asm-2",
      application_id: "app-101",
      type: "Technical Test",
      scheduled_at: "2026-09-24T14:00:00Z",
      evaluator_name: "Sarah Wijaya (Tech Lead)",
      score: 92,
      notes: "Solusi arsitektur Next.js & Supabase sangat optimal.",
      status: "Completed",
      created_at: "2026-09-22T11:00:00Z",
    },
  ],
};

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
      old_status: "Diajukan",
      new_status: "Diproses",
      stage_detail: "Screening Portofolio & Berkas",
      changed_by_name: "System Auto-Screening",
      reason: "Lolos saringan otomatis: Pendidikan S1 memenuhi syarat minimum.",
      created_at: "2026-09-18T11:25:00Z",
    },
    {
      id: "log-2",
      application_id: "app-101",
      old_status: "Diproses",
      new_status: "Interview",
      stage_detail: "Penjadwalan Assessment & Interview HR",
      changed_by_name: "Sarah Wijaya (Lead Recruiter)",
      reason: "Hasil peninjauan portofolio memuaskan. Undangan interview dikirim.",
      created_at: "2026-09-22T14:15:00Z",
    },
  ],
};

let MOCK_JOB_POSTINGS: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior Backend Engineer",
    dept: "Engineering",
    type: "Hybrid",
    location: "Jakarta, Hybrid",
    salary: "Rp 25.000.000 – Rp 40.000.000 / bulan",
    status: "Active",
    description: "Mengembangkan arsitektur microservices dan API skalabel menggunakan Golang/Node.js dan PostgreSQL internal perusahaan.",
    min_education: "S1",
    required_skills: ["Golang", "Node.js", "PostgreSQL", "Docker", "Redis"],
    posted_date: "2026-09-20T08:00:00Z",
    deadline_date: "2026-10-31T23:59:59Z",
    applicant_count: 14,
    time_to_hire: "14 Hari",
  },
  {
    id: "job-2",
    title: "Frontend Engineer (React & Next.js)",
    dept: "Engineering",
    type: "WFH",
    location: "Remote / WFH",
    salary: "Rp 18.000.000 – Rp 30.000.000 / bulan",
    status: "Active",
    description: "Membangun antarmuka web rekrutmen internal performa tinggi menggunakan Next.js App Router, Tailwind CSS, dan Supabase.",
    min_education: "S1",
    required_skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    posted_date: "2026-09-19T09:00:00Z",
    deadline_date: "2026-11-15T23:59:59Z",
    applicant_count: 28,
    time_to_hire: "10 Hari",
  },
  {
    id: "job-3",
    title: "HR Talent Acquisition Specialist",
    dept: "Human Resources",
    type: "WFO",
    location: "Jakarta Head Office",
    salary: "Rp 15.000.000 – Rp 22.000.000 / bulan",
    status: "Active",
    description: "Mengelola end-to-end proses hiring internal perusahaan mulai dari screening, scheduling assessment, hingga onboarding.",
    min_education: "S1",
    required_skills: ["Talent Sourcing", "Interview Technique", "Psychometric Assessment", "Labor Law"],
    posted_date: "2026-09-15T10:00:00Z",
    deadline_date: "2026-10-25T23:59:59Z",
    applicant_count: 9,
    time_to_hire: "Belum tersedia",
  },
  {
    id: "job-4",
    title: "UI/UX Product Designer",
    dept: "Design",
    type: "Hybrid",
    location: "Jakarta, Hybrid",
    salary: "Rp 14.000.000 – Rp 24.000.000 / bulan",
    status: "Closed",
    description: "Merancang design system internal dan wireframe UI/UX portal rekrutmen perusahaan.",
    min_education: "D3",
    required_skills: ["Figma", "Design System", "Wireframing", "Usability Testing"],
    posted_date: "2026-09-01T10:00:00Z",
    deadline_date: "2026-09-30T23:59:59Z",
    applicant_count: 18,
    time_to_hire: "Belum tersedia",
  },
];

/**
 * Helper function to calculate time-to-hire difference in days
 */
function calculateDaysDifference(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const diffDays = Math.round((end - start) / (1000 * 3600 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * 1. CASE 3: Fetch Overview Metrics & Analytics for HR Dashboard
 * Computes unique applicants per job and exact Time-to-Hire metrics.
 */
export async function getHRAnalytics(): Promise<{ analytics: HRAnalyticsSummary }> {
  try {
    const supabase = await createClient();

    const [{ data: apps }, { data: jobs }] = await Promise.all([
      supabase.from("applications").select("id, status, job_id, job_title, department, created_at, hired_at"),
      supabase.from("jobs").select("id, title, dept, status"),
    ]);

    const totalApps = apps?.length || 0;
    const activeJobs = jobs?.filter((j) => j.status === "Active").length || 0;
    const interviewCount = apps?.filter((a) => a.status === "Interview").length || 0;
    const hiredApps = apps?.filter((a) => (a.status === "Diterima" || a.status === "Hired") && a.hired_at) || [];
    const hiredCount = hiredApps.length;

    // Time-to-hire overall calculation
    let overallTimeToHireText = "Belum tersedia";
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((acc, curr) => {
        return acc + calculateDaysDifference(curr.created_at, curr.hired_at!);
      }, 0);
      const avgDays = Math.round(totalDays / hiredApps.length);
      overallTimeToHireText = `${avgDays} Hari`;
    }

    // Per job applicants & Time-to-Hire calculation
    const jobStatsMap: Record<string, { job_title: string; department: string; count: number; hiresDays: number[]; hireCount: number }> = {};
    
    // Seed with all known jobs
    (jobs || []).forEach((j) => {
      jobStatsMap[j.id] = {
        job_title: j.title,
        department: j.dept,
        count: 0,
        hiresDays: [],
        hireCount: 0,
      };
    });

    (apps || []).forEach((app) => {
      const jId = app.job_id;
      if (!jobStatsMap[jId]) {
        jobStatsMap[jId] = {
          job_title: app.job_title || "Lowongan Pekerjaan",
          department: app.department || "Divisi HR",
          count: 0,
          hiresDays: [],
          hireCount: 0,
        };
      }
      jobStatsMap[jId].count += 1;

      if ((app.status === "Diterima" || app.status === "Hired") && app.hired_at) {
        const days = calculateDaysDifference(app.created_at, app.hired_at);
        jobStatsMap[jId].hiresDays.push(days);
        jobStatsMap[jId].hireCount += 1;
      }
    });

    const applicantsPerJob = Object.entries(jobStatsMap).map(([jobId, info]) => {
      let timeToHireStr = "Belum tersedia";
      if (info.hiresDays.length > 0) {
        const avg = Math.round(info.hiresDays.reduce((a, b) => a + b, 0) / info.hiresDays.length);
        timeToHireStr = `${avg} Hari`;
      }
      return {
        job_id: jobId,
        job_title: info.job_title,
        department: info.department,
        count: info.count,
        time_to_hire: timeToHireStr,
      };
    });

    return {
      analytics: {
        active_jobs_count: activeJobs,
        total_applicants: totalApps,
        interviewing_count: interviewCount,
        hired_count: hiredCount,
        avg_time_to_hire_text: overallTimeToHireText,
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
        avg_time_to_hire_text: "Belum tersedia",
        applicants_per_job: [],
        monthly_trend: [],
      },
    };
  }
}

/**
 * 2. CASE 3: Fetch Applicants for Kanban Board with Real Profiles
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

    const candidateIds = Array.from(new Set(dbApps.map((item) => item.candidate_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, education, resume_url, resume_name")
      .in("id", candidateIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

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
        is_qualified: item.is_qualified ?? false,
        auto_tags: item.auto_tags && item.auto_tags.length > 0 ? item.auto_tags : ["Kualifikasi Sesuai"],
        match_score: item.is_qualified ? 95 : 85,
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
 * 3. CASE 2 & 3: Update Candidate Status with Automated Audit Trail & Time-to-Hire timestamp
 */
export async function updateApplicantStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  reason?: string,
  stageDetail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Map status to stage index
    const stageMap: Record<string, number> = {
      Diajukan: 1,
      Applied: 1,
      Diproses: 2,
      "In Review": 2,
      Interview: 3,
      Diterima: 4,
      Offered: 4,
      Hired: 4,
      Ditolak: 1,
      Rejected: 1,
    };

    const newStageIndex = stageMap[newStatus] || 1;
    const authorName = user?.user_metadata?.full_name || user?.email || "Admin HR Recruiter";

    // Get old application status
    const { data: currentApp } = await supabase
      .from("applications")
      .select("status")
      .eq("id", applicationId)
      .single();

    const oldStatus = currentApp?.status || "Diajukan";
    const updatePayload: any = {
      status: newStatus,
      current_stage_index: newStageIndex,
      updated_at: new Date().toISOString(),
    };

    // If candidate status is changed to Diterima / Hired, set hired_at for Time-to-Hire calculation
    if (newStatus === "Diterima" || newStatus === "Hired" || newStatus === "Offered") {
      updatePayload.hired_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (updateError) {
      console.warn("Supabase update application notice:", updateError.message);
    }

    // Record Audit Trail
    const newAuditLog: AuditLog = {
      id: `log-${Date.now()}`,
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      stage_detail: stageDetail || `Perubahan status ke "${newStatus}"`,
      changed_by_name: authorName,
      reason: reason || `Status kandidat diperbarui menjadi "${newStatus}".`,
      created_at: new Date().toISOString(),
    };

    if (!MOCK_AUDIT_LOGS[applicationId]) {
      MOCK_AUDIT_LOGS[applicationId] = [];
    }
    MOCK_AUDIT_LOGS[applicationId].unshift(newAuditLog);

    await supabase.from("audit_logs").insert({
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      stage_detail: stageDetail || `Tahap ${newStageIndex}: ${newStatus}`,
      changed_by_name: authorName,
      reason: reason || `Perubahan status rekrutmen via HR Dashboard.`,
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
 * CASE 2: Toggle "Qualified Candidate" flag for screening
 */
export async function toggleCandidateQualification(
  applicationId: string,
  isQualified: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const authorName = user?.user_metadata?.full_name || user?.email || "Admin HR";

    await supabase
      .from("applications")
      .update({ is_qualified: isQualified, updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    // Audit log
    await supabase.from("audit_logs").insert({
      application_id: applicationId,
      old_status: "Diproses",
      new_status: isQualified ? "Qualified Candidate" : "In Screening",
      stage_detail: "Penilaian Kualifikasi Berkas",
      changed_by_name: authorName,
      reason: isQualified ? "Kandidat dinyatakan Qualified Candidate (Lolos Screening)" : "Status Qualified dibatalkan",
      created_at: new Date().toISOString(),
    });

    revalidatePath(`/admin/candidates/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * CASE 2: Schedule Assessment or Interview
 */
export async function scheduleAssessmentOrInterview(data: {
  application_id: string;
  type: AssessmentType;
  scheduled_at: string;
  evaluator_name: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const newItem: AssessmentItem = {
      id: `asm-${Date.now()}`,
      application_id: data.application_id,
      type: data.type,
      scheduled_at: data.scheduled_at,
      evaluator_name: data.evaluator_name,
      score: null, // Initial score null (unscored / belum dinilai)
      notes: "",
      status: "Scheduled",
      created_at: new Date().toISOString(),
    };

    if (!MOCK_ASSESSMENTS[data.application_id]) {
      MOCK_ASSESSMENTS[data.application_id] = [];
    }
    MOCK_ASSESSMENTS[data.application_id].push(newItem);

    await supabase.from("assessments_and_interviews").insert({
      application_id: data.application_id,
      type: data.type,
      scheduled_at: data.scheduled_at,
      evaluator_name: data.evaluator_name,
      score: null,
      status: "Scheduled",
    });

    revalidatePath(`/admin/candidates/${data.application_id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menjadwalkan tes/interview." };
  }
}

/**
 * CASE 2: Input Assessment / Interview Score (0-100 scale, distinguishing 0 vs null)
 */
export async function submitAssessmentEvaluation(data: {
  assessment_id: string;
  application_id: string;
  score: number | null; // 0 is a valid score of 0, null is unscored
  notes: string;
  evaluator_name?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate 0-100 range if score is provided
    if (data.score !== null && (data.score < 0 || data.score > 100)) {
      return { success: false, error: "Nilai evaluasi harus berada pada rentang 0 hingga 100." };
    }

    const mockList = MOCK_ASSESSMENTS[data.application_id] || [];
    const item = mockList.find((a) => a.id === data.assessment_id);
    if (item) {
      item.score = data.score;
      item.notes = data.notes;
      item.status = "Completed";
      if (data.evaluator_name) item.evaluator_name = data.evaluator_name;
    }

    await supabase
      .from("assessments_and_interviews")
      .update({
        score: data.score,
        notes: data.notes,
        status: "Completed",
        ...(data.evaluator_name ? { evaluator_name: data.evaluator_name } : {}),
      })
      .eq("id", data.assessment_id);

    revalidatePath(`/admin/candidates/${data.application_id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan hasil penilaian." };
  }
}

/**
 * 4. CASE 2 & 3: Get Candidate Detail for HR Screening with Assessments, Notes, and Audit Trail
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

    const { data: dbAssessments } = await supabase
      .from("assessments_and_interviews")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

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

    const assessments: AssessmentItem[] = dbAssessments && dbAssessments.length > 0
      ? dbAssessments.map((a) => ({
          id: a.id,
          application_id: a.application_id,
          type: a.type as AssessmentType,
          scheduled_at: a.scheduled_at,
          evaluator_name: a.evaluator_name,
          score: a.score, // null if unscored, numeric 0-100
          notes: a.notes,
          status: a.status,
          created_at: a.created_at,
        }))
      : MOCK_ASSESSMENTS[applicationId] || [];

    const notes: InternalNote[] = dbNotes && dbNotes.length > 0
      ? dbNotes.map((n) => ({
          id: n.id,
          application_id: n.application_id,
          author_id: n.author_id,
          author_name: n.author_name,
          note_text: n.note_text,
          created_at: n.created_at,
        }))
      : MOCK_INTERNAL_NOTES[applicationId] || [];

    const logs: AuditLog[] = dbLogs && dbLogs.length > 0
      ? dbLogs.map((l) => ({
          id: l.id,
          application_id: l.application_id,
          old_status: l.old_status,
          new_status: l.new_status,
          stage_detail: l.stage_detail,
          changed_by_name: l.changed_by_name,
          reason: l.reason,
          created_at: l.created_at,
        }))
      : MOCK_AUDIT_LOGS[applicationId] || [];

    const detail: CandidateDetailedReview = {
      application: {
        id: appData.id,
        candidate_id: appData.candidate_id,
        job_id: appData.job_id,
        job_title: appData.job_title,
        department: appData.department,
        job_type: appData.job_type || "Hybrid",
        salary: appData.salary,
        location: appData.location || "Jakarta",
        status: appData.status as ApplicationStatus,
        current_stage_index: appData.current_stage_index || 1,
        is_qualified: appData.is_qualified ?? false,
        hr_notes: appData.hr_notes,
        interview_date: appData.interview_date,
        interview_link: appData.interview_link,
        hired_at: appData.hired_at,
        auto_tags: appData.auto_tags || ["Kualifikasi Sesuai"],
        created_at: appData.created_at,
        updated_at: appData.updated_at,
      },
      profile: candidateProfile,
      assessments: assessments,
      internal_notes: notes,
      audit_logs: logs,
    };

    return { detail };
  } catch (err: any) {
    return { detail: null, error: err.message };
  }
}

/**
 * 5. CASE 2 & 3: Add Confidential HR Internal Discussion Note
 */
export async function addInternalHRNote(
  applicationId: string,
  noteText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const authorName = user?.user_metadata?.full_name || user?.email || "Admin HR Recruiter";

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
 * 6. CASE 1: Job Posting Management (Create with WFH/WFO/Hybrid, Skills, Division, Deadline & Publication Status)
 */
export async function getJobPostings(): Promise<{ jobs: JobPosting[] }> {
  try {
    const supabase = await createClient();
    const [{ data: dbJobs }, { data: dbApps }] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("job_id, status, created_at, hired_at"),
    ]);

    if (!dbJobs || dbJobs.length === 0) {
      return { jobs: MOCK_JOB_POSTINGS };
    }

    const appCounts: Record<string, number> = {};
    const hiredDaysMap: Record<string, number[]> = {};

    dbApps?.forEach((app) => {
      appCounts[app.job_id] = (appCounts[app.job_id] || 0) + 1;
      if ((app.status === "Diterima" || app.status === "Hired") && app.hired_at) {
        if (!hiredDaysMap[app.job_id]) hiredDaysMap[app.job_id] = [];
        hiredDaysMap[app.job_id].push(calculateDaysDifference(app.created_at, app.hired_at));
      }
    });

    const jobsWithCount: JobPosting[] = dbJobs.map((job) => {
      let tth = "Belum tersedia";
      if (hiredDaysMap[job.id] && hiredDaysMap[job.id].length > 0) {
        const avg = Math.round(hiredDaysMap[job.id].reduce((a, b) => a + b, 0) / hiredDaysMap[job.id].length);
        tth = `${avg} Hari`;
      }
      return {
        ...job,
        applicant_count: appCounts[job.id] || 0,
        time_to_hire: tth,
      };
    });

    return { jobs: jobsWithCount };
  } catch (err: any) {
    return { jobs: MOCK_JOB_POSTINGS };
  }
}

export async function createJobPosting(formData: {
  title: string;
  dept: string;
  type: string; // WFH / WFO / Hybrid
  location: string;
  salary: string;
  description: string;
  min_education: "SMA" | "D3" | "S1" | "S2" | "S3";
  required_skills: string[];
  deadline_date?: string;
  status?: "Active" | "Closed";
}): Promise<{ success: boolean; job?: JobPosting; error?: string }> {
  try {
    const supabase = await createClient();
    const jobId = `job-${Date.now()}`;

    const newJob: JobPosting = {
      id: jobId,
      title: formData.title,
      dept: formData.dept,
      type: formData.type || "Hybrid",
      location: formData.location,
      salary: formData.salary,
      status: formData.status || "Active",
      description: formData.description,
      min_education: formData.min_education,
      required_skills: formData.required_skills,
      posted_date: new Date().toISOString(),
      deadline_date: formData.deadline_date || undefined,
      applicant_count: 0,
      time_to_hire: "Belum tersedia",
    };

    MOCK_JOB_POSTINGS.unshift(newJob);

    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        title: formData.title,
        dept: formData.dept,
        type: formData.type || "Hybrid",
        location: formData.location,
        salary: formData.salary,
        status: formData.status || "Active",
        description: formData.description,
        min_education: formData.min_education,
        required_skills: formData.required_skills,
        deadline_date: formData.deadline_date || null,
      })
      .select("*")
      .single();

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");

    if (inserted) {
      return { success: true, job: { ...inserted, applicant_count: 0, time_to_hire: "Belum tersedia" } };
    }
    return { success: true, job: newJob };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat lowongan pekerjaan baru." };
  }
}

export async function updateJobPosting(
  jobId: string,
  formData: {
    title: string;
    dept: string;
    type: string;
    location: string;
    salary: string;
    description: string;
    min_education: "SMA" | "D3" | "S1" | "S2" | "S3";
    required_skills: string[];
    deadline_date?: string;
    status?: "Active" | "Closed";
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update in-memory mock if exists
    const idx = MOCK_JOB_POSTINGS.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      MOCK_JOB_POSTINGS[idx] = {
        ...MOCK_JOB_POSTINGS[idx],
        title: formData.title,
        dept: formData.dept,
        type: formData.type,
        location: formData.location,
        salary: formData.salary,
        description: formData.description,
        min_education: formData.min_education,
        required_skills: formData.required_skills,
        deadline_date: formData.deadline_date,
        ...(formData.status ? { status: formData.status } : {}),
      };
    }

    // Check if job exists in DB
    const { data: existing } = await supabase.from("jobs").select("id").eq("id", jobId).maybeSingle();

    const payload = {
      title: formData.title,
      dept: formData.dept,
      type: formData.type,
      location: formData.location,
      salary: formData.salary,
      description: formData.description,
      min_education: formData.min_education,
      required_skills: formData.required_skills,
      deadline_date: formData.deadline_date || null,
      ...(formData.status ? { status: formData.status } : {}),
    };

    if (existing) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", jobId);
      if (error) {
        console.error("Supabase update job error:", error.message);
        return { success: false, error: `Gagal memperbarui lowongan: ${error.message}` };
      }
    } else {
      // Upsert into Supabase DB if it's a seed item
      const { error } = await supabase.from("jobs").upsert({
        id: jobId,
        ...payload,
      });
      if (error) {
        console.error("Supabase upsert job error:", error.message);
        return { success: false, error: `Gagal menyimpan lowongan: ${error.message}` };
      }
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui lowongan pekerjaan." };
  }
}

export async function deleteJobPosting(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Remove from mock array
    MOCK_JOB_POSTINGS = MOCK_JOB_POSTINGS.filter((j) => j.id !== jobId);

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) {
      console.warn("Supabase delete job notice:", error.message);
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus lowongan pekerjaan." };
  }
}

export async function toggleJobStatus(jobId: string): Promise<{ success: boolean; newStatus?: "Active" | "Closed"; error?: string }> {
  try {
    const supabase = await createClient();

    // Check DB for existing job row
    const { data: existing } = await supabase
      .from("jobs")
      .select("id, status, title, dept, type, location, salary, description, min_education, required_skills, deadline_date")
      .eq("id", jobId)
      .maybeSingle();

    const mockItem = MOCK_JOB_POSTINGS.find((j) => j.id === jobId);
    const currentStatus = existing?.status || mockItem?.status || "Active";
    const newStatus = currentStatus === "Active" ? "Closed" : "Active";

    if (mockItem) {
      mockItem.status = newStatus;
    }

    if (existing) {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) {
        console.error("Supabase toggle job status error:", error.message);
        return { success: false, error: `Gagal mengubah status: ${error.message}` };
      }
    } else if (mockItem) {
      // Upsert mock item into Supabase DB with updated status
      const { error } = await supabase.from("jobs").upsert({
        id: mockItem.id,
        title: mockItem.title,
        dept: mockItem.dept,
        type: mockItem.type,
        location: mockItem.location,
        salary: mockItem.salary,
        status: newStatus,
        description: mockItem.description,
        min_education: mockItem.min_education,
        required_skills: mockItem.required_skills,
        deadline_date: mockItem.deadline_date || null,
      });

      if (error) {
        console.error("Supabase upsert toggle status error:", error.message);
        return { success: false, error: `Gagal mengubah status: ${error.message}` };
      }
    } else {
      // Try direct update
      await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status lowongan." };
  }
}
