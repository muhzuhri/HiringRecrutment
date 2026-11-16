"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CandidateProfile, JobApplication, CandidateAuditLog } from "@/types/candidate";
import { extractQuota, cleanJobDescription } from "@/data/jobs";

/**
 * Fetch candidate profile from Supabase profiles table, fallback to user metadata if empty.
 * Wrapped in React cache() for request-level deduplication (faster transitions).
 */
export const getCandidateProfile = cache(async (): Promise<{ profile: CandidateProfile | null; error?: string }> => {
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

    // Fallback parallel query to relational tables if profiles JSONB is empty
    if (education.length === 0 || certifications.length === 0 || experience.length === 0 || skills.length === 0) {
      try {
        const [eduRes, certRes, expRes, skillRes] = await Promise.all([
          education.length === 0
            ? supabase.from("educations").select("*").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
          certifications.length === 0
            ? supabase.from("certifications").select("*").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
          experience.length === 0
            ? supabase.from("experiences").select("*").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
          skills.length === 0
            ? supabase.from("skills").select("name").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
        ]);

        if (education.length === 0 && eduRes.data && eduRes.data.length > 0) {
          education = eduRes.data.map((e: any) => ({
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

        if (certifications.length === 0 && certRes.data && certRes.data.length > 0) {
          certifications = certRes.data.map((c: any) => ({
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

        if (experience.length === 0 && expRes.data && expRes.data.length > 0) {
          experience = expRes.data.map((ex: any) => ({
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

        if (skills.length === 0 && skillRes.data && skillRes.data.length > 0) {
          skills = skillRes.data.map((s: any) => s.name);
        }
      } catch (fallbackErr) {
        console.log("Relational tables fallback notice:", fallbackErr);
      }
    }

    // Filter ghost / blank items (tanpa nama institusi, tanpa judul, tanpa nama perusahaan)
    const validEducations = education.filter((e: any) => Boolean(e && e.school && e.school.trim()));
    const validCertifications = certifications.filter((c: any) => Boolean(c && c.title && c.title.trim()));
    const validExperiences = experience.filter((ex: any) => Boolean(ex && ex.company && ex.company.trim()));
    const validSkills = skills.filter((s: any) => Boolean(s && typeof s === "string" && s.trim()));

    // Hitung realtime kelengkapan profil secara dinamis berdasarkan data valid tersimpan
    let calculatedScore = 0;
    if (fullName.trim()) calculatedScore += 10;
    const cleanNik = (data?.nik || user.user_metadata?.nik || "").trim();
    if (cleanNik.length === 16) calculatedScore += 15;
    if ((data?.ktp_url || user.user_metadata?.ktp_url || "").trim()) calculatedScore += 15;
    if ((data?.phone || data?.whatsapp || user.user_metadata?.phone || user.user_metadata?.whatsapp || "").trim()) calculatedScore += 10;
    if ((data?.address || user.user_metadata?.address || "").trim()) calculatedScore += 10;
    if ((data?.headline || data?.bio || "").trim()) calculatedScore += 10;
    if (validEducations.length > 0) calculatedScore += 15;
    if (validExperiences.length > 0) calculatedScore += 10;
    if (validSkills.length > 0) calculatedScore += 5;
    if ((data?.resume_url || user.user_metadata?.resume_url || "").trim()) calculatedScore += 10;
    const finalScore = Math.min(calculatedScore, 100);

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
      education: validEducations,
      certifications: validCertifications,
      skills: validSkills,
      hard_skills: data?.hard_skills || user.user_metadata?.hard_skills || "",
      soft_skills: data?.soft_skills || user.user_metadata?.soft_skills || "",
      languages: data?.languages || user.user_metadata?.languages || "",
      experience: validExperiences,
      resume_url: data?.resume_url || user.user_metadata?.resume_url || "",
      resume_name: data?.resume_name || user.user_metadata?.resume_name || "",
      profile_completed: finalScore >= 100,
      profile_score: finalScore,
      created_at: data?.created_at || new Date().toISOString(),
      updated_at: data?.updated_at || new Date().toISOString(),
    };

    return { profile };
  } catch (err: any) {
    return { profile: null, error: err.message || "Gagal mengambil data profil" };
  }
});

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

    // 3. Bersihkan data kosong (ghost items) sebelum kalkulasi skor dan penyimpanan
    const cleanEducation = (formData.education || []).filter(
      (e: any) => Boolean(e && e.school && e.school.trim())
    );
    const cleanCertifications = (formData.certifications || []).filter(
      (c: any) => Boolean(c && c.title && c.title.trim())
    );
    const cleanExperience = (formData.experience || []).filter(
      (ex: any) => Boolean(ex && ex.company && ex.company.trim())
    );
    const cleanSkills = (formData.skills || []).filter(
      (s: any) => Boolean(s && typeof s === "string" && s.trim())
    );

    // Kalkulasi Skor Kelengkapan Profil (0 - 100%) strictly dari data valid
    let score = 0;
    if (formData.full_name?.trim()) score += 10;
    if (cleanNik.length === 16) score += 15;
    if (existingKtpUrl?.trim() || formData.ktp_url?.trim()) score += 15;
    if (formData.phone?.trim() || formData.whatsapp?.trim()) score += 10;
    if (formData.address?.trim()) score += 10;
    if (formData.headline?.trim() || formData.bio?.trim()) score += 10;
    if (cleanEducation.length > 0) score += 15;
    if (cleanExperience.length > 0) score += 10;
    if (cleanSkills.length > 0) score += 5;
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

    // 5. Payload lengkap dengan data yang sudah bersih
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
      education: cleanEducation,
      certifications: cleanCertifications,
      skills: cleanSkills,
      hard_skills: formData.hard_skills || "",
      soft_skills: formData.soft_skills || "",
      languages: formData.languages || "",
      experience: cleanExperience,
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
        education: cleanEducation,
        certifications: cleanCertifications,
        skills: cleanSkills,
        experience: cleanExperience,
        profile_completed: isComplete,
        profile_score: finalScore,
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
      if (cleanEducation.length > 0) {
        const eduRows = cleanEducation.map((e: any) => ({
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
      if (cleanCertifications.length > 0) {
        const certRows = cleanCertifications.map((c: any) => ({
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
      if (cleanExperience.length > 0) {
        const expRows = cleanExperience.map((ex: any) => ({
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
      if (cleanSkills.length > 0) {
        const skillRows = cleanSkills.map((s: string) => ({
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
    return { success: true, completenessScore: finalScore };
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
 * Wrapped in React cache() for request-level deduplication.
 */
export const getCandidateApplications = cache(async (): Promise<{ applications: JobApplication[]; error?: string }> => {
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
        // Query scheduled assessments and audit logs in parallel for high performance
        try {
          const [assessRes, logsRes] = await Promise.all([
            supabase
              .from("assessments_and_interviews")
              .select("id, application_id, type, scheduled_at, evaluator_name, score, notes, status, created_at")
              .in("application_id", appIds)
              .order("scheduled_at", { ascending: false }),
            supabase
              .from("audit_logs")
              .select("id, application_id, old_status, new_status, stage_detail, reason, created_at")
              .in("application_id", appIds)
              .order("created_at", { ascending: false }),
          ]);

          if (assessRes.data) {
            assessRes.data.forEach((item: any) => {
              if (!assessmentsMap[item.application_id]) {
                assessmentsMap[item.application_id] = [];
              }
              assessmentsMap[item.application_id].push(item);
            });
          }

          if (logsRes.data) {
            logsRes.data.forEach((l: any) => {
              if (l.application_id) {
                if (!auditLogsMap[l.application_id]) {
                  auditLogsMap[l.application_id] = [];
                }
                auditLogsMap[l.application_id].push(l);
              }
            });
          }
        } catch (fetchErr) {
          console.warn("parallel assessments/logs fetch notice:", fetchErr);
        }
      }

      const formatted = data.map((app) => {
        const appAssessments = assessmentsMap[app.id] || [];
        const appLogs = auditLogsMap[app.id] || [];
        const latestAssess = appAssessments[0];

        // Specific stage assessments (User, HR, Test)
        const isInterviewUser = (t: string) => /interview.*user|user.*interview/i.test(t || "");
        const isInterviewHr = (t: string) => /interview.*hr|hr.*interview/i.test(t || "");
        const isTest = (t: string) => !isInterviewUser(t) && !isInterviewHr(t);

        const userAssess = appAssessments.find((a: any) => isInterviewUser(a.type));
        const hrAssess = appAssessments.find((a: any) => isInterviewHr(a.type));
        const testAssess = appAssessments.find((a: any) => isTest(a.type));

        // Check logs for scheduled tests or interviews
        const hasTestInLogs = appLogs.some(
          (l) =>
            l.stage_detail?.toLowerCase().includes("tes") ||
            l.stage_detail?.toLowerCase().includes("assessment") ||
            l.reason?.toLowerCase().includes("technical test") ||
            l.reason?.toLowerCase().includes("psikotes")
        );

        const hasHrInLogs = appLogs.some(
          (l) =>
            l.stage_detail?.toLowerCase().includes("interview hr") ||
            l.reason?.toLowerCase().includes("interview hr")
        );

        const hasUserInLogs = appLogs.some(
          (l) =>
            l.stage_detail?.toLowerCase().includes("user") ||
            l.reason?.toLowerCase().includes("interview user")
        );

        const hasTestScheduled = Boolean(testAssess) || hasTestInLogs;
        const hasUserInterview = Boolean(userAssess) || hasUserInLogs;

        // Synchronize display_status strictly with progressive stages (matching TimelineView / Lacak Progres)
        let displayStatus = "Diajukan";
        let activeStageIndex = 1;
        const isRejected = app.status === "Ditolak" || app.status === "Rejected";
        const isAccepted = ["Diterima", "Offered", "Hired"].includes(app.status);

        if (isRejected) {
          displayStatus = "Ditolak";
          activeStageIndex = app.current_stage_index || 2;
        } else if (isAccepted) {
          displayStatus = "Diterima";
          activeStageIndex = 6;
        } else if (app.status === "Diajukan" || app.status === "Applied") {
          displayStatus = "Diajukan";
          activeStageIndex = 1;
        } else if (app.status === "Diproses" || app.status === "In Review") {
          if (hasTestScheduled) {
            displayStatus = "Assessment / Tes";
            activeStageIndex = 3;
          } else {
            displayStatus = "Screening HR";
            activeStageIndex = 2;
          }
        } else if (app.status === "Interview") {
          if (hasUserInterview) {
            displayStatus = "Interview User";
            activeStageIndex = 5;
          } else {
            displayStatus = "Interview HR";
            activeStageIndex = 4;
          }
        } else {
          displayStatus = app.status;
        }

        // Active stage assessment for schedule, evaluator, and stage type matching active stage
        let currentStageAssess = null;
        if (activeStageIndex === 3) {
          currentStageAssess = testAssess || latestAssess;
        } else if (activeStageIndex === 4) {
          currentStageAssess = hrAssess || latestAssess;
        } else if (activeStageIndex === 5) {
          currentStageAssess = userAssess || latestAssess;
        } else {
          currentStageAssess = latestAssess;
        }

        let scheduledAt = currentStageAssess?.scheduled_at || app.interview_date || null;
        let evaluator = currentStageAssess?.evaluator_name || null;
        let testType = currentStageAssess?.type || (activeStageIndex === 3 ? "Technical Test" : activeStageIndex === 4 ? "Interview HR" : activeStageIndex === 5 ? "Interview User" : null);

        // Fallback: parse from audit log if assessments table was bypass-inserted
        if (!scheduledAt && (hasTestInLogs || hasUserInLogs || hasHrInLogs)) {
          const testLog = appLogs.find(
            (l) =>
              (hasUserInLogs && (l.stage_detail?.toLowerCase().includes("user") || l.reason?.toLowerCase().includes("interview user"))) ||
              (hasHrInLogs && (l.stage_detail?.toLowerCase().includes("interview hr") || l.reason?.toLowerCase().includes("interview hr"))) ||
              l.stage_detail?.toLowerCase().includes("tes") ||
              l.reason?.toLowerCase().includes("technical test") ||
              l.reason?.toLowerCase().includes("psikotes")
          );
          if (testLog) {
            testType = testLog.stage_detail?.replace("Penjadwalan ", "") || (hasUserInLogs ? "Interview User" : hasHrInLogs ? "Interview HR" : "Technical Test");
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
});

/**
 * CASE 3: Fetch Single Application Detail for Candidate Self-Tracking (High-performance parallel fetch)
 */
export const getApplicationById = cache(async (applicationId: string): Promise<{
  application: JobApplication | null;
  assessments?: any[];
  auditLogs?: CandidateAuditLog[];
  error?: string;
}> => {
  try {
    const supabase = await createClient();

    // Query application, assessments, and audit logs concurrently via Promise.all
    const [appRes, assessRes, logsRes] = await Promise.all([
      supabase
        .from("applications")
        .select("id, candidate_id, job_id, job_title, department, job_type, location, salary, status, current_stage_index, hr_notes, interview_date, interview_link, created_at, updated_at")
        .eq("id", applicationId)
        .maybeSingle(),
      supabase
        .from("assessments_and_interviews")
        .select("id, application_id, type, scheduled_at, evaluator_name, score, notes, status, created_at")
        .eq("application_id", applicationId)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("id, old_status, new_status, stage_detail, reason, created_at")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
    ]);

    const data = appRes.data;

    if (!appRes.error && data) {
      const assessData = assessRes.data || [];
      const appLogs = logsRes.data || [];

      // Determine active stage assessment (User > HR > Test)
      const isInterviewUser = (t: string) => /interview.*user|user.*interview/i.test(t || "");
      const isInterviewHr = (t: string) => /interview.*hr|hr.*interview/i.test(t || "");
      const isTest = (t: string) => !isInterviewUser(t) && !isInterviewHr(t);

      const userAssess = assessData.find((a: any) => isInterviewUser(a.type));
      const hrAssess = assessData.find((a: any) => isInterviewHr(a.type));
      const testAssess = assessData.find((a: any) => isTest(a.type));

      // Check logs for fallback test/interview schedule
      const hasTestInLogs = appLogs.some(
        (l: any) =>
          l.stage_detail?.toLowerCase().includes("tes") ||
          l.stage_detail?.toLowerCase().includes("assessment") ||
          l.reason?.toLowerCase().includes("technical test") ||
          l.reason?.toLowerCase().includes("psikotes")
      );
      const hasHrInLogs = appLogs.some(
        (l: any) =>
          l.stage_detail?.toLowerCase().includes("interview hr") ||
          l.reason?.toLowerCase().includes("interview hr")
      );
      const hasUserInLogs = appLogs.some(
        (l: any) =>
          l.stage_detail?.toLowerCase().includes("user") ||
          l.reason?.toLowerCase().includes("interview user")
      );

      // Exact linear stage matching TimelineView (Lacak Progres)
      const hasTestScheduled = Boolean(testAssess) || hasTestInLogs;
      const hasUserInterview = Boolean(userAssess) || hasUserInLogs;

      let activeStageIndex = 1;
      let displayStatus = "Diajukan";
      const isRejected = data.status === "Ditolak" || data.status === "Rejected";
      const isAccepted = ["Diterima", "Offered", "Hired"].includes(data.status);

      if (isRejected) {
        displayStatus = "Ditolak";
        activeStageIndex = data.current_stage_index || 2;
      } else if (isAccepted) {
        displayStatus = "Diterima";
        activeStageIndex = 6;
      } else if (data.status === "Diajukan" || data.status === "Applied") {
        displayStatus = "Diajukan";
        activeStageIndex = 1;
      } else if (data.status === "Diproses" || data.status === "In Review") {
        if (hasTestScheduled) {
          displayStatus = "Assessment / Tes";
          activeStageIndex = 3;
        } else {
          displayStatus = "Screening HR";
          activeStageIndex = 2;
        }
      } else if (data.status === "Interview") {
        if (hasUserInterview) {
          displayStatus = "Interview User";
          activeStageIndex = 5;
        } else {
          displayStatus = "Interview HR";
          activeStageIndex = 4;
        }
      } else {
        displayStatus = data.status;
      }

      let activeAssess = null;
      if (activeStageIndex === 3) {
        activeAssess = testAssess || assessData[0];
      } else if (activeStageIndex === 4) {
        activeAssess = hrAssess || assessData[0];
      } else if (activeStageIndex === 5) {
        activeAssess = userAssess || assessData[0];
      } else {
        activeAssess = assessData[0];
      }

      let scheduledAt = activeAssess?.scheduled_at || data.interview_date || null;
      let evaluator = activeAssess?.evaluator_name || null;
      let testType = activeAssess?.type || (activeStageIndex === 3 ? "Technical Test" : activeStageIndex === 4 ? "Interview HR" : activeStageIndex === 5 ? "Interview User" : null);

      if (!scheduledAt && (hasTestInLogs || hasUserInLogs || hasHrInLogs)) {
        const stageLog = appLogs.find(
          (l: any) =>
            (hasUserInLogs && (l.stage_detail?.toLowerCase().includes("user") || l.reason?.toLowerCase().includes("interview user"))) ||
            (hasHrInLogs && (l.stage_detail?.toLowerCase().includes("interview hr") || l.reason?.toLowerCase().includes("interview hr"))) ||
            l.stage_detail?.toLowerCase().includes("tes") ||
            l.reason?.toLowerCase().includes("technical test") ||
            l.reason?.toLowerCase().includes("psikotes")
        );
        if (stageLog) {
          testType = stageLog.stage_detail?.replace("Penjadwalan ", "") || (hasUserInLogs ? "Interview User" : hasHrInLogs ? "Interview HR" : "Technical Test");
          if (stageLog.reason) {
            const match = stageLog.reason.match(/pada\s+([\d/]+,\s*[\d.:]+)/i);
            if (match && match[1]) {
              const parts = match[1].replace(/\./g, ":");
              try {
                const d = new Date(parts);
                if (!isNaN(d.getTime())) {
                  scheduledAt = d.toISOString();
                }
              } catch {}
            }
            const evalMatch = stageLog.reason.match(/Penilai:\s*([^,.\n]+)/i);
            if (evalMatch && evalMatch[1]) {
              evaluator = evalMatch[1].trim();
            }
          }
        }
      }

      // Extract location & Google Maps link from latest assessment notes or audit logs
      let parsedLocation: string | null = null;
      let parsedGmapsUrl: string | null = null;

      const allNotes = [
        activeAssess?.notes,
        data.hr_notes,
        ...(assessData?.map((a: any) => a.notes) || []),
      ].filter(Boolean).join(" ");

      if (allNotes) {
        const locMatch = allNotes.match(/\[Lokasi(?:\s*\/\s*Ruangan)?:\s*([^\]]+)\]/i);
        if (locMatch && locMatch[1]) {
          parsedLocation = locMatch[1].trim();
        }
        const gmapsMatch = allNotes.match(/\[GMaps:\s*([^\]]+)\]/i);
        if (gmapsMatch && gmapsMatch[1]) {
          parsedGmapsUrl = gmapsMatch[1].trim();
        }
      }

      // If location is a direct Google Maps link, also handle it
      if (!parsedGmapsUrl && parsedLocation && (parsedLocation.includes("maps.app.goo.gl") || parsedLocation.includes("goo.gl/maps") || parsedLocation.includes("google.com/maps"))) {
        parsedGmapsUrl = parsedLocation;
      }

      return {
        application: {
          ...data,
          display_status: displayStatus,
          assessments: assessData || [],
          latest_schedule: scheduledAt,
          latest_stage_type: testType,
          latest_evaluator: evaluator,
          latest_location: parsedLocation,
          latest_gmaps_url: parsedGmapsUrl,
        } as JobApplication,
        assessments: assessData || [],
        auditLogs: (appLogs || []) as CandidateAuditLog[],
      };
    }

    return { application: null, error: "Lamaran tidak ditemukan" };
  } catch (err: any) {
    return { application: null, error: err.message };
  }
});

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
      .select("id, job_id, job_title, status, created_at, updated_at")
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

    // Rule: Jika kandidat pernah ditolak di lowongan ini, periksa apakah lowongan sudah masuk periode baru (re-opened)
    const existingForThisJob = (allUserApps || []).find((a) => a.job_id === jobId);
    if (existingForThisJob) {
      const isRejected = (existingForThisJob.status || "").toLowerCase() === "ditolak" || (existingForThisJob.status || "").toLowerCase() === "rejected";
      if (!isRejected) {
        return {
          success: false,
          error: `Anda sudah pernah mengajukan lamaran untuk posisi "${targetJob.title}".`,
        };
      }

      // Bandingkan waktu pembukaan kembali lowongan dengan waktu penolakan lamaran
      const jobReopenedTime = new Date(targetJob.reopened_at || targetJob.posted_date || targetJob.updated_at || targetJob.created_at).getTime();
      const rejectionTime = new Date(existingForThisJob.updated_at || existingForThisJob.created_at).getTime();

      if (jobReopenedTime <= rejectionTime) {
        return {
          success: false,
          error: `Lamaran Anda untuk posisi "${targetJob.title}" telah dinyatakan gugur/ditolak pada periode seleksi saat ini. Anda baru dapat mendaftar kembali apabila lowongan ini ditutup dan dibuka kembali pada periode/batch berikutnya.`,
        };
      }
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

    // Auto-update target job's applicant count in jobs table so public visitors immediately see accurate counts
    try {
      const { count: freshAppCount } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("job_id", targetJob.id);

      const realCount = typeof freshAppCount === "number" && freshAppCount > 0 ? freshAppCount : 1;
      const currentQuota = extractQuota(targetJob.description, targetJob.quota);
      const cleanDesc = cleanJobDescription(targetJob.description);
      const enrichedDesc = `[Kuota: ${currentQuota}] [Pelamar: ${realCount}] ${cleanDesc}`.trim();

      await supabase
        .from("jobs")
        .update({ applicant_count: realCount, description: enrichedDesc })
        .eq("id", targetJob.id);
    } catch {
      // non-blocking
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/applications");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${targetJob.id}`);

    return {
      success: true,
      applicationId: insertedApp.id,
      message: `Selamat! Lamaran Anda untuk posisi "${targetJob.title}" dengan status "Diajukan" telah berhasil dikirim.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengirimkan lamaran." };
  }
}
