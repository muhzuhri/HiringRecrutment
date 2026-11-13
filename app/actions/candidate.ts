"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CandidateProfile, JobApplication, CandidateAuditLog } from "@/types/candidate";

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
    let education = data?.education && Array.isArray(data.education) ? data.education : [];
    let certifications = data?.certifications && Array.isArray(data.certifications) ? data.certifications : [];
    let experience = data?.experience && Array.isArray(data.experience) ? data.experience : [];
    let skills = data?.skills && Array.isArray(data.skills) ? data.skills : [];

    // Fallback query to relational tables if profiles JSONB is empty
    try {
      if (education.length === 0) {
        const { data: eduDb } = await supabase.from("educations").select("*").eq("user_id", user.id);
        if (eduDb && eduDb.length > 0) {
          education = eduDb.map((e: any) => ({
            id: e.id,
            level: e.level || "S1",
            school: e.school || "",
            major: e.major || "",
            gpa: e.gpa || "",
            startYear: e.start_year || "",
            endYear: e.end_year || "",
            mediaUrl: e.media_url || "",
            mediaName: e.media_name || "",
          }));
        }
      }

      if (certifications.length === 0) {
        const { data: certDb } = await supabase.from("certifications").select("*").eq("user_id", user.id);
        if (certDb && certDb.length > 0) {
          certifications = certDb.map((c: any) => ({
            id: c.id,
            title: c.title || c.cert_name || "",
            certType: c.cert_type || "",
            issuer: c.issuer || "",
            issueMonth: c.issue_month || "Januari",
            issueYear: c.issue_year || "",
            expiryMonth: c.expiry_month || "",
            expiryYear: c.expiry_year || "",
            noExpiry: c.no_expiry ?? false,
            credentialUrl: c.credential_url || "",
            mediaUrl: c.media_url || "",
            mediaName: c.media_name || "",
          }));
        }
      }

      if (experience.length === 0) {
        const { data: expDb } = await supabase.from("experiences").select("*").eq("user_id", user.id);
        if (expDb && expDb.length > 0) {
          experience = expDb.map((ex: any) => ({
            id: ex.id,
            company: ex.company || "",
            position: ex.position || "",
            period: ex.period || "",
            startMonth: ex.start_month || "Januari",
            startYear: ex.start_year || "",
            endMonth: ex.end_month || "Desember",
            endYear: ex.end_year || "",
            isCurrent: ex.is_current ?? false,
            description: ex.description || "",
            mediaUrl: ex.media_url || "",
            mediaName: ex.media_name || "",
          }));
        }
      }

      if (skills.length === 0) {
        const { data: skillDb } = await supabase.from("skills").select("name").eq("user_id", user.id);
        if (skillDb && skillDb.length > 0) {
          skills = skillDb.map((s: any) => s.name);
        }
      }
    } catch (fallbackErr) {
      console.log("Relational tables fallback notice:", fallbackErr);
    }

    const profile: CandidateProfile = {
      id: user.id,
      email: user.email || "",
      full_name: fullName,
      nik: data?.nik || user.user_metadata?.nik || "",
      ktp_url: data?.ktp_url || user.user_metadata?.ktp_url || "",
      ktp_name: data?.ktp_name || user.user_metadata?.ktp_name || "",
      phone: data?.phone || user.user_metadata?.phone || "",
      whatsapp: data?.whatsapp || user.user_metadata?.whatsapp || "",
      address: data?.address || user.user_metadata?.address || "",
      linkedin_url: data?.linkedin_url || "",
      github_url: data?.github_url || "",
      portfolio_url: data?.portfolio_url || "",
      headline: data?.headline || "",
      bio: data?.bio || "",
      avatar_url: data?.avatar_url || "",
      role: data?.role || "candidate",
      education,
      certifications,
      skills,
      hard_skills: data?.hard_skills || user.user_metadata?.hard_skills || "",
      soft_skills: data?.soft_skills || user.user_metadata?.soft_skills || "",
      languages: data?.languages || user.user_metadata?.languages || "",
      experience,
      resume_url: data?.resume_url || user.user_metadata?.resume_url || "",
      resume_name: data?.resume_name || user.user_metadata?.resume_name || "",
      profile_completed: data?.profile_completed ?? false,
      profile_score: data?.profile_score ?? 0,
      created_at: data?.created_at || new Date().toISOString(),
      updated_at: data?.updated_at || new Date().toISOString(),
    };

    return { profile };
  } catch (err: any) {
    return { profile: null, error: err.message || "Gagal mengambil data profil" };
  }
}

