import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getApplicationById } from "@/app/actions/candidate";
import TimelineView from "@/components/candidate/TimelineView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Lacak Progres Lamaran #${id} | TalentHub`,
    description: "Detail progres kronologis lamaran pekerjaan dan instruksi HR.",
  };
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/applications/${id}`);
  }

  const { application, error } = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2b29] hover:bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard My Applications</span>
        </Link>
      </div>

      {/* Timeline View Component */}
      <TimelineView application={application} />
    </div>
  );
}
