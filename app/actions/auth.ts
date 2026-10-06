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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      message: "Alamat email dan kata sandi wajib diisi.",
    };
  }

  try {
    const supabase = await createClient();

    // Panggil Supabase auth.signInWithPassword
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMsg = error.message;

      if (
        error.message.includes("Invalid login credentials") ||
        error.code === "invalid_credentials"
      ) {
        errorMsg = "Email atau kata sandi yang Anda masukkan salah.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMsg = "Email Anda belum dikonfirmasi. Silakan periksa inbox email Anda.";
      } else if (error.message.includes("rate limit")) {
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
 * SignOut Action - Keluar dari Akun
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
