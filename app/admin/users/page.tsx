import { getStaffAccounts } from "@/app/actions/admin";
import StaffUserManager from "@/components/admin/StaffUserManager";
import { getCandidateProfile } from "@/app/actions/candidate";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kelola Akun Staf | Nexora Digital",
  description: "Kelola akun pengguna internal HR dan Penilai Seleksi.",
};

export default async function AdminUsersPage() {
  const { profile } = await getCandidateProfile();

  // Hanya role admin atau hr yang boleh mengelola akun staf
  if (profile?.role === "penilai" || profile?.role === "interviewer") {
    redirect("/admin/evaluations");
  }

  const { allStaff } = await getStaffAccounts();

  return <StaffUserManager initialStaff={allStaff} />;
}

