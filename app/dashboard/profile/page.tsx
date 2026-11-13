import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCandidateProfile } from "@/app/actions/candidate";
import ProfileForm from "@/components/candidate/ProfileForm";

export const metadata = {
  title: "Profil Saya | Nexora Digital",
  description: "Lengkapi data profil diri, riwayat pendidikan, sertifikasi, keahlian, pengalaman kerja, dan berkas CV PDF.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/profile");
  }

  const { profile } = await getCandidateProfile();

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-300">
        Profil kandidat tidak ditemukan. Silakan login kembali.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
