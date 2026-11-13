"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { JobApplication } from "@/types/candidate";
import StatusBadge from "./StatusBadge";
import {
  ClipboardList,
  Search,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock3,
  Award,
  ExternalLink,
  ChevronRight,
  CalendarCheck2,
  UserCheck,
} from "lucide-react";

interface CandidateApplicationsTableProps {
  applications: JobApplication[];
}

export default function CandidateApplicationsTable({
  applications,
}: CandidateApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Summary Metrics
  const totalCount = applications.length;
  const screeningCount = applications.filter(
    (a) => (a.display_status || a.status).toLowerCase().includes("screening") || (a.display_status || a.status).toLowerCase() === "diproses"
  ).length;
  const assessmentCount = applications.filter((a) => {
    const s = (a.display_status || a.status).toLowerCase();
    return s.includes("assessment") || s.includes("tes") || s.includes("interview");
  }).length;
  const acceptedCount = applications.filter((a) =>
    ["Diterima", "Offered", "Hired"].includes(a.status)
  ).length;

  // Filter Logic matching Progress Tracking stages
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.job_title?.toLowerCase().includes(q) ||
        app.department?.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const currentStage = (app.display_status || app.status).toLowerCase();

      if (statusFilter === "ALL") return true;
      if (statusFilter === "DIAJUKAN") {
        return currentStage.includes("diajukan") || currentStage.includes("applied");
      }
      if (statusFilter === "SCREENING") {
        return currentStage.includes("screening") || currentStage === "diproses";
      }
      if (statusFilter === "ASSESSMENT") {
        return currentStage.includes("assessment") || currentStage.includes("tes");
      }
      if (statusFilter === "INTERVIEW") {
        return currentStage.includes("interview");
      }
      if (statusFilter === "DITERIMA") {
        return ["diterima", "offered", "hired"].includes(currentStage);
      }
      if (statusFilter === "DITOLAK") {
        return currentStage.includes("ditolak") || currentStage.includes("rejected");
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  const formatIDFullDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white/90 dark:bg-[#0c2b29]/90 backdrop-blur-md border border-slate-200/80 dark:border-teal-800/40 rounded-3xl p-5 sm:p-6 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Lamaran <span className="text-[#0F766E] dark:text-[#14B8A6]">Saya</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Pantau status seleksi berkas dan jadwal interview secara real-time.
          </p>
        </div>

        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-semibold text-xs transition-all shadow-2xs shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Cari Lowongan</span>
        </Link>
      </div>

      {/* 2. Quick Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/40 rounded-2xl p-4 sm:p-5 shadow-2xs border-l-4 border-l-[#0F766E] transition-all">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Lamaran
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 mt-1">
            Posisi yang telah diajukan
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-l-amber-500 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Screening HR
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {screeningCount}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Pemeriksaan kualifikasi & CV
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-l-purple-500 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Assessment & Interview
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {assessmentCount}
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
            Tes teknis & sesi wawancara
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-l-emerald-600 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Diterima (Hired)
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {acceptedCount}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Penawaran kerja resmi
          </p>
        </div>
      </div>

      {/* 3. Search Bar & Status Filter Chips */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan posisi lowongan, departemen, atau kota..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#061f1d] border border-slate-300 dark:border-emerald-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <span className="font-bold text-slate-900 dark:text-white">{filteredApps.length}</span> dari {totalCount} lamaran
          </div>
        </div>

        {/* Filter Pills aligned with 6-stage linear pipeline */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-emerald-800/30">
          <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tahapan Seleksi:
          </span>
          {[
            { id: "ALL", label: "Semua" },
            { id: "DIAJUKAN", label: "1. Diajukan" },
            { id: "SCREENING", label: "2. Screening HR" },
            { id: "ASSESSMENT", label: "3. Assessment / Tes" },
            { id: "INTERVIEW", label: "4-5. Interview (HR / User)" },
            { id: "DITERIMA", label: "6. Diterima (Hired)" },
            { id: "DITOLAK", label: "Ditolak" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#061f1d] dark:text-slate-300 dark:hover:bg-emerald-950"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. The Applications Table */}
      <div className="bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800/40 rounded-2xl shadow-sm transition-colors overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#061f1d] border border-slate-200 dark:border-emerald-800/60 flex items-center justify-center text-slate-400 dark:text-emerald-500 mx-auto">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tidak Ada Lamaran Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL"
                  ? "Tidak ada lamaran yang sesuai dengan kata kunci atau filter status terpilih."
                  : "Anda belum pernah mengajukan lamaran pekerjaan. Temukan karier impian Anda sekarang!"}
              </p>
            </div>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              <span>Cari & Lamar Lowongan</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#061f1d]/80 border-b border-slate-200 dark:border-emerald-800/40 text-[11px] font-bold text-slate-600 dark:text-emerald-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 sm:px-6">Posisi & Departemen</th>
                  <th className="py-3.5 px-4">Tanggal Melamar</th>
                  <th className="py-3.5 px-4">Tahapan / Status</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Jadwal & Seleksi</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-800/30 text-slate-700 dark:text-slate-200">
                {filteredApps.map((app, index) => {
                  const schedule = app.latest_schedule || app.interview_date;
                  const stageType = app.latest_stage_type || (app.display_status?.includes("Interview") ? "Interview HR" : app.display_status || "Tes");
                  const evaluator = app.latest_evaluator;
                  const statusToDisplay = app.display_status || app.status;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#061f1d]/50 transition-colors"
                    >
                      {/* No / Order */}
                      <td className="py-4 px-4 sm:px-6 text-center font-bold text-slate-400 dark:text-emerald-400">
                        {index + 1}
                      </td>

                      {/* Position & Department */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{app.job_title}</span>
                          </Link>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950 text-slate-600 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 text-[10px] font-semibold">
                              {app.department}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #APP-{app.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          {formatIDFullDate(app.created_at)}
                        </span>
                      </td>

                      {/* Status / Stage (Synchronized with Progress Tracking) */}
                      <td className="py-4 px-4">
                        <StatusBadge status={statusToDisplay} size="sm" />
                      </td>

                      {/* Schedule / Next Step with Full Date, Month, Year, and Time */}
                      <td className="py-4 px-4">
                        {schedule ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                              <CalendarCheck2 className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>{stageType}</span>
                            </span>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400 dark:text-emerald-400 shrink-0" />
                              <span>{formatIDFullDate(schedule)}</span>
                            </p>
                            {evaluator && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[210px]">
                                <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{evaluator}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum dijadwalkan
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0d6962] text-white font-bold text-[11px] transition-all shadow-2xs"
                            title="Lacak kronologi & detail timeline"
                          >
                            <span>Lacak Progress</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
