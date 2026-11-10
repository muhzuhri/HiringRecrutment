"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type AuthActionResult = {
  success: boolean;
  message: string;
  requiresEmailVerification?: boolean;
  redirectTo?: string;
};

/**
 * Register Action - Pendaftaran Akun Kandidat Baru
 */
export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;
  const firstName = (formData.get("firstname") as string)?.trim();
  const lastName = (formData.get("lastname") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const terms = formData.get("terms");

  // 1. Validasi Input Dasar
  if (!email || !password || !passwordConfirmation) {
    return {
      success: false,
      message: "Mohon isi semua kolom yang wajib diisi.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Kata sandi minimal harus 8 karakter.",
    };
  }

  if (password !== passwordConfirmation) {
    return {
      success: false,
      message: "Konfirmasi kata sandi tidak cocok dengan kata sandi Anda.",
    };
  }

  if (!terms) {
    return {
      success: false,
      message: "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
    };
  }

  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    // 2. Panggil Supabase auth.signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: phone ? `+62${phone}` : null,
          role: "candidate",
        },
      },
    });

    if (error) {
      // Penanganan error ramah pengguna dalam Bahasa Indonesia
      let errorMsg = error.message;

      if (error.message.includes("already registered") || error.code === "user_already_exists") {
        errorMsg = "Email ini sudah terdaftar. Silakan masuk menggunakan email Anda.";
      } else if (error.message.includes("Password should be")) {
        errorMsg = "Kata sandi tidak memenuhi kriteria keamanan.";
      } else if (error.message.includes("invalid email") || error.code === "validation_failed") {
        errorMsg = "Format alamat email tidak valid.";
      } else if (error.message.includes("rate limit")) {
        errorMsg = "Terlalu banyak percobaan. Silakan coba beberapa saat lagi.";
      }

      return {
        success: false,
        message: errorMsg,
      };
    }

    // 3. Cek apakah konfirmasi email diaktifkan di Supabase
    // Jika session null tetapi user terbuat, artinya pengguna perlu memverifikasi email terlebih dahulu.
    if (data.user && !data.session) {
      return {
        success: true,
        message: "Pendaftaran berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan periksa kotak masuk/spam Anda.",
        requiresEmailVerification: true,
      };
    }

    // Jika Supabase auto-confirm session diaktifkan
    return {
      success: true,
      message: "Pendaftaran berhasil! Akun Anda siap digunakan.",
      redirectTo: "/dashboard",
    };
  } catch (err: unknown) {
    console.error("SignUp Error:", err);
    return {
      success: false,
      message: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
    };
  }
}

/**
 * Login Action - Masuk Akun Kandidat / User
 */
