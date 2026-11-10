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
  id?: string;
  level: 'SMA/SMK' | 'D3' | 'S1' | 'S2' | 'S3' | string;
  school: string;
  major: string;
  gpa?: string; // IPK / Nilai Final (misal 3.92 / 4.00)
  coursework?: string; // Mata Kuliah Relevan
  thesis?: string; // Judul Skripsi / Tugas Akhir
  startYear: string;
  endYear: string;
  mediaUrl?: string; // Dokumen/Gambar Ijazah/Transkrip (max 2MB)
  mediaName?: string;
}

export interface CertificationItem {
  id?: string;
  title: string; // Nama sertifikat / pelatihan
  certType?: string; // Tipe Sertifikat
  issuer: string; // Lembaga Penerbit
  issueMonth?: string; // Bulan Perolehan
  issueYear: string; // Tahun Perolehan
  expiryMonth?: string; // Bulan Kadaluarsa
  expiryYear?: string; // Tahun Kadaluarsa
  noExpiry?: boolean; // Tidak Ada Kadaluarsa / Selamanya
  credentialUrl?: string; // URL Kredensial / File Sertifikat
  mediaUrl?: string; // Dokumen/Gambar Bukti Sertifikat (max 2MB)
  mediaName?: string;
}

export interface ExperienceItem {
  id?: string;
  category?: 'work' | 'organization'; // Work Experience vs Pengabdian Masyarakat / Organisasi
  company: string; // Nama Perusahaan / Instansi / Organisasi
  position: string; // Posisi / Peran / Panitia
  location?: string; // Lokasi (misal: Palembang, Sumatera Selatan)
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  period?: string;
  description: string;
  mediaUrl?: string; // Dokumen/Gambar Surat Keterangan (max 2MB)
  mediaName?: string;
}

export interface CandidateProfile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  nik?: string; // NIK / Nomor Identitas
  phone?: string;
  whatsapp?: string;
  address?: string; // Alamat Domisili
  linkedin_url?: string;
  github_url?: string; // Tautan GitHub
  portfolio_url?: string; // Portofolio web
  headline?: string;
  bio?: string; // Ringkasan Profil / About Me
  avatar_url?: string;
  role: 'candidate' | 'recruiter' | 'admin' | 'interviewer';
  education: EducationItem[];
  certifications?: CertificationItem[]; // Sertifikasi & Pelatihan
  skills: string[]; // Key skills list
  hard_skills?: string; // Hard skills text (misal: Data Analysis (SQL, Power BI), Web Dev)
  soft_skills?: string; // Soft skills text (misal: Pemecahan Masalah, Kerja Tim)
  languages?: string; // Bahasa (misal: Indonesia (fluent), English (intermediate))
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

export interface CandidateAuditLog {
  id: string;
  application_id?: string;
  old_status: string;
  new_status: string;
  stage_detail?: string;
  reason?: string;
  created_at: string;
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
  display_status?: string;
  current_stage_index: number; // 1 to 6
  is_qualified?: boolean;
  hr_notes?: string;
  interview_date?: string;
  interview_link?: string;
  hired_at?: string;
  assessments?: AssessmentItem[];
  latest_schedule?: string | null;
  latest_stage_type?: string | null;
  latest_evaluator?: string | null;
  created_at: string;
  updated_at: string;
}

export const STAGES_CONFIG: TimelineStage[] = [
  {
    stageIndex: 1,
    title: "Tahap 1: Diajukan",
    subtitle: "Lamaran Terkirim",
    description: "Kualifikasi dan dokumen profil berhasil dikirimkan ke sistem rekrutmen perusahaan."
  },
  {
    stageIndex: 2,
    title: "Tahap 2: Screening HR",
    subtitle: "Pemeriksaan CV & Kualifikasi",
    description: "Tim HR sedang meninjau kelayakan berkas CV, pengalaman, dan skill pelamar."
  },
  {
    stageIndex: 3,
    title: "Tahap 3: Assessment / Tes",
    subtitle: "Ujian Teknis / Psikotes",
    description: "Pelaksanaan tes kemampuan teknis, psikotes, atau kepribadian yang dinilai oleh tim assessor."
  },
  {
    stageIndex: 4,
    title: "Tahap 4: Interview HR",
    subtitle: "Wawancara dengan HR",
    description: "Sesi wawancara mendalam bersama tim HR & Talent Acquisition mengenai kepribadian & culture fit."
  },
  {
    stageIndex: 5,
    title: "Tahap 5: Interview User",
    subtitle: "Wawancara Calon Atasan",
    description: "Sesi wawancara kompetensi teknis langsung dengan User / Engineering Lead."
  },
  {
    stageIndex: 6,
    title: "Tahap 6: Keputusan Akhir",
    subtitle: "Penawaran / Diterima",
    description: "Penyusunan hasil seluruh nilai dan pengumuman penetapan akhir rekrutmen."
  }
];

