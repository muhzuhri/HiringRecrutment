import { getJobPostings } from "@/app/actions/admin";
import JobManager from "@/components/admin/JobManager";

export const metadata = {
  title: "Manajemen Lowongan Pekerjaan | TalentHub Admin",
  description: "Buat lowongan baru, atur kriteria minimum saringan otomatis (pendidikan S1/skill), dan tutup lowongan.",
};

export default async function AdminJobsPage() {
  const { jobs } = await getJobPostings();

  return (
    <div className="space-y-8">
      {/* Job Manager Component */}
      <JobManager initialJobs={jobs} />
    </div>
  );
}
