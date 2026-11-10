import { CandidateProfile, ApplicationStatus, AssessmentItem } from "./candidate";

export interface JobPosting {
  id: string;
  title: string;
  dept: string;
  type: string; // WFH | WFO | Hybrid | Full-time
  location: string;
  salary: string;
  status: "Active" | "Closed";
  description: string;
  min_education: "SMA" | "D3" | "S1" | "S2" | "S3";
  required_skills: string[];
  posted_date: string;
  deadline_date?: string;
  created_at?: string;
  applicant_count?: number;
  time_to_hire?: string; // e.g. "12 Hari" or "Belum tersedia"
}

export interface InternalNote {
  id: string;
  application_id: string;
  author_id?: string;
  author_name: string;
  note_text: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  application_id: string;
  old_status: string;
  new_status: string;
  stage_detail?: string;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}

export type KanbanStageKey =
  | "diajukan"
  | "screening"
  | "assessment"
  | "interview_hr"
  | "interview_user"
  | "diterima"
  | "ditolak";

export interface CandidateApplicantCard {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_education_level?: string;
  candidate_university?: string;
  candidate_major?: string;
  job_id: string;
  job_title: string;
  department: string;
  status: ApplicationStatus;
  current_stage_index: number;
  is_qualified?: boolean;
  auto_tags: string[];
  match_score: number; // percentage e.g. 95%
  resume_url?: string;
  resume_name?: string;
  applied_at: string;
  updated_at: string;

  // Multi-stage Kanban Tracking Enrichment
  kanban_stage: KanbanStageKey;
  // Assessment / Tes (Teknis, Psikotes, Aptitude, Personality)
  test_type?: string;
  test_schedule?: string;
  test_score?: number | null;
  test_evaluator?: string;
  test_notes?: string;
  // Interview HR
  hr_interview_schedule?: string;
  hr_interview_score?: number | null;
  hr_interview_evaluator?: string;
  hr_interview_notes?: string;
  // Interview User (Calon Atasan / Tech Lead)
  user_interview_schedule?: string;
  user_interview_score?: number | null;
  user_interview_evaluator?: string;
  user_interview_notes?: string;
  // Total assessments recorded
  assessments_count?: number;
}

export interface CandidateDetailedReview {
  application: {
    id: string;
    candidate_id: string;
    job_id: string;
    job_title: string;
    department: string;
    job_type: string;
    salary: string;
    location: string;
    status: ApplicationStatus;
    current_stage_index: number;
    is_qualified?: boolean;
    hr_notes?: string;
    interview_date?: string;
    interview_link?: string;
    hired_at?: string;
    auto_tags: string[];
    created_at: string;
    updated_at: string;
  };
  profile: CandidateProfile;
  assessments: AssessmentItem[];
  internal_notes: InternalNote[];
  audit_logs: AuditLog[];
}

export interface HRAnalyticsSummary {
  active_jobs_count: number;
  total_applicants: number;
  interviewing_count: number;
  hired_count: number;
  avg_time_to_hire_text: string; // e.g., "12 Hari" or "Belum tersedia"
  applicants_per_job: {
    job_id: string;
    job_title: string;
    department: string;
    count: number;
    time_to_hire: string; // "14 Hari" or "Belum tersedia"
  }[];
  monthly_trend: {
    month: string;
    applications: number;
    hires: number;
  }[];
}

export interface AssessmentReviewRow {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_headline?: string;
  candidate_skills?: string[];
  candidate_education?: string;
  candidate_resume_url?: string;
  job_title: string;
  department: string;
  type: string;
  scheduled_at: string;
  evaluator_name: string;
  score: number | null; // null = Belum Dinilai, 0 = Nilai 0
  notes?: string;
  status: string; // Scheduled | Completed | Cancelled
  created_at?: string;
}

