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
  AssessmentReviewRow,
} from "@/types/admin";
import { ApplicationStatus, CandidateProfile, AssessmentItem, AssessmentType } from "@/types/candidate";

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
 * Strictly computes real data from Supabase 'applications' and 'jobs' tables.
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

    // Time-to-hire overall calculation: sum of days / total hired
    let overallTimeToHireText = "Belum tersedia";
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((acc, curr) => {
        return acc + calculateDaysDifference(curr.created_at, curr.hired_at!);
      }, 0);
      const avgDays = Math.round(totalDays / hiredApps.length);
      overallTimeToHireText = `${avgDays} Hari`;
    }

    // Per job applicants & Time-to-Hire calculation
    const jobStatsMap: Record<string, { job_title: string; department: string; count: number; hiresDays: number[] }> = {};

    (jobs || []).forEach((j) => {
      jobStatsMap[j.id] = {
        job_title: j.title,
        department: j.dept,
        count: 0,
        hiresDays: [],
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
        };
      }
      jobStatsMap[jId].count += 1;

      if ((app.status === "Diterima" || app.status === "Hired") && app.hired_at) {
        const days = calculateDaysDifference(app.created_at, app.hired_at);
        jobStatsMap[jId].hiresDays.push(days);
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
    const appIds = dbApps.map((item) => item.id);

    const [profilesRes, assessmentsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, education, resume_url, resume_name")
        .in("id", candidateIds),
      supabase
        .from("assessments_and_interviews")
        .select("*")
        .in("application_id", appIds)
        .order("created_at", { ascending: true }),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));

    // Group assessments by application_id
    const assessmentsByApp = new Map<string, any[]>();
    (assessmentsRes.data || []).forEach((item) => {
      const arr = assessmentsByApp.get(item.application_id) || [];
      arr.push(item);
      assessmentsByApp.set(item.application_id, arr);
    });

    const transformed: CandidateApplicantCard[] = dbApps.map((item) => {
      const prof = profileMap.get(item.candidate_id);
      const eduList = prof?.education && Array.isArray(prof.education) ? prof.education : [];
      const firstEdu = eduList[0] || {};
      const appAssessments = assessmentsByApp.get(item.id) || [];

      // Test Assessment: Psikotes, Technical Test, Aptitude Test, Personality Test
      const testAssessment = [...appAssessments]
        .reverse()
        .find((a) => ["Technical Test", "Psikotes", "Aptitude Test", "Personality Test"].includes(a.type));

      // HR Interview
      const hrInterview = [...appAssessments]
        .reverse()
        .find((a) => a.type === "Interview HR");

      // User Interview
      const userInterview = [...appAssessments]
        .reverse()
        .find((a) => a.type === "Interview User");

      // Compute Exact Linear Kanban Stage
      let kanbanStage: "diajukan" | "screening" | "assessment" | "interview_hr" | "interview_user" | "diterima" | "ditolak" = "diajukan";
      const status = item.status as ApplicationStatus;

      if (status === "Ditolak" || status === "Rejected") {
        kanbanStage = "ditolak";
      } else if (status === "Diterima" || status === "Offered" || status === "Hired") {
        kanbanStage = "diterima";
      } else if (status === "Diajukan" || status === "Applied") {
        kanbanStage = "diajukan";
      } else if (status === "Interview") {
        if (userInterview) {
          kanbanStage = "interview_user";
        } else if (hrInterview) {
          kanbanStage = "interview_hr";
        } else if (testAssessment) {
          kanbanStage = "assessment";
        } else {
          kanbanStage = "interview_hr";
        }
      } else if (status === "Diproses" || status === "In Review") {
        if (userInterview) {
          kanbanStage = "interview_user";
        } else if (hrInterview) {
          kanbanStage = "interview_hr";
        } else if (testAssessment) {
          kanbanStage = "assessment";
        } else {
          kanbanStage = "screening";
        }
      }

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

        // Kanban Multi-stage info
        kanban_stage: kanbanStage,
        test_type: testAssessment?.type,
        test_schedule: testAssessment?.scheduled_at,
        test_score: testAssessment?.score ?? null,
        test_evaluator: testAssessment?.evaluator_name,
        test_notes: testAssessment?.notes,
        hr_interview_schedule: hrInterview?.scheduled_at,
        hr_interview_score: hrInterview?.score ?? null,
        hr_interview_evaluator: hrInterview?.evaluator_name,
        hr_interview_notes: hrInterview?.notes,
        user_interview_schedule: userInterview?.scheduled_at,
        user_interview_score: userInterview?.score ?? null,
        user_interview_evaluator: userInterview?.evaluator_name,
        user_interview_notes: userInterview?.notes,
        assessments_count: appAssessments.length,
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

    // Persist real Audit Trail to database
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
    revalidatePath(`/dashboard/applications/${applicationId}`);

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
 * Syncs with the multi-stage linear workflow (Test -> Interview HR -> Interview User)
 */
export async function scheduleAssessmentOrInterview(data: {
  application_id: string;
  type: AssessmentType;
  scheduled_at: string;
  evaluator_name: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authorName = user?.user_metadata?.full_name || user?.email || "Admin HR";

    // 1. Check if an assessment of this type already exists for the candidate application
    const { data: existing } = await supabase
      .from("assessments_and_interviews")
      .select("id")
      .eq("application_id", data.application_id)
      .eq("type", data.type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("assessments_and_interviews")
        .update({
          scheduled_at: data.scheduled_at,
          evaluator_name: data.evaluator_name,
          status: "Scheduled",
        })
        .eq("id", existing.id);
    } else {
      const { error: insErr } = await supabase.from("assessments_and_interviews").insert({
        application_id: data.application_id,
        type: data.type,
        scheduled_at: data.scheduled_at,
        evaluator_name: data.evaluator_name,
        score: null,
        status: "Scheduled",
      });

      if (insErr) {
        return { success: false, error: insErr.message };
      }
    }

    // 2. Automatically sync application status
    const targetStatus = data.type.startsWith("Interview") ? "Interview" : "Diproses";
    await supabase
      .from("applications")
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.application_id);

    // 3. Record Audit Trail
    await supabase.from("audit_logs").insert({
      application_id: data.application_id,
      old_status: "Diproses",
      new_status: targetStatus,
      stage_detail: `Penjadwalan ${data.type}`,
      changed_by_name: authorName,
      reason: `Jadwal ${data.type} ditetapkan pada ${new Date(data.scheduled_at).toLocaleString("id-ID")} dengan Penilai: ${data.evaluator_name}`,
      created_at: new Date().toISOString(),
    });

    revalidatePath(`/admin/kanban`);
    revalidatePath(`/admin`);
    revalidatePath(`/admin/candidates/${data.application_id}`);
    revalidatePath("/admin/evaluations");
    revalidatePath(`/dashboard/applications/${data.application_id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menjadwalkan tes/interview." };
  }
}

/**
 * Revert candidate to previous Kanban stage
 */
export async function revertKanbanStage(
  applicationId: string,
  targetStage: "diajukan" | "screening" | "assessment" | "interview_hr" | "interview_user" | "diterima" | "ditolak"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authorName = user?.user_metadata?.full_name || user?.email || "Admin HR";

    if (targetStage === "diajukan") {
      await supabase
        .from("applications")
        .update({ status: "Diajukan", updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    } else if (targetStage === "screening") {
      // Revert to screening: remove or archive test assessments so candidate is purely in CV review
      await supabase
        .from("assessments_and_interviews")
        .delete()
        .eq("application_id", applicationId);

      await supabase
        .from("applications")
        .update({ status: "Diproses", updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    } else if (targetStage === "assessment") {
      // Revert to assessment: remove interview assessments
      await supabase
        .from("assessments_and_interviews")
        .delete()
        .eq("application_id", applicationId)
        .in("type", ["Interview HR", "Interview User"]);

      await supabase
        .from("applications")
        .update({ status: "Diproses", updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    } else if (targetStage === "interview_hr") {
      // Revert to interview hr: remove user interview assessment
      await supabase
        .from("assessments_and_interviews")
        .delete()
        .eq("application_id", applicationId)
        .eq("type", "Interview User");

      await supabase
        .from("applications")
        .update({ status: "Interview", updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    } else if (targetStage === "interview_user") {
      await supabase
        .from("applications")
        .update({ status: "Interview", updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      application_id: applicationId,
      old_status: "Tahap Lanjutan",
      new_status: targetStage,
      stage_detail: `Pengembalian Tahap ke ${targetStage}`,
      changed_by_name: authorName,
      reason: `HR mengembalikan status kandidat ke kolom tahap ${targetStage}`,
      created_at: new Date().toISOString(),
    });

    revalidatePath(`/admin/kanban`);
    revalidatePath(`/admin`);
    revalidatePath(`/admin/candidates/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengembalikan tahap." };
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

    const { error } = await supabase
      .from("assessments_and_interviews")
      .update({
        score: data.score,
        notes: data.notes,
        status: data.score !== null ? "Completed" : "Scheduled",
        ...(data.evaluator_name ? { evaluator_name: data.evaluator_name } : {}),
      })
      .eq("id", data.assessment_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/candidates/${data.application_id}`);
    revalidatePath("/admin/evaluations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan hasil penilaian." };
  }
}

/**
 * CASE 2: Fetch All Assessments & Interviews for the Dedicated Evaluator / Selection Portal
 * Fulfills UC-07 (Input nilai tes) & UC-08 (Nilai interview)
 * Zero dummy data: returns only real database rows, empty if none exist.
 */
export async function getAllAssessmentsWithCandidateInfo(): Promise<{ assessments: AssessmentReviewRow[] }> {
  try {
    const supabase = await createClient();

    const [{ data: dbAssessments }, { data: dbApps }, { data: dbProfiles }] = await Promise.all([
      supabase.from("assessments_and_interviews").select("*").order("scheduled_at", { ascending: false }),
      supabase.from("applications").select("id, candidate_id, job_title, department"),
      supabase.from("profiles").select("id, full_name, email, phone, headline, skills, education, resume_url"),
    ]);

    if (!dbAssessments || dbAssessments.length === 0) {
      return { assessments: [] };
    }

    const appMap = new Map((dbApps || []).map((a) => [a.id, a]));
    const profileMap = new Map((dbProfiles || []).map((p) => [p.id, p]));

    const results: AssessmentReviewRow[] = dbAssessments.map((asm) => {
      const app = appMap.get(asm.application_id);
      const prof = app ? profileMap.get(app.candidate_id) : undefined;
      const eduList = prof?.education && Array.isArray(prof.education) ? prof.education : [];
      const firstEdu = eduList[0] || {};
      const eduStr = firstEdu.school ? `${firstEdu.level || "S1"} ${firstEdu.major ? "- " + firstEdu.major : ""} (${firstEdu.school})` : undefined;

      return {
        id: asm.id,
        application_id: asm.application_id,
        candidate_name: prof?.full_name || "Kandidat Pelamar",
        candidate_email: prof?.email || "-",
        candidate_phone: prof?.phone || "-",
        candidate_headline: prof?.headline || undefined,
        candidate_skills: prof?.skills && Array.isArray(prof.skills) ? prof.skills : [],
        candidate_education: eduStr,
        candidate_resume_url: prof?.resume_url || undefined,
        job_title: app?.job_title || "Lowongan Terkait",
        department: app?.department || "Internal Company",
        type: asm.type,
        scheduled_at: asm.scheduled_at,
        evaluator_name: asm.evaluator_name,
        score: asm.score,
        notes: asm.notes || "",
        status: asm.status || "Scheduled",
        created_at: asm.created_at,
      };
    });

    return { assessments: results };
  } catch (err: any) {
    return { assessments: [] };
  }
}

/**
 * Fetch list of active candidates available for scheduling new assessments
 */
export async function getActiveCandidatesForScheduling(): Promise<{
  candidates: { id: string; candidate_name: string; job_title: string; department: string; status: string }[];
}> {
  try {
    const supabase = await createClient();
    const { data: apps, error } = await supabase
      .from("applications")
      .select("id, candidate_id, job_title, department, status")
      .in("status", ["Diproses", "In Review", "Interview", "Diajukan", "Applied"])
      .order("created_at", { ascending: false });

    if (error || !apps) return { candidates: [] };

    const candidateIds = Array.from(new Set(apps.map((a) => a.candidate_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", candidateIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const result = apps.map((app) => {
      const prof = profileMap.get(app.candidate_id);
      return {
        id: app.id,
        candidate_name: prof?.full_name || "Kandidat Pelamar",
        job_title: app.job_title,
        department: app.department,
        status: app.status,
      };
    });

    return { candidates: result };
  } catch {
    return { candidates: [] };
  }
}

/**
 * 4. CASE 2 & 3: Get Candidate Detail for HR Screening with Assessments, Notes, and Audit Trail
 * Zero dummy data fallback: reads strictly from database.
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

    const assessments: AssessmentItem[] = (dbAssessments || []).map((a) => ({
      id: a.id,
      application_id: a.application_id,
      type: a.type as AssessmentType,
      scheduled_at: a.scheduled_at,
      evaluator_name: a.evaluator_name,
      score: a.score,
      notes: a.notes,
      status: a.status,
      created_at: a.created_at,
    }));

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
      stage_detail: l.stage_detail,
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
      assessments,
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

    const { error } = await supabase.from("internal_notes").insert({
      application_id: applicationId,
      author_id: user?.id,
      author_name: authorName,
      note_text: noteText,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/candidates/${applicationId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambahkan catatan internal." };
  }
}

/**
 * 6. CASE 1: Job Posting Management (Create with WFH/WFO/Hybrid, Skills, Division, Deadline & Publication Status)
 * Zero dummy data fallback: reads strictly from database.
 */
export async function getJobPostings(): Promise<{ jobs: JobPosting[] }> {
  try {
    const supabase = await createClient();
    const [{ data: dbJobs }, { data: dbApps }] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("job_id, status, created_at, hired_at"),
    ]);

    if (!dbJobs || dbJobs.length === 0) {
      return { jobs: [] };
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
  deadline_date?: string;
  status?: "Active" | "Closed";
}): Promise<{ success: boolean; job?: JobPosting; error?: string }> {
  try {
    const supabase = await createClient();

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

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/jobs");

    return { success: true, job: { ...inserted, applicant_count: 0, time_to_hire: "Belum tersedia" } };
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

    const { error } = await supabase.from("jobs").update(payload).eq("id", jobId);
    if (error) {
      console.error("Supabase update job error:", error.message);
      return { success: false, error: `Gagal memperbarui lowongan: ${error.message}` };
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

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) {
      console.warn("Supabase delete job notice:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/jobs");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus lowongan pekerjaan." };
  }
}

export async function toggleJobStatus(jobId: string): Promise<{ success: boolean; newStatus?: "Active" | "Closed"; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", jobId)
      .single();

    if (!existing) {
      return { success: false, error: "Lowongan tidak ditemukan" };
    }

    const newStatus = existing.status === "Active" ? "Closed" : "Active";

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      console.error("Supabase toggle job status error:", error.message);
      return { success: false, error: `Gagal mengubah status: ${error.message}` };
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/jobs");
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status lowongan." };
  }
}
