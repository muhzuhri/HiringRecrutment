import Link from "next/link";
import type { Metadata } from "next";
import FloatingCubes from "@/components/FloatingCubes";
import { stats, whyJoinBenefits, whyJoinList, alumniCompanies } from "@/data/home";
import { allJobs } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Temukan karier impianmu bersama TalentHub. Bergabung dengan ratusan profesional yang telah membangun karier cemerlang bersama kami.",
};

const featuredJobs = allJobs.slice(0, 6);

export default function HomePage() {
  return (
    <div className="bg-grid-pattern">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        {/* 3D Animated Floating Cubes */}
        <FloatingCubes count={22} />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(12,43,41,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative z-10">
          {/* Overline tag */}
          <div className="inline-flex items-center gap-2 section-tag mb-6 animate-fade-in-up">
            <span>🎯</span>
            <span>Buka Lowongan Sekarang</span>
          </div>

          {/* Main heading */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up delay-100"
            style={{
              fontFamily: "var(--font-plus-jakarta)",
              color: "#1a1a2e",
              letterSpacing: "-0.02em",
            }}
          >
            Temukan Karier Impian dan{" "}
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #0c2b29 0%, #047857 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Masa Depanmu Bersama Kami
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Bergabunglah dengan tim kami yang inovatif dan dinamis. Kami mencari
            individu berbakat yang siap membuat dampak nyata dan tumbuh bersama
            perusahaan kelas dunia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link href="/jobs" className="btn-primary text-base px-8 py-3.5">
              Lihat Semua Lowongan
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/about" className="btn-secondary text-base px-8 py-3.5">
              Pelajari Budaya Kami
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-fade-in-up delay-400">
            {alumniCompanies.map((brand) => (
              <div key={brand} className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {brand}
              </div>
            ))}
            <div className="text-xs text-gray-400 italic">alumni dari perusahaan terkemuka</div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 relative bg-[#0c2b29] text-white border-y border-emerald-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div
                  className="text-4xl font-extrabold text-white mb-1"
                  style={{ fontFamily: "var(--font-plus-jakarta)" }}
                >
                  {stat.value}
                </div>
                <div className="text-emerald-300 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS SECTION ===== */}
      <section className="py-20 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-tag mb-4 inline-flex">
              <span>💼</span>
              <span>Peluang Terkini</span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}
            >
              Lowongan Unggulan
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Posisi-posisi strategis yang sedang kami buka untuk kandidat terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="career-card p-6 block group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-emerald-900/10 text-emerald-800 border border-emerald-800/10"
                  >
                    💼
                  </div>
                  <span
                    className={`job-badge ${
                      job.type === "Full-time"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : job.type === "Contract"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-sky-50 text-sky-800 border border-sky-200"
                    }`}
                  >
                    {job.type}
                  </span>
                </div>
                <h3
                  className="font-bold text-lg mb-2 group-hover:text-emerald-800 transition-colors"
                  style={{ color: "#1a1a2e" }}
                >
                  {job.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`job-badge ${job.deptColor}`}>{job.dept}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-emerald-800 text-sm font-semibold">
                  Lihat Detail
                  <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/jobs" className="btn-primary px-10">
              Lihat Semua {allJobs.length} Lowongan
            </Link>
          </div>
        </div>
      </section>

      {/* ===== WHY JOIN US ===== */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-tag mb-4 inline-flex">
                <span>🌱</span>
                <span>Kenapa Bergabung</span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}
              >
                Tempat Tumbuh dan Berkembang Bersama
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Kami bukan sekadar perusahaan — kami adalah komunitas profesional yang saling mendukung,
                berinovasi, dan tumbuh bersama. Di sini, setiap kontribusimu dihargai.
              </p>
              <ul className="space-y-4">
                {whyJoinList.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn-primary mt-8 inline-flex">
                Pelajari Budaya Kami
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {whyJoinBenefits.map((item) => (
                <div key={item.title} className="career-card p-5">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section
        className="py-20 relative overflow-hidden bg-[#0c2b29] text-white"
        style={{ background: "linear-gradient(135deg, #061f1d 0%, #0c2b29 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Siap Memulai Perjalanan Kariermu?
          </h2>
          <p className="text-emerald-200 text-lg mb-8">
            Buat akun kandidat sekarang dan lamar posisi impianmu dalam hitungan menit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-emerald-950/50"
            >
              Daftar Gratis Sekarang
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-emerald-700/60 text-slate-100 rounded-xl font-semibold text-base hover:bg-emerald-900/40 transition-all"
            >
              Jelajahi Lowongan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
