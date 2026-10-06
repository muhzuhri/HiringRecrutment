import { CandidateProfile, ApplicationStatus, EducationItem, ExperienceItem } from "./candidate";

export interface JobPosting {
  id: string;
  title: string;
  dept: string;
  type: string;
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
  old_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}

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
  auto_tags: string[];
  match_score: number; // percentage e.g. 95%
  resume_url?: string;
  resume_name?: string;
  applied_at: string;
  updated_at: string;
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
    hr_notes?: string;
    interview_date?: string;
    interview_link?: string;
    auto_tags: string[];
    created_at: string;
    updated_at: string;
  };
  profile: CandidateProfile;
  internal_notes: InternalNote[];
  audit_logs: AuditLog[];
}

export interface HRAnalyticsSummary {
  active_jobs_count: number;
  total_applicants: number;
  interviewing_count: number;
  hired_count: number;
  avg_time_to_hire_days: number;
  applicants_per_job: {
    job_id: string;
    job_title: string;
    department: string;
    count: number;
  }[];
  monthly_trend: {
    month: string;
    applications: number;
    hires: number;
  }[];
}
