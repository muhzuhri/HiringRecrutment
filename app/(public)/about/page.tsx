import Link from "next/link";
import type { Metadata } from "next";
import FloatingCubes from "@/components/FloatingCubes";
import { coreValues, benefits, galleryHighlights, visiMisi } from "@/data/about";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Kenali TalentHub lebih dalam — visi, misi, nilai-nilai perusahaan, serta budaya kerja yang mendorong inovasi dan kolaborasi.",
};

export default function AboutPage() {
  return (
    <div className="bg-grid-pattern">
      {/* ===== PAGE HERO ===== */}
      <section className="relative py-24 overflow-hidden">
        <FloatingCubes count={14} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(12,43,41,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="section-tag mb-5 inline-flex">
            <span>🏢</span>
            <span>Tentang Kami</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-5"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e", letterSpacing: "-0.02em" }}
          >
            Kami Percaya pada Kekuatan{" "}
            <span style={{ color: "#0c2b29" }}>Manusia dan Teknologi</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            TalentHub didirikan dengan satu misi: mempertemukan talenta terbaik
            dengan peluang yang paling bermakna. Sejak 2019, kami telah membantu
            lebih dari 1.200 profesional menemukan panggilan karier mereka.
          </p>
        </div>
      </section>

      {/* ===== VISI & MISI ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="career-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10" style={{ background: "#0c2b29" }} />
              <div className="text-3xl mb-4">🔭</div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#0c2b29" }}>
                Visi Kami
              </h2>
              <p className="text-gray-600 leading-relaxed">{visiMisi.visi}</p>
            </div>

            <div className="career-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10" style={{ background: "#0c2b29" }} />
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#0c2b29" }}>
                Misi Kami
              </h2>
              <ul className="space-y-3 text-gray-600">
                {visiMisi.misi.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section id="values" className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-tag mb-4 inline-flex"><span>💎</span><span>Nilai-Nilai Kami</span></div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}>
              Core Values yang Memandu Kami
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val) => (
              <div key={val.title} className="career-card p-6 bg-white">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-emerald-900/10 text-emerald-900 border border-emerald-800/10">
                  {val.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#1a1a2e" }}>{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section id="benefits" className="py-20 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-tag mb-4 inline-flex"><span>🎁</span><span>Benefit & Fasilitas</span></div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}>
              Kami Jaga Kamu, Kamu Jaga Misi
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Benefit komprehensif dirancang untuk mendukung kesejahteraan dan pertumbuhan setiap karyawan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.category} className="career-card p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{b.icon}</span>
                  <h3 className="font-bold text-base text-emerald-900">{b.category}</h3>
                </div>
                <ul className="space-y-2">
                  {b.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIFE AT ===== */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="section-tag mb-4 inline-flex"><span>📸</span><span>Life at TalentHub</span></div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e" }}>
              Lingkungan yang Menginspirasi
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {galleryHighlights.map((item) => (
              <div key={item.label} className="career-card p-8 bg-white flex flex-col items-center justify-center text-center gap-3 min-h-35">
                <span className="text-4xl">{item.emoji}</span>
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/jobs" className="btn-primary px-10">Bergabung Dengan Tim Kami</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
