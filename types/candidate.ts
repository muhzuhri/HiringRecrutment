export type ApplicationStatus = 
  | 'Diajukan' 
  | 'Diproses' 
  | 'Interview' 
  | 'Diterima' 
  | 'Ditolak' 
  | 'Applied' 
  | 'In Review' 
  | 'Offered' 
  | 'Rejected' 
  | 'Hired';

export type AssessmentType = 
  | 'Psikotes' 
  | 'Technical Test' 
  | 'Aptitude Test' 
  | 'Personality Test' 
  | 'Interview HR' 
  | 'Interview User';

export interface EducationItem {
  id: string;
  level: 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';
  school: string;
  major: string;
  startYear: string;
  endYear: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface CandidateProfile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  whatsapp?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  education: EducationItem[];
  skills: string[];
  experience: ExperienceItem[];
  resume_url?: string;
  resume_name?: string;
  profile_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentItem {
  id: string;
  application_id: string;
  type: AssessmentType;
  scheduled_at: string;
  evaluator_id?: string;
  evaluator_name: string;
  score: number | null; // null indicates unscored/belum dinilai, 0 is an actual valid score of 0
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at?: string;
}

export interface TimelineStage {
  stageIndex: number; // 1, 2, 3, 4
  title: string;
  subtitle: string;
  description: string;
}

export interface JobApplication {
  id: string;
  candidate_id: string;
  job_id: string;
  job_title: string;
  department: string;
  job_type: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  current_stage_index: number; // 1 to 4
  is_qualified?: boolean;
  hr_notes?: string;
  interview_date?: string;
  interview_link?: string;
  hired_at?: string;
  created_at: string;
  updated_at: string;
}

export const STAGES_CONFIG: TimelineStage[] = [
  {
    stageIndex: 1,
    title: "Tahap 1: Diajukan",
    subtitle: "Lamaran Dikirim",
    description: "Kualifikasi dan dokumen profil berhasil dikirimkan ke sistem rekrutmen perusahaan."
  },
  {
    stageIndex: 2,
    title: "Tahap 2: Diproses",
    subtitle: "Screening & Qualification",
    description: "Tim HR sedang meninjau kualifikasi berkas dan portofolio Anda."
  },
  {
    stageIndex: 3,
    title: "Tahap 3: Interview & Assessment",
    subtitle: "Wawancara & Evaluasi Tes",
    description: "Sesi penilaian asesmen dan wawancara bersama HR & User Lead."
  },
  {
    stageIndex: 4,
    title: "Tahap 4: Keputusan Akhir",
    subtitle: "Penawaran / Diterima",
    description: "Pengumuman hasil akhir rekrutmen dan proses offering letter."
  }
];

