import { notFound } from "next/navigation";
import { getCandidateDetailForScreening } from "@/app/actions/admin";
import CandidateScreeningView from "@/components/admin/CandidateScreeningView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Screening Kandidat #${id} | TalentHub Admin`,
    description: "Pratinjau CV PDF, data terstruktur pelamar, catatan rahasia HR, dan log audit.",
  };
}

export default async function CandidateScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { detail, error } = await getCandidateDetailForScreening(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/kanban"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2b29] hover:bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Papan Kanban Rekrutmen</span>
        </Link>
      </div>

      {/* Candidate Screening Component */}
      <CandidateScreeningView detail={detail} />
    </div>
  );
}
