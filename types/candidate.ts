export type ApplicationStatus = 'Applied' | 'In Review' | 'Interview' | 'Offered' | 'Rejected' | 'Hired';

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
  hr_notes?: string;
  interview_date?: string;
  interview_link?: string;
  created_at: string;
  updated_at: string;
}

export const STAGES_CONFIG: TimelineStage[] = [
  {
    stageIndex: 1,
    title: "Tahap 1: Pendaftaran",
    subtitle: "Lamaran Dikirim",
    description: "Berkualifikasi dan dokumen profil berhasil dikirimkan ke sistem rekrutmen TalentHub."
  },
  {
    stageIndex: 2,
    title: "Tahap 2: Seleksi Berkas",
    subtitle: "Screening Portofolio & CV",
    description: "Tim HR sedang meninjau pengalaman kerja, pendidikan, dan kesesuaian profil Anda."
  },
  {
    stageIndex: 3,
    title: "Tahap 3: Interview",
    subtitle: "Wawancara HR & User Lead",
    description: "Sesi wawancara kompetensi teknis dan budaya kerja bersama tim TalentHub."
  },
  {
    stageIndex: 4,
    title: "Tahap 4: Keputusan Akhir",
    subtitle: "Offering & Final Verification",
    description: "Pengumuman kelulusan akhir dan penerbitan Surat Penawaran Kerja (Offering Letter)."
  }
];
