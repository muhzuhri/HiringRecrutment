import { getJobPostings } from "@/app/actions/admin";
import JobManager from "@/components/admin/JobManager";

export const metadata = {
  title: "Manajemen Lowongan | Nexora Digital Admin",
  description: "Kelola lowongan pekerjaan dan kriteria seleksi kandidat.",
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