/**
 * Save / Update Candidate Profile in Supabase with strict NIK uniqueness & graceful schema fallback
 */
export async function updateCandidateProfile(formData: {
  full_name: string;
  avatar_url?: string;
  nik?: string;
  ktp_url?: string;
  ktp_name?: string;
  phone: string;
  whatsapp: string;
  address?: string;
  linkedin_url: string;
  github_url?: string;
  portfolio_url: string;
  headline: string;
  bio: string;
  education: any[];
  certifications?: any[];
  skills: string[];
  hard_skills?: string;
  soft_skills?: string;
  languages?: string;
  experience: any[];
}): Promise<{ success: boolean; error?: string; completenessScore?: number }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const cleanNik = (formData.nik || "").trim().replace(/[^0-9]/g, "");

    // 1. Validasi Keunikan NIK (1 NIK = 1 Akun Kandidat)
    if (cleanNik) {
      if (cleanNik.length !== 16) {
        return {
          success: false,
          error: "Nomor Induk Kependudukan (NIK) harus berjumlah tepat 16 digit angka sesuai KTP.",
        };
      }

      // Periksa apakah NIK sudah dipakai oleh akun user lain
      try {
        const { data: existingNikUser } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("nik", cleanNik)
          .neq("id", user.id)
          .maybeSingle();

        if (existingNikUser) {
          return {
            success: false,
            error: `NIK "${cleanNik}" sudah terdaftar pada akun lain (${existingNikUser.email || "kandidat lain"}). Setiap kandidat hanya diperbolehkan memiliki 1 akun berdasarkan NIK KTP.`,
          };
        }
      } catch (nikErr) {
        console.warn("NIK uniqueness check notice:", nikErr);
      }
    }

    // 2. Ambil data profil eksisting untuk cek berkas resume / ktp
    let existingResumeUrl = user.user_metadata?.resume_url || "";
    let existingKtpUrl = formData.ktp_url || user.user_metadata?.ktp_url || "";
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("resume_url, ktp_url")
        .eq("id", user.id)
        .maybeSingle();
      if (existingProfile?.resume_url) existingResumeUrl = existingProfile.resume_url;
      if (existingProfile?.ktp_url) existingKtpUrl = existingProfile.ktp_url;
    } catch {}

    // 3. Kalkulasi Skor Kelengkapan Profil (0 - 100%)
    let score = 0;
    if (formData.full_name?.trim()) score += 10;
    if (cleanNik.length === 16) score += 15;
    if (existingKtpUrl?.trim() || formData.ktp_url?.trim()) score += 15;
    if (formData.phone?.trim() || formData.whatsapp?.trim()) score += 10;
    if (formData.address?.trim()) score += 10;
    if (formData.headline?.trim() || formData.bio?.trim()) score += 10;
    if (formData.education && formData.education.length > 0) score += 15;
    if (formData.experience && formData.experience.length > 0) score += 10;
    if (formData.skills && formData.skills.length > 0) score += 5;
    if (existingResumeUrl?.trim()) score += 10;

    const finalScore = Math.min(score, 100);
    const isComplete = finalScore === 100;

    // 4. Update data ke Auth metadata sebagai fallback cadangan
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          nik: cleanNik,
          ktp_url: formData.ktp_url || existingKtpUrl,
          ktp_name: formData.ktp_name || "",
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address || "",
          headline: formData.headline,
          bio: formData.bio,
          hard_skills: formData.hard_skills || "",
          soft_skills: formData.soft_skills || "",
          languages: formData.languages || "",
          profile_score: finalScore,
          profile_completed: isComplete,
        },
      });
    } catch (authMetaErr) {
      console.warn("Auth metadata update notice:", authMetaErr);
    }

    // 5. Payload lengkap dengan seluruh kolom
    const fullPayload: any = {
      id: user.id,
      email: user.email,
      full_name: formData.full_name,
      avatar_url: formData.avatar_url || user.user_metadata?.avatar_url || null,
      nik: cleanNik,
      ktp_url: formData.ktp_url || existingKtpUrl || null,
      ktp_name: formData.ktp_name || null,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      address: formData.address || "",
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url || "",
      portfolio_url: formData.portfolio_url,
      headline: formData.headline,
      bio: formData.bio,
      education: formData.education,
      certifications: formData.certifications || [],
      skills: formData.skills,
      hard_skills: formData.hard_skills || "",
      soft_skills: formData.soft_skills || "",
      languages: formData.languages || "",
      experience: formData.experience,
      profile_completed: isComplete,
      profile_score: finalScore,
      updated_at: new Date().toISOString(),
    };

    // Upaya 1: Coba simpan full payload
    let { error } = await supabase.from("profiles").upsert(fullPayload, { onConflict: "id" });

    // Upaya 2: Jika gagal karena kolom belum dimigrasi di Supabase (schema cache error),
    // simpan kolom esensial dan hilangkan kolom yang belum ada
    if (error && (error.message.includes("schema cache") || error.code === "PGRST204" || error.message.includes("Could not find the"))) {
      console.warn("Schema cache error detected, retrying upsert with safe core columns:", error.message);
      
      const safePayload: any = {
        id: user.id,
        email: user.email,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url || user.user_metadata?.avatar_url || null,
        nik: cleanNik || null,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address || "",
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url || "",
        portfolio_url: formData.portfolio_url,
        headline: formData.headline,
        bio: formData.bio,
        education: formData.education,
        certifications: formData.certifications || [],
        skills: formData.skills,
        experience: formData.experience,
        profile_completed: isComplete,
        updated_at: new Date().toISOString(),
      };

      const retryRes = await supabase.from("profiles").upsert(safePayload, { onConflict: "id" });
      if (retryRes.error) {
        // Fallback lagi jika nik belum ada di DB
        delete safePayload.nik;
        const secondRetry = await supabase.from("profiles").upsert(safePayload, { onConflict: "id" });
        if (secondRetry.error) {
          console.error("Supabase upsert second fallback error:", secondRetry.error.message);
          return { success: false, error: `Gagal menyimpan profil: ${secondRetry.error.message}` };
        }
      }
      error = null;
    } else if (error) {
      console.error("Supabase upsert profile error:", error.message, error.code);
      return { success: false, error: `Gagal menyimpan profil: ${error.message}` };
    }

    // Optional Sync to Relational Tables if exists in Supabase
    try {
      // 1. Sync Educations table
      await supabase.from("educations").delete().eq("user_id", user.id);
      if (formData.education && formData.education.length > 0) {
        const eduRows = formData.education.map((e) => ({
          user_id: user.id,
          level: e.level || "S1",
          school: e.school || "",
          major: e.major || "",
          gpa: e.gpa || "",
          start_year: e.startYear || "",
          end_year: e.endYear || "",
          media_url: e.mediaUrl || null,
          media_name: e.mediaName || null,
        }));
        await supabase.from("educations").insert(eduRows);
      }

      // 2. Sync Certifications table
      await supabase.from("certifications").delete().eq("user_id", user.id);
      if (formData.certifications && formData.certifications.length > 0) {
        const certRows = formData.certifications.map((c) => ({
          user_id: user.id,
          title: c.title || "",
          cert_name: c.title || "",
          cert_type: c.certType || "",
          issuer: c.issuer || "",
          issue_month: c.issueMonth || "",
          issue_year: c.issueYear || "",
          expiry_month: c.expiryMonth || "",
          expiry_year: c.expiryYear || "",
          no_expiry: c.noExpiry ?? false,
          credential_url: c.credentialUrl || "",
          media_url: c.mediaUrl || null,
          media_name: c.mediaName || null,
        }));
        await supabase.from("certifications").insert(certRows);
      }

      // 3. Sync Experiences table
      await supabase.from("experiences").delete().eq("user_id", user.id);
      if (formData.experience && formData.experience.length > 0) {
        const expRows = formData.experience.map((ex) => ({
          user_id: user.id,
          company: ex.company || "",
          position: ex.position || "",
          period: ex.period || "",
          start_month: ex.startMonth || "",
          start_year: ex.startYear || "",
          end_month: ex.endMonth || "",
          end_year: ex.endYear || "",
          is_current: ex.isCurrent || false,
          description: ex.description || "",
          media_url: ex.mediaUrl || null,
          media_name: ex.mediaName || null,
        }));
        await supabase.from("experiences").insert(expRows);
      }

      // 4. Sync Skills table
      await supabase.from("skills").delete().eq("user_id", user.id);
      if (formData.skills && formData.skills.length > 0) {
        const skillRows = formData.skills.map((s) => ({
          user_id: user.id,
          name: s,
        }));
        await supabase.from("skills").insert(skillRows);
      }
    } catch (relErr) {
      console.log("Relational tables sync note:", relErr);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan profil" };
  }
}

