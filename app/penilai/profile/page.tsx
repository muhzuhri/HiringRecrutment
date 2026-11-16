import React from "react";
import { getCandidateProfile } from "@/app/actions/candidate";
import AdminProfileForm from "@/components/admin/AdminProfileForm";

export const metadata = {
  title: "Profil Saya | Portal Penilai Nexora Digital",
  description: "Pengaturan profil penilai seleksi internal Nexora Digital.",
};

export default async function PenilaiProfilePage() {
  const { profile } = await getCandidateProfile();

  return <AdminProfileForm profile={profile} />;
}
