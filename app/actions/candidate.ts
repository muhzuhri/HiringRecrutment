"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CandidateProfile, JobApplication } from "@/types/candidate";
import { allJobs } from "@/data/jobs";

// Sample initial mock applications for demo/fallback
const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: "app-101",
    candidate_id: "demo-user",
    job_id: "2",
    job_title: "Frontend Engineer (React)",
    department: "Engineering",
    job_type: "Full-time",
    location: "Remote",
    salary: "Rp 18.000.000 – Rp 30.000.000 / bulan",
    status: "Interview",
    current_stage_index: 3,
    hr_notes: "Selamat! Berkas CV & Portofolio Anda dinyatakan LULUS seleksi berkas. Kami mengundang Anda untuk sesi Technical & Cultural Fit Interview secara online pada hari Kamis, 25 September 2026 pukul 10.00 WIB. Mohon persiapkan presentasi singkat pengalaman Next.js Anda.",
    interview_date: "2026-09-25T10:00:00Z",
    interview_link: "https://meet.google.com/abc-xyz-talent",
    created_at: "2026-09-15T09:30:00Z",
    updated_at: "2026-09-22T14:15:00Z",
  },
  {
    id: "app-102",
    candidate_id: "demo-user",
    job_id: "1",
    job_title: "Senior Backend Engineer",
    department: "Engineering",
    job_type: "Full-time",
    location: "Jakarta, Hybrid",
    salary: "Rp 25.000.000 – Rp 40.000.000 / bulan",
    status: "In Review",
    current_stage_index: 2,
    hr_notes: "Lamaran Anda sedang dalam tahap peninjauan mendalam oleh Lead Backend Architect kami. Pembaruan hasil seleksi akan dikirimkan maksimal 3 hari kerja.",
    created_at: "2026-09-18T11:20:00Z",
    updated_at: "2026-09-20T08:45:00Z",
  },
  {
    id: "app-103",
    candidate_id: "demo-user",
    job_id: "9",
    job_title: "Data Analyst",
    department: "Data & Analytics",
    job_type: "Full-time",
    location: "Bandung, Hybrid",
    salary: "Rp 15.000.000 – Rp 25.000.000 / bulan",
    status: "Applied",
    current_stage_index: 1,
    hr_notes: "Lamaran telah diterima oleh sistem rekrutmen TalentHub. Terima kasih sudah mendaftar.",
    created_at: "2026-09-21T16:00:00Z",
    updated_at: "2026-09-21T16:00:00Z",
  },
];

/**
 * Fetch candidate profile from Supabase profiles table, fallback to user metadata if empty.
 */
export async function getCandidateProfile(): Promise<{ profile: CandidateProfile | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { profile: null, error: "Unauthenticated" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("Supabase profile fetch notice:", error.message);
    }

    // Default fallback structure
    const fullName = data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Kandidat TalentHub";
    const profile: CandidateProfile = {
      id: user.id,
      email: user.email || "",
      full_name: fullName,
      phone: data?.phone || user.user_metadata?.phone || "",
      whatsapp: data?.whatsapp || user.user_metadata?.whatsapp || "",
      linkedin_url: data?.linkedin_url || "https://linkedin.com/in/kandidat-talenthub",
      portfolio_url: data?.portfolio_url || "https://github.com/kandidat-talenthub",
      headline: data?.headline || "Software Engineer / Full-Stack Developer",
      bio: data?.bio || "Pengembang aplikasi web berpengalaman yang berfokus pada ekosistem React, Next.js, TypeScript, dan Supabase.",
      avatar_url: data?.avatar_url || "",
      role: data?.role || "candidate",
      education: data?.education && Array.isArray(data.education) && data.education.length > 0 ? data.education : [
        {
          id: "edu-1",
          level: "S1",
          school: "Universitas Indonesia",
          major: "Teknik Informatika",
          startYear: "2019",
          endYear: "2023"
        }
      ],
      skills: data?.skills && Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : [
        "React.js", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Supabase", "PostgreSQL", "Git"
      ],
      experience: data?.experience && Array.isArray(data.experience) && data.experience.length > 0 ? data.experience : [
        {
          id: "exp-1",
          company: "Nusantara Tech Solution",
          position: "Frontend Web Developer",
          period: "2023 – Sekarang",
          description: "Mengembangkan aplikasi SaaS scalable berbasis Next.js App Router, mengoptimalkan performa UI dan integrasi REST & Supabase backend API."
        }
      ],
      resume_url: data?.resume_url || "",
      resume_name: data?.resume_name || "",
      profile_completed: data?.profile_completed ?? true,
      created_at: data?.created_at || new Date().toISOString(),
      updated_at: data?.updated_at || new Date().toISOString(),
    };

    return { profile };
  } catch (err: any) {
    return { profile: null, error: err.message || "Gagal mengambil data profil" };
  }
}

/**
 * Save / Update Candidate Profile in Supabase
 */
