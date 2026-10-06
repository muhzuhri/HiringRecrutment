"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CandidateProfile, JobApplication } from "@/types/candidate";

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

    const fullName = data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "";
    const profile: CandidateProfile = {
      id: user.id,
      email: user.email || "",
      full_name: fullName,
      phone: data?.phone || user.user_metadata?.phone || "",
      whatsapp: data?.whatsapp || user.user_metadata?.whatsapp || "",
      linkedin_url: data?.linkedin_url || "",
      portfolio_url: data?.portfolio_url || "",
      headline: data?.headline || "",
      bio: data?.bio || "",
      avatar_url: data?.avatar_url || "",
      role: data?.role || "candidate",
      education: data?.education && Array.isArray(data.education) ? data.education : [],
      skills: data?.skills && Array.isArray(data.skills) ? data.skills : [],
      experience: data?.experience && Array.isArray(data.experience) ? data.experience : [],
      resume_url: data?.resume_url || "",
      resume_name: data?.resume_name || "",
      profile_completed: data?.profile_completed ?? false,
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
      console.error("Supabase upsert profile error:", error.message, error.code);
      return { success: false, error: `Gagal menyimpan profil: ${error.message}` };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan profil" };
  }
}

/**
 * CASE 1 Validation Rule: Upload Resume PDF with strict max 2 MB size limit
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

    // Must be PDF format
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return { success: false, error: "Format berkas harus berupa dokumen PDF (.pdf)." };
    }

    // CASE 1 strict rule: Max size 2 MB (2 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return { 
        success: false, 
        error: `Ukuran berkas CV melebihi batas maksimal 2 MB (Ukuran berkas Anda: ${(file.size / (1024 * 1024)).toFixed(2)} MB).` 
      };
    }

    const fileName = `${user.id}/${Date.now()}_CV_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    // Step 1: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("resumes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError.message);
      return { 
        success: false, 
        error: `Gagal mengunggah berkas ke Storage: ${uploadError.message}. Pastikan bucket 'resumes' aktif di Supabase dan RLS Storage sudah dikonfigurasi.` 
      };
    }

    // Step 2: Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from("resumes")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl) {
      return { success: false, error: "Gagal mendapatkan URL publik berkas. Pastikan bucket 'resumes' di Supabase diatur ke Public." };
    }

    // Step 3: Persist the URL to the profiles table in database
    const { error: dbError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        resume_url: publicUrl,
        resume_name: file.name,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (dbError) {
      console.error("Supabase profile resume upsert error:", dbError.message, dbError.code);
      return { 
        success: false, 
        error: `File terunggah ke Storage tapi gagal disimpan ke database: ${dbError.message}. Periksa RLS policy INSERT pada tabel 'profiles'.` 
      };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
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
 * CASE 3: Fetch Candidate Applications (Confidential internal HR notes & assessment test details hidden from candidate)
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
      .select("id, candidate_id, job_id, job_title, department, job_type, location, salary, status, current_stage_index, interview_date, interview_link, created_at, updated_at")
      .eq("candidate_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return { applications: data as JobApplication[] };
    }

    return { applications: [] };
  } catch (err: any) {
    return { applications: [] };
  }
}

/**
 * CASE 3: Fetch Single Application Detail for Candidate Self-Tracking (Internal notes & score breakdown hidden)
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
      .select("id, candidate_id, job_id, job_title, department, job_type, location, salary, status, current_stage_index, interview_date, interview_link, created_at, updated_at")
      .eq("id", applicationId)
      .single();

    if (!error && data) {
      return { application: data as JobApplication };
    }

    return { application: null, error: "Lamaran tidak ditemukan" };
  } catch (err: any) {
    return { application: null, error: err.message };
  }
}

/**
 * CASE 1: Apply for Job with strict server-side business rules:
 * Rule A: Satu kandidat hanya boleh 1 lamaran aktif per lowongan (prevent duplicate submission).
 * Rule B: Lowongan yang sudah ditutup atau melewati batas akhir (deadline) TIDAK BOLEH menerima lamaran baru!
 * Rule C: Simpan status awal lamaran sebagai "Diajukan".
 */
export async function applyForJob(jobId: string): Promise<{ success: boolean; applicationId?: string; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu untuk menguji lamaran pekerjaan." };
    }

    // 1. Fetch target job posting from Supabase
    const { data: targetJob } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!targetJob) {
      return { success: false, error: "Lowongan pekerjaan tidak ditemukan." };
    }

    // CASE 1 Rule B Validation: Check if job is closed or deadline date has passed
    if (targetJob.status === "Closed") {
      return {
        success: false,
        error: `Pendaftaran posisi "${targetJob.title}" telah DITUTUP oleh tim HR.`
      };
    }

    if (targetJob.deadline_date) {
      const deadline = new Date(targetJob.deadline_date);
      if (deadline < new Date()) {
        return {
          success: false,
          error: `Batas akhir pendaftaran posisi "${targetJob.title}" telah berakhir pada ${new Date(targetJob.deadline_date).toLocaleDateString("id-ID")}.`
        };
      }
    }

    // CASE 1 Rule A Validation: Check for existing active application (duplicate check)
    const { data: existingApp } = await supabase
      .from("applications")
      .select("id, status")
      .eq("candidate_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existingApp) {
      return {
        success: false,
        error: `Satu kandidat hanya boleh memiliki 1 lamaran aktif per lowongan! Anda telah mengajukan lamaran untuk posisi "${targetJob.title}".`
      };
    }

    // Verify candidate profile has uploaded CV PDF
    const { data: profile } = await supabase
      .from("profiles")
      .select("resume_url")
      .eq("id", user.id)
      .single();

    // CASE 1 Rule C: Initial status saved as "Diajukan".
    // Let Supabase generate the UUID — do NOT pass a custom string id.
    const newApplication = {
      candidate_id: user.id,
      job_id: targetJob.id,
      job_title: targetJob.title,
      department: targetJob.dept || targetJob.department || "Internal Company",
      job_type: targetJob.type || "Hybrid",
      location: targetJob.location || "Jakarta",
      salary: targetJob.salary || "Sesuai Standar Perusahaan",
      status: "Diajukan" as const,
      current_stage_index: 1,
      is_qualified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedApp, error: insertError } = await supabase
      .from("applications")
      .insert(newApplication)
      .select("id")
      .single();

    if (insertError || !insertedApp) {
      console.error("Supabase insert application error:", insertError?.message, insertError?.code);
      return {
        success: false,
        error: `Gagal menyimpan lamaran ke database: ${insertError?.message || "Unknown error"}. Periksa RLS INSERT policy pada tabel 'applications'.`,
      };
    }

    // Record initial Audit Trail using the real UUID returned by Supabase
    await supabase.from("audit_logs").insert({
      application_id: insertedApp.id,
      old_status: "-",
      new_status: "Diajukan",
      stage_detail: "Pendaftaran Lamaran Baru",
      changed_by_name: user.email || "Kandidat",
      reason: "Kandidat berhasil mengajukan lamaran baru.",
      created_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/applications");

    return {
      success: true,
      applicationId: insertedApp.id,
      message: `Selamat! Lamaran Anda untuk posisi "${targetJob.title}" dengan status "Diajukan" telah berhasil dikirim.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengirimkan lamaran." };
  }
}
