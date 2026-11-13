import { getCandidateProfile } from "@/app/actions/candidate";
import AdminProfileForm from "@/components/admin/AdminProfileForm";

export const metadata = {
  title: "Profil Saya | Nexora Digital Admin",
  description: "Pengaturan profil staf internal Nexora Digital.",
};

export default async function AdminProfilePage() {
  const { profile } = await getCandidateProfile();

  return <AdminProfileForm profile={profile} />;
}