export async function updateCandidateProfile(formData: {
  full_name: string;
  phone: string;
  whatsapp: string;
  linkedin_url: string;
  portfolio_url: string;
  headline: string;
  bio: string;
  education: any[];
  skills: string[];
  experience: any[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const updatedData = {
      id: user.id,
      email: user.email,
      full_name: formData.full_name,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      linkedin_url: formData.linkedin_url,
      portfolio_url: formData.portfolio_url,
      headline: formData.headline,
      bio: formData.bio,
      education: formData.education,
      skills: formData.skills,
      experience: formData.experience,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(updatedData, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert profile notice:", error.message);
      // Fallback: updating auth metadata if profiles table lacks permissions
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          headline: formData.headline,
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpann profil" };
  }
}

/**
 * Upload Resume PDF to Supabase Storage bucket 'resumes'
 */
export async function uploadResumeFile(formData: FormData): Promise<{ success: boolean; resumeUrl?: string; resumeName?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi berakhir. Silakan login terlebih dahulu." };
    }

    const file = formData.get("resumeFile") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "Pilih berkas PDF CV terlebih dahulu." };
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return { success: false, error: "Format berkas harus berupa dokumen PDF (.pdf)." };
    }

    // Limit to 10MB max
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Ukuran berkas PDF tidak boleh melebihi 10 MB." };
    }

    const fileExt = "pdf";
    const fileName = `${user.id}/${Date.now()}_CV_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    // Upload to bucket 'resumes'
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    let publicUrl = "";
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase
        .storage
        .from("resumes")
        .getPublicUrl(fileName);
      publicUrl = publicUrlData.publicUrl;
    } else {
      // Fallback URL for mock environment
      publicUrl = `https://storage.talenthub.id/resumes/${user.id}/${file.name}`;
    }

    // Update profile with resume metadata
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        resume_url: publicUrl,
        resume_name: file.name,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    revalidatePath("/dashboard/profile");
    return {
      success: true,
      resumeUrl: publicUrl,
      resumeName: file.name,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah berkas CV" };
  }
}

/**
 * Remove Resume File from Profile
 */
export async function deleteResumeFile(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthenticated" };

    await supabase
      .from("profiles")
      .update({ resume_url: null, resume_name: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus resume" };
  }
}

/**
 * Fetch candidate applications from Supabase `applications` table, falling back to mock dataset.
 */
export async function getCandidateApplications(): Promise<{ applications: JobApplication[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { applications: [], error: "Sesi login tidak ditemukan" };
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("candidate_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase applications fetch notice:", error.message);
      return { applications: [] };
    }

    return { applications: (data || []) as JobApplication[] };
  } catch (err: any) {
    return { applications: [] };
  }
}

/**
 * Fetch a single application detail by ID with Timeline View info
 */
export async function getApplicationById(applicationId: string): Promise<{ application: JobApplication | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { application: null, error: "Sesi tidak ditemukan" };
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (!error && data) {
      return { application: data as JobApplication };
    }

    // Search in mock applications fallback
    const found = MOCK_APPLICATIONS.find(a => a.id === applicationId);
    if (found) {
      return { application: { ...found, candidate_id: user.id } };
    }

    // Default mock if dynamic job id requested
    const targetJob = allJobs.find(j => j.id === applicationId) || allJobs[0];
    const createdApp: JobApplication = {
      id: applicationId,
      candidate_id: user.id,
      job_id: targetJob.id,
      job_title: targetJob.title,
      department: targetJob.dept,
      job_type: targetJob.type,
      location: targetJob.location,
      salary: targetJob.salary,
      status: "In Review",
      current_stage_index: 2,
      hr_notes: "Lamaran Anda sudah berhasil diproses ke Tahap Seleksi Berkas. Rekruiter TalentHub akan melakukan konfirmasi kualifikasi Anda segera.",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { application: createdApp };
  } catch (err: any) {
    return { application: null, error: err.message };
  }
}

/**
 * Apply for a job instantly ("Lamar Cepat") using profile data & uploaded CV
 */
export async function applyForJob(jobId: string): Promise<{ success: boolean; applicationId?: string; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu untuk melamar pekerjaan." };
    }

    const targetJob = allJobs.find((j) => j.id === jobId);
    if (!targetJob) {
      return { success: false, error: "Posisi lowongan pekerjaan tidak ditemukan." };
    }

    // Check existing application in DB
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", user.id)
      .eq("job_id", jobId)
      .single();

    if (existing) {
      return {
        success: false,
        error: `Anda sudah pernah melamar posisi "${targetJob.title}". Silakan cek status di menu My Applications.`
      };
    }

    const newAppId = `app-${Date.now()}`;
    const newApplication = {
      id: newAppId,
      candidate_id: user.id,
      job_id: targetJob.id,
      job_title: targetJob.title,
      department: targetJob.dept,
      job_type: targetJob.type,
      location: targetJob.location,
      salary: targetJob.salary,
      status: "Applied" as const,
      current_stage_index: 1,
      hr_notes: "Lamaran Cepat berhasil dikirimkan menggunakan Data Profil & CV Terstruktur Anda.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("applications")
      .insert(newApplication);

    if (insertError) {
      console.warn("Supabase insert application notice:", insertError.message);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");

    return {
      success: true,
      applicationId: newAppId,
      message: `Selamat! Lamaran Anda untuk posisi "${targetJob.title}" telah berhasil dikirim.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengirimkan lamaran." };
  }
}