/**
 * Server Action: Upload KTP Document (PNG/JPG/WEBP or PDF up to 2MB)
 */
export async function uploadKtpFile(
  formData: FormData
): Promise<{ success: boolean; ktpUrl?: string; ktpName?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const file = formData.get("ktpFile") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "Pilih berkas foto/scan KTP terlebih dahulu." };
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimum 5 MB.`,
      };
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      return {
        success: false,
        error: "Format berkas KTP harus berupa Gambar (PNG, JPG, JPEG, WEBP) atau Dokumen PDF.",
      };
    }

    const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `ktp/${user.id}/${Date.now()}_${sanitizeFileName}`;

    let uploadData: any = null;

    // Coba upload ke candidate-documents atau resumes
    const tryUpload = await supabase.storage.from("candidate-documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    let bucketUsed = "candidate-documents";
    if (tryUpload.error) {
      const fallbackUpload = await supabase.storage.from("resumes").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (fallbackUpload.error) {
        return { success: false, error: `Gagal mengunggah berkas KTP ke Storage: ${fallbackUpload.error.message}` };
      }
      uploadData = fallbackUpload.data;
      bucketUsed = "resumes";
    } else {
      uploadData = tryUpload.data;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketUsed).getPublicUrl(uploadData.path);
    const publicUrl = publicUrlData.publicUrl;

    // Update data di profiles
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        ktp_url: publicUrl,
        ktp_name: file.name,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch {}

    // Update metadata user
    try {
      await supabase.auth.updateUser({
        data: { ktp_url: publicUrl, ktp_name: file.name },
      });
    } catch {}

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      ktpUrl: publicUrl,
      ktpName: file.name,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah berkas KTP" };
  }
}

/**
 * Server Action: Hapus Berkas KTP
 */
export async function deleteKtpFile(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthenticated" };

    try {
      await supabase
        .from("profiles")
        .update({ ktp_url: null, ktp_name: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    } catch {}

    try {
      await supabase.auth.updateUser({
        data: { ktp_url: null, ktp_name: null },
      });
    } catch {}

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus KTP" };
  }
}

/**
 * Server Action: Upload Candidate Profile Avatar Photo (PNG/JPG/JPEG/WEBP up to 2MB)
 */
export async function uploadAvatarFile(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const file = formData.get("avatarFile") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "Pilih berkas foto profil terlebih dahulu." };
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `Ukuran foto (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimum 2 MB.`,
      };
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return {
        success: false,
        error: "Format foto profil harus berupa Gambar (PNG, JPG, JPEG, WEBP).",
      };
    }

    const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `avatars/${user.id}/${Date.now()}_${sanitizeFileName}`;

    let uploadData: any = null;

    // Coba upload ke candidate-documents atau resumes
    const tryUpload = await supabase.storage.from("candidate-documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    let bucketUsed = "candidate-documents";
    if (tryUpload.error) {
      const fallbackUpload = await supabase.storage.from("resumes").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (fallbackUpload.error) {
        return { success: false, error: `Gagal mengunggah foto profil ke Storage: ${fallbackUpload.error.message}` };
      }
      uploadData = fallbackUpload.data;
      bucketUsed = "resumes";
    } else {
      uploadData = tryUpload.data;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketUsed).getPublicUrl(uploadData.path);
    const publicUrl = publicUrlData.publicUrl;

    // Simpan ke tabel profiles
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch (dbErr) {
      console.warn("Profiles avatar upsert notice:", dbErr);
    }

    // Update metadata user
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
    } catch {}

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/applications");

    return {
      success: true,
      avatarUrl: publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah foto profil" };
  }
}

/**
 * Server Action: Hapus Foto Profil
 */
export async function deleteAvatarFile(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthenticated" };

    try {
      await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    } catch {}

    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
    } catch {}

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus foto profil" };
  }
}

/**
 * Server Action: Upload Media Attachment (Images PNG/JPG/WEBP or PDF up to 2MB)
 * for Education, Certification, and Experience sections.
 */
export async function uploadCandidateDocumentFile(
  formData: FormData
): Promise<{ success: boolean; fileUrl?: string; fileName?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "File tidak ditemukan dalam form data." };
    }

    // 1. Validation rule: Max 2MB (2 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimum 5 MB.`,
      };
    }

    // 2. Validation rule: Only PNG, JPG, JPEG, WEBP, or PDF
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: "Format berkas harus berupa dokumen PDF atau Gambar (PNG, JPG, JPEG, WEBP).",
      };
    }

    const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const filePath = `documents/${user.id}/${timestamp}_${sanitizeFileName}`;

    // Ensure bucket candidate-documents exists
    const bucketName = "candidate-documents";

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      // Fallback try bucket 'resumes' if 'candidate-documents' bucket isn't created yet
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (fallbackError) {
        console.error("Storage upload error:", uploadError.message);
        return { success: false, error: `Gagal mengunggah berkas: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fallbackData.path);

      return {
        success: true,
        fileUrl: publicUrlData.publicUrl,
        fileName: file.name,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    return {
      success: true,
      fileUrl: publicUrlData.publicUrl,
      fileName: file.name,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah dokumen" };
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
      const appIds = data.map((a) => a.id);
      let assessmentsMap: Record<string, any[]> = {};
      let auditLogsMap: Record<string, any[]> = {};

      if (appIds.length > 0) {
        // Query scheduled assessments/interviews with correct schema: id, application_id, type, scheduled_at, evaluator_name, score, notes, status
        try {
          const { data: assessData } = await supabase
            .from("assessments_and_interviews")
            .select("id, application_id, type, scheduled_at, evaluator_name, score, notes, status, created_at")
            .in("application_id", appIds)
            .order("scheduled_at", { ascending: false });

          if (assessData) {
            assessData.forEach((item: any) => {
              if (!assessmentsMap[item.application_id]) {
                assessmentsMap[item.application_id] = [];
              }
              assessmentsMap[item.application_id].push(item);
            });
          }
        } catch (assessErr) {
          console.warn("assessments query notice:", assessErr);
        }

        // Query audit logs to detect any scheduled events
        try {
          const { data: logsData } = await supabase
            .from("audit_logs")
            .select("id, application_id, old_status, new_status, stage_detail, reason, created_at")
            .in("application_id", appIds)
            .order("created_at", { ascending: false });

          if (logsData) {
            logsData.forEach((l: any) => {
              if (l.application_id) {
                if (!auditLogsMap[l.application_id]) {
                  auditLogsMap[l.application_id] = [];
                }
                auditLogsMap[l.application_id].push(l);
              }
            });
          }
        } catch {}
      }

      const formatted = data.map((app) => {
        const appAssessments = assessmentsMap[app.id] || [];
        const appLogs = auditLogsMap[app.id] || [];
        const latestAssess = appAssessments[0];

        // Check if test was scheduled in audit log
        const hasTestInLogs = appLogs.some(
          (l) =>
            l.stage_detail?.toLowerCase().includes("tes") ||
            l.stage_detail?.toLowerCase().includes("assessment") ||
            l.reason?.toLowerCase().includes("technical test") ||
            l.reason?.toLowerCase().includes("psikotes")
        );

        const hasUserInLogs = appLogs.some((l) => l.stage_detail?.toLowerCase().includes("user"));

        // Synchronize display_status with Progress Tracking stages:
        // Stage 1: Diajukan
        // Stage 2: Screening HR
        // Stage 3: Assessment / Tes
        // Stage 4: Interview HR
        // Stage 5: Interview User
        // Stage 6: Diterima (Hired)
        // Ditolak
        let displayStatus = app.status;
        const isRejected = app.status === "Ditolak" || app.status === "Rejected";
        const isAccepted = ["Diterima", "Offered", "Hired"].includes(app.status);

        if (isRejected) {
          displayStatus = "Ditolak";
        } else if (isAccepted) {
          displayStatus = "Diterima";
        } else if (latestAssess) {
          if (latestAssess.type === "Interview User") {
            displayStatus = "Interview User";
          } else if (latestAssess.type === "Interview HR") {
            displayStatus = "Interview HR";
          } else if (
            ["Technical Test", "Psikotes", "Aptitude Test", "Personality Test"].includes(latestAssess.type)
          ) {
            displayStatus = "Assessment / Tes";
          }
        } else if (app.status === "Interview") {
          displayStatus = hasUserInLogs ? "Interview User" : "Interview HR";
        } else if (app.status === "Diproses" || app.status === "In Review") {
          displayStatus = hasTestInLogs ? "Assessment / Tes" : "Screening HR";
        } else {
          displayStatus = "Diajukan";
        }

        // Parse scheduled date: from latest assessment or application.interview_date or audit log reason
        let scheduledAt = latestAssess?.scheduled_at || app.interview_date || null;
        let evaluator = latestAssess?.evaluator_name || null;
        let testType = latestAssess?.type || null;

        // Fallback: parse from audit log if assessments table was bypass-inserted
        if (!scheduledAt && hasTestInLogs) {
          const testLog = appLogs.find(
            (l) =>
              l.stage_detail?.toLowerCase().includes("tes") ||
              l.reason?.toLowerCase().includes("technical test") ||
              l.reason?.toLowerCase().includes("psikotes")
          );
          if (testLog) {
            testType = testLog.stage_detail?.replace("Penjadwalan ", "") || "Technical Test";
            // Check if reason contains date: e.g. "Jadwal Technical Test ditetapkan pada 11/11/2026, 17.00.00"
            if (testLog.reason) {
              const match = testLog.reason.match(/pada\s+([\d/]+,\s*[\d.:]+)/i);
              if (match && match[1]) {
                const parts = match[1].replace(/\./g, ":");
                try {
                  const d = new Date(parts);
                  if (!isNaN(d.getTime())) {
                    scheduledAt = d.toISOString();
                  }
                } catch {}
              }
              const evalMatch = testLog.reason.match(/Penilai:\s*([^,.\n]+)/i);
              if (evalMatch && evalMatch[1]) {
                evaluator = evalMatch[1].trim();
              }
            }
          }
        }

        return {
          ...app,
          display_status: displayStatus,
          assessments: appAssessments,
          latest_schedule: scheduledAt,
          latest_stage_type: testType,
          latest_evaluator: evaluator,
        };
      });

      return { applications: formatted as JobApplication[] };
    }

    return { applications: [] };
  } catch (err: any) {
    return { applications: [] };
  }
}

/**
 * CASE 3: Fetch Single Application Detail for Candidate Self-Tracking (Internal notes & score breakdown hidden)
 */
export async function getApplicationById(applicationId: string): Promise<{
  application: JobApplication | null;
  assessments?: any[];
  auditLogs?: CandidateAuditLog[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { application: null, error: "Sesi tidak ditemukan" };
    }

    const { data, error } = await supabase
      .from("applications")
      .select("id, candidate_id, job_id, job_title, department, job_type, location, salary, status, current_stage_index, hr_notes, interview_date, interview_link, created_at, updated_at")
      .eq("id", applicationId)
      .single();

    if (!error && data) {
      // 1. Fetch assessments
      const { data: assessData } = await supabase
        .from("assessments_and_interviews")
        .select("id, application_id, type, scheduled_at, evaluator_name, score, notes, status, created_at")
        .eq("application_id", applicationId)
        .order("scheduled_at", { ascending: false });

      // 2. Fetch audit logs (still kept on server for stage deduction, but hidden in UI)
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("id, old_status, new_status, stage_detail, reason, created_at")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });

      const latestAssess = assessData?.[0];
      const appLogs = logs || [];

      // Check logs for fallback test schedule
      const hasTestInLogs = appLogs.some(
        (l) =>
          l.stage_detail?.toLowerCase().includes("tes") ||
          l.stage_detail?.toLowerCase().includes("assessment") ||
          l.reason?.toLowerCase().includes("technical test") ||
          l.reason?.toLowerCase().includes("psikotes")
      );

      let scheduledAt = latestAssess?.scheduled_at || data.interview_date || null;
      let evaluator = latestAssess?.evaluator_name || null;
      let testType = latestAssess?.type || null;

      if (!scheduledAt && hasTestInLogs) {
        const testLog = appLogs.find(
          (l) =>
            l.stage_detail?.toLowerCase().includes("tes") ||
            l.reason?.toLowerCase().includes("technical test") ||
            l.reason?.toLowerCase().includes("psikotes")
        );
        if (testLog) {
          testType = testLog.stage_detail?.replace("Penjadwalan ", "") || "Technical Test";
          if (testLog.reason) {
            const match = testLog.reason.match(/pada\s+([\d/]+,\s*[\d.:]+)/i);
            if (match && match[1]) {
              const parts = match[1].replace(/\./g, ":");
              try {
                const d = new Date(parts);
                if (!isNaN(d.getTime())) {
                  scheduledAt = d.toISOString();
                }
              } catch {}
            }
            const evalMatch = testLog.reason.match(/Penilai:\s*([^,.\n]+)/i);
            if (evalMatch && evalMatch[1]) {
              evaluator = evalMatch[1].trim();
            }
          }
        }
      }

      return {
        application: {
          ...data,
          assessments: assessData || [],
          latest_schedule: scheduledAt,
          latest_stage_type: testType,
          latest_evaluator: evaluator,
        } as JobApplication,
        assessments: assessData || [],
        auditLogs: (logs || []) as CandidateAuditLog[],
      };
    }

    return { application: null, error: "Lamaran tidak ditemukan" };
  } catch (err: any) {
    return { application: null, error: err.message };
  }
}

/**
 * CASE 1: Apply for Job with strict business rules:
 * Rule A: Validasi Profil Wajib 100% Lengkap (NIK 16 digit, KTP, data diri, pendidikan, skill, pengalaman, CV PDF).
 * Rule B: Kebijakan 1 Lamaran Aktif. Kandidat TIDAK BISA melamar posisi lain jika masih ada lamaran aktif (kecuali berstatus "Ditolak").
 * Rule C: Lowongan yang sudah ditutup atau melewati batas akhir TIDAK BOLEH menerima lamaran baru.
 * Rule D: Simpan status awal lamaran sebagai "Diajukan".
 */
export async function applyForJob(jobId: string): Promise<{ success: boolean; applicationId?: string; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu untuk mengajukan lamaran pekerjaan." };
    }

    // 1. Fetch data profil kandidat & Validasi 100% Lengkap
    const { profile } = await getCandidateProfile();
    if (!profile) {
      return { success: false, error: "Data profil kandidat tidak ditemukan. Silakan lengkapi profil terlebih dahulu." };
    }

    const missingFields: string[] = [];
    if (!profile.full_name?.trim()) missingFields.push("Nama Lengkap");
    if (!profile.nik?.trim() || profile.nik.trim().length !== 16) missingFields.push("NIK (16 Digit KTP)");
    if (!profile.ktp_url?.trim()) missingFields.push("Unggahan Berkas/Foto KTP");
    if (!profile.phone?.trim() && !profile.whatsapp?.trim()) missingFields.push("Nomor Telepon / WhatsApp");
    if (!profile.address?.trim()) missingFields.push("Alamat Domisili");
    if (!profile.headline?.trim() && !profile.bio?.trim()) missingFields.push("Ringkasan Profil / Headline");
    if (!profile.education || profile.education.length === 0) missingFields.push("Riwayat Pendidikan (min. 1 data)");
    if (!profile.skills || profile.skills.length === 0) missingFields.push("Keahlian / Skill (min. 1 skill)");
    if (!profile.experience || profile.experience.length === 0) missingFields.push("Pengalaman Kerja / Organisasi (min. 1 data)");
    if (!profile.resume_url?.trim()) missingFields.push("Berkas CV Utama (PDF max 2MB)");

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Profil Anda belum lengkap 100% (Kelengkapan belum memenuhi standar: ${missingFields.join(", ")}). Sesuai aturan, Anda wajib melengkapi seluruh data profil dan mengunggah berkas KTP serta CV sebelum dapat melamar lowongan pekerjaan.`,
      };
    }

    // 2. Strict Rule: Kebijakan 1 Lamaran Aktif.
    // Jika kandidat memiliki lamaran yang statusnya BUKAN "Ditolak" (atau "Rejected"), blokir pengajuan baru!
    const { data: allUserApps } = await supabase
      .from("applications")
      .select("id, job_id, job_title, status")
      .eq("candidate_id", user.id);

    if (allUserApps && allUserApps.length > 0) {
      const activeApp = allUserApps.find((app) => {
        const s = (app.status || "").toLowerCase();
        return s !== "ditolak" && s !== "rejected";
      });

      if (activeApp) {
        return {
          success: false,
          error: `Anda masih memiliki lamaran aktif untuk posisi "${activeApp.job_title}" dengan status "${activeApp.status}". Sesuai ketentuan rekrutmen, kandidat hanya dapat melamar 1 posisi dalam satu waktu dan baru dapat melamar posisi lain apabila status seleksi sebelumnya telah dinyatakan "Ditolak".`,
        };
      }
    }

    // 3. Fetch target job posting from Supabase
    const { data: targetJob } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!targetJob) {
      return { success: false, error: "Lowongan pekerjaan tidak ditemukan." };
    }

    // Check if job is closed or deadline date has passed
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

    // Initial status saved as "Diajukan"
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

    // Record initial Audit Trail
    await supabase.from("audit_logs").insert({
      application_id: insertedApp.id,
      old_status: "-",
      new_status: "Diajukan",
      stage_detail: "Pendaftaran Lamaran Baru",
      changed_by_name: user.email || profile.full_name || "Kandidat",
      reason: "Kandidat berhasil mengajukan lamaran baru (Profil 100% Terverifikasi).",
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