export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawInput = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!rawInput || !password) {
    return {
      success: false,
      message: "Alamat email/username dan kata sandi wajib diisi.",
    };
  }

  const lowerInput = rawInput.toLowerCase();
  const emailCandidates: string[] = [];
  if (lowerInput.includes("@")) {
    emailCandidates.push(lowerInput);
  } else {
    if (lowerInput === "muhzhrii" || lowerInput === "muhzuhri") {
      emailCandidates.push("zuhrimubarak@gmail.com", "muhzhrii@gmail.com", `${lowerInput}@gmail.com`);
    } else {
      emailCandidates.push(`${lowerInput}@gmail.com`, `${lowerInput}@talenthub.com`);
    }
  }

  try {
    const supabase = await createClient();

    let signInData = null;
    let authError = null;

    // Coba login dengan kandidat email
    for (const candidateEmail of emailCandidates) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: candidateEmail,
        password,
      });

      if (data?.user) {
        signInData = data;
        authError = null;
        break;
      } else {
        authError = error;
      }
    }

    if (authError || !signInData?.user) {
      let errorMsg = authError?.message || "Email atau kata sandi yang Anda masukkan salah.";

      if (
        errorMsg.includes("Invalid login credentials") ||
        authError?.code === "invalid_credentials"
      ) {
        errorMsg = "Email/Username atau kata sandi yang Anda masukkan salah.";
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMsg = "Email Anda belum dikonfirmasi. Silakan periksa inbox email Anda.";
      } else if (errorMsg.includes("rate limit")) {
        errorMsg = "Terlalu banyak percobaan login yang gagal. Silakan tunggu beberapa menit.";
      }

      return {
        success: false,
        message: errorMsg,
      };
    }

    // Ambil data role profil dari database Supabase
    let targetPath = "/dashboard";
    if (signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .single();

      const userRole = profile?.role || signInData.user.user_metadata?.role || "candidate";
      if (userRole === "admin" || userRole === "recruiter") {
        targetPath = "/admin";
      } else if (userRole === "interviewer") {
        targetPath = "/admin/evaluations";
      }
    }

    return {
      success: true,
      message: "Login berhasil! Mengalihkan ke dashboard...",
      redirectTo: targetPath,
    };
  } catch (err: unknown) {
    console.error("SignIn Error:", err);
    return {
      success: false,
      message: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * Admin & Penilai Login Action - Khusus untuk Staff (Admin, Recruiter, Interviewer/Penilai)
 * Rute: /admin/login
 */
export async function adminSignInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawInput = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!rawInput || !password) {
    return {
      success: false,
      message: "Alamat email/username dan kata sandi wajib diisi.",
    };
  }

  const lowerInput = rawInput.toLowerCase();
  const emailCandidates: string[] = [];
  if (lowerInput.includes("@")) {
    emailCandidates.push(lowerInput);
  } else {
    if (lowerInput === "muhzhrii" || lowerInput === "muhzuhri") {
      emailCandidates.push("zuhrimubarak@gmail.com", "muhzhrii@gmail.com", `${lowerInput}@gmail.com`);
    } else if (lowerInput === "penilai") {
      emailCandidates.push("penilai@talenthub.com");
    } else if (lowerInput === "admin") {
      emailCandidates.push("admin@talenthub.com");
    } else {
      emailCandidates.push(`${lowerInput}@gmail.com`, `${lowerInput}@talenthub.com`);
    }
  }

  try {
    const supabase = await createClient();

    let signInData = null;
    let authError = null;

    // 1. Coba login dengan kandidat email via Supabase Auth
    for (const candidateEmail of emailCandidates) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: candidateEmail,
        password,
      });

      if (data?.user) {
        signInData = data;
        authError = null;
        break;
      } else {
        authError = error;
      }
    }

    // 2. Auto-provisioning untuk akun default staf (penilai@talenthub.com / admin@talenthub.com)
    // jika akun belum terdaftar
    if (
      authError &&
      (emailCandidates.includes("penilai@talenthub.com") || emailCandidates.includes("admin@talenthub.com"))
    ) {
      const targetEmail = emailCandidates.includes("penilai@talenthub.com")
        ? "penilai@talenthub.com"
        : "admin@talenthub.com";
      const isPenilai = targetEmail === "penilai@talenthub.com";
      const defaultRole = isPenilai ? "interviewer" : "admin";
      const defaultName = isPenilai ? "Tim Penilai & Assessor" : "Administrator HR";

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          data: {
            full_name: defaultName,
            role: defaultRole,
          },
        },
      });

      if (!signUpError && signUpData.user) {
        try {
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            email: targetEmail,
            full_name: defaultName,
            role: defaultRole,
            profile_completed: true,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // Fallback jika constraint belum diupdate
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            email: targetEmail,
            full_name: defaultName,
            role: "recruiter",
            profile_completed: true,
            updated_at: new Date().toISOString(),
          });
        }

        // Re-attempt sign in
        const retry = await supabase.auth.signInWithPassword({ email: targetEmail, password });
        if (retry.data?.user) {
          signInData = retry.data;
          authError = null;
        }
      }
    }

    if (authError || !signInData?.user) {
      let msg = authError?.message || "Email/Username atau kata sandi portal staf salah.";
      if (
        msg.includes("Invalid login credentials") ||
        authError?.code === "invalid_credentials"
      ) {
        msg = "Email atau kata sandi salah. Jika menggunakan akun penilai@talenthub.com, pastikan skrip pembuatan akun di tab Supabase SQL Editor sudah dijalankan (klik RUN).";
      } else if (msg.includes("Email not confirmed")) {
        msg = "Email akun ini belum dikonfirmasi di Supabase Auth.";
      }
      return {
        success: false,
        message: msg,
      };
    }

    // 3. Verifikasi hak akses role: tolak jika kandidat murni
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", signInData.user.id)
      .single();

    const userRole = profile?.role || signInData.user.user_metadata?.role || "candidate";

    if (userRole === "candidate") {
      await supabase.auth.signOut();
      return {
        success: false,
        message: "Akses ditolak: Akun Anda terdaftar sebagai Kandidat. Silakan masuk melalui Portal Pelamar di /login.",
      };
    }

    const targetPath = userRole === "interviewer" ? "/admin/evaluations" : "/admin";

    return {
      success: true,
      message: `Login berhasil sebagai ${userRole === "interviewer" ? "Penilai Seleksi" : "HR Admin"}! Mengalihkan...`,
      redirectTo: targetPath,
    };
  } catch (err: unknown) {
    console.error("AdminSignIn Error:", err);
    return {
      success: false,
      message: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * SignOut Action - Keluar dari Akun (Kandidat)
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Admin SignOut Action - Keluar dari Portal Admin/Penilai
 */
export async function adminSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
