"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { departments, typeColors, Job } from "@/data/jobs";
import { getJobsFromSupabase } from "@/app/actions/jobs";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("Semua");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      const res = await getJobsFromSupabase(activeDept, search);
      setJobs(res.jobs);
      setLoading(false);
    }
    fetchJobs();
  }, [activeDept, search]);

  return (
    <div className="bg-grid-pattern min-h-screen">
      {/* ===== PAGE HERO ===== */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(12,43,41,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="section-tag mb-5 inline-flex"><span>💼</span><span>Karier Internal</span></div>
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e", letterSpacing: "-0.02em" }}
          >
            Temukan Posisi yang <span style={{ color: "#0c2b29" }}>Tepat Untukmu</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Terhubung langsung dengan database Supabase • Lowongan aktif perusahaan
          </p>
        </div>
      </section>

      {/* ===== SEARCH & FILTER ===== */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="job-search-input"
              type="text"
              placeholder="Cari posisi, departemen, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-12 pr-4 py-3.5 rounded-full shadow-sm text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {departments.map((dept) => (
              <button
                key={dept}
                id={`filter-${dept.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setActiveDept(dept)}
                className={`job-badge px-4 py-2 cursor-pointer border transition-all duration-200 ${
                  activeDept === dept
                    ? "bg-[#0c2b29] text-white border-[#0c2b29] shadow-md shadow-emerald-950/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-600 hover:text-emerald-800"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== JOB LISTING ===== */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-gray-500 flex items-center justify-between">
            <span>
              Menampilkan <span className="font-semibold text-gray-800">{jobs.length}</span> lowongan
              {activeDept !== "Semua" && (
                <> di <span className="text-emerald-800 font-semibold">{activeDept}</span></>
              )}
            </span>
            {loading && (
              <span className="text-xs text-emerald-700 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat dari Supabase...
              </span>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Lowongan Ditemukan</h3>
              <p className="text-gray-400">Coba ubah kata kunci atau filter departemen.</p>
              <button
                onClick={() => { setSearch(""); setActiveDept("Semua"); }}
                className="btn-secondary mt-6"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="career-card p-6 block group bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 bg-emerald-900/10 text-emerald-800 border border-emerald-800/10">
                      💼
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`job-badge ${typeColors[job.type] ?? "bg-gray-50 text-gray-600"}`}>{job.type}</span>
                      <span className="text-xs text-gray-400">{job.posted}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-emerald-800 transition-colors leading-snug" style={{ color: "#1a1a2e" }}>
                    {job.title}
                  </h3>
                  <span className={`job-badge ${job.deptColor} mb-3 inline-flex`}>{job.dept}</span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                    <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-emerald-800 text-sm font-semibold">
                    Lihat Detail & Lamar
                    <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
