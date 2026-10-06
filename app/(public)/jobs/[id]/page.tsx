import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { typeColors } from "@/data/jobs";
import { getJobByIdFromSupabase } from "@/app/actions/jobs";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { job } = await getJobByIdFromSupabase(id);
  if (!job) return { title: "Lowongan Tidak Ditemukan" };
  return {
    title: job.title,
    description: `Lamar posisi ${job.title} di departemen ${job.dept}. ${job.location} · ${job.type}.`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const { job } = await getJobByIdFromSupabase(id);
  if (!job) return notFound();

  return (
    <div className="bg-grid-pattern min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-green-700 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-green-700 transition-colors">Lowongan</Link>
          <span>/</span>
          <span style={{ color: "#15803d" }} className="font-medium">{job.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <div className="career-card p-8 bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "rgba(21,128,61,0.08)" }}>
                  💼
                </div>
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight"
                    style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}
                  >
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`job-badge ${job.deptColor}`}>{job.dept}</span>
                    <span className={`job-badge ${typeColors[job.type] ?? "bg-gray-50 text-gray-600"}`}>{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {[
                  { icon: "📍", label: "Lokasi", value: job.location },
                  { icon: "💰", label: "Kisaran Gaji", value: job.salary },
                  { icon: "📅", label: "Diposting", value: job.posted },
                  { icon: "⏰", label: "Deadline", value: job.deadline },
                ].map((info) => (
                  <div key={info.label}>
                    <div className="text-xs text-gray-400 mb-0.5">{info.icon} {info.label}</div>
                    <div className="text-sm font-semibold text-gray-700">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="career-card p-8 bg-white">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1a1a2e" }}>Deskripsi Pekerjaan</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="career-card p-8 bg-white">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1a1a2e" }}>Tanggung Jawab</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="career-card p-8 bg-white">
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1a1a2e" }}>Persyaratan Kualifikasi</h2>
              <ul className="space-y-3 mb-6">
                {job.qualifications.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              {job.niceToHave && job.niceToHave.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Nice to Have</h3>
                  <ul className="space-y-2">
                    {job.niceToHave.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
                        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* ===== Sidebar ===== */}
          <div className="lg:col-span-1 space-y-6">
            <div className="career-card p-6 bg-white sticky top-24">
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1a1a2e" }}>Tertarik dengan posisi ini?</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Daftarkan akunmu dan lamar posisi ini sekarang. Proses mudah, cepat, dan transparan.
              </p>
              <Link href="/register" id={`apply-btn-${job.id}`} className="btn-primary w-full text-center mb-3">
                Lamar Sekarang
              </Link>
              <Link href="/login" className="btn-secondary w-full text-center text-sm">
                Sudah punya akun? Masuk
              </Link>
              <div className="mt-5 p-3 rounded-xl bg-green-50 text-xs text-green-700 text-center font-medium">
                ⏰ Deadline: <strong>{job.deadline}</strong>
              </div>
            </div>

            <div className="career-card p-5 bg-white">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Bagikan Lowongan</h4>
              <div className="flex gap-2">
                {["LinkedIn", "WhatsApp", "Copy Link"].map((s) => (
                  <button key={s} className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/jobs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke semua lowongan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
