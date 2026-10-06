import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCandidateProfile } from "@/app/actions/candidate";
import ProfileForm from "@/components/candidate/ProfileForm";
import ResumeUploader from "@/components/candidate/ResumeUploader";
import { UserCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Profil & Form Pendaftaran Terstruktur | TalentHub",
  description: "Lengkapi data profil diri, riwayat pendidikan, skill, pengalaman kerja, dan CV PDF.",
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Candidate Settings & Structured Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pengaturan Profil & Berkas CV
          </h1>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
            Data profil terstruktur dan berkas CV PDF ini tersimpan secara aman di Supabase dan akan digunakan secara otomatis saat Anda menggunakan fitur <strong>Lamar Cepat</strong>.
          </p>
        </div>
      </div>

      {/* Resume PDF Uploader Manager */}
      <ResumeUploader
        currentResumeUrl={profile?.resume_url}
        currentResumeName={profile?.resume_name}
      />

      {/* Structured Profile Form */}
      {profile && <ProfileForm initialProfile={profile} />}
    </div>
  );
}
