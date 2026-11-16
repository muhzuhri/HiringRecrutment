"use client";

import React, { useState, useMemo } from "react";
import { HRAnalyticsSummary } from "@/types/admin";
import {
  Briefcase,
  Users,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
  Filter,
  ChevronDown,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Layers,
} from "lucide-react";

interface HRAnalyticsChartProps {
  analytics: HRAnalyticsSummary;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DONUT_COLORS = [
  "#14B8A6", // Teal
  "#00F2FE", // Cyan
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#F43F5E", // Rose
];

export default function HRAnalyticsChart({ analytics }: HRAnalyticsChartProps) {
  // 1. Filter States
  const [filterType, setFilterType] = useState<"all" | "year" | "month">("all");
  const [chartView, setChartView] = useState<"line" | "donut" | "trend">("line");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 2. Extract Available Years from data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);

    (analytics.raw_applications || []).forEach((app) => {
      if (app.created_at) {
        const y = new Date(app.created_at).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [analytics.raw_applications, currentYear]);

  // 3. Filtered Applications based on Period
  const filteredApplications = useMemo(() => {
    const apps = analytics.raw_applications || [];

    if (filterType === "all") return apps;

    return apps.filter((app) => {
      if (!app.created_at) return false;
      const date = new Date(app.created_at);
      const appYear = date.getFullYear();
      const appMonth = date.getMonth();

      if (filterType === "year") {
        return appYear === selectedYear;
      }
      if (filterType === "month") {
        return appYear === selectedYear && appMonth === selectedMonth;
      }
      return true;
    });
  }, [analytics.raw_applications, filterType, selectedYear, selectedMonth]);

  // 4. Compute Dynamic Aggregations per Job for Line Chart
  const jobStats = useMemo(() => {
    const allJobs = analytics.all_jobs || [];
    const statsMap: Record<
      string,
      {
        job_id: string;
        title: string;
        dept: string;
        count: number;
        interviewCount: number;
        hiredCount: number;
      }
    > = {};

    allJobs.forEach((job) => {
      statsMap[job.id] = {
        job_id: job.id,
        title: job.title,
        dept: job.dept,
        count: 0,
        interviewCount: 0,
        hiredCount: 0,
      };
    });

    if (allJobs.length === 0 && analytics.applicants_per_job) {
      analytics.applicants_per_job.forEach((j) => {
        statsMap[j.job_id] = {
          job_id: j.job_id,
          title: j.job_title,
          dept: j.department,
          count: 0,
          interviewCount: 0,
          hiredCount: 0,
        };
      });
    }

    filteredApplications.forEach((app) => {
      if (!statsMap[app.job_id]) {
        statsMap[app.job_id] = {
          job_id: app.job_id,
          title: app.job_title || "Lowongan Pekerjaan",
          dept: app.department || "Divisi",
          count: 0,
          interviewCount: 0,
          hiredCount: 0,
        };
      }
      statsMap[app.job_id].count += 1;
      if (app.status === "Interview") {
        statsMap[app.job_id].interviewCount += 1;
      }
      if (app.status === "Diterima" || app.status === "Hired") {
        statsMap[app.job_id].hiredCount += 1;
      }
    });

    return Object.values(statsMap);
  }, [analytics.all_jobs, analytics.applicants_per_job, filteredApplications]);

  // 5. Dynamic Summary Metrics
  const totalPeriodApplicants = filteredApplications.length;
  const interviewingInPeriod = useMemo(
    () => filteredApplications.filter((a) => a.status === "Interview" || a.status === "Diproses").length,
    [filteredApplications]
  );
  const hiredInPeriod = useMemo(
    () => filteredApplications.filter((a) => a.status === "Diterima" || a.status === "Hired").length,
    [filteredApplications]
  );

  // Maximum scale for Line Chart Y-Axis
  const maxLineVal = useMemo(() => {
    const max = Math.max(...jobStats.map((j) => j.count), 1);
    if (max <= 5) return 5;
    if (max <= 10) return 10;
    if (max <= 20) return 20;
    return Math.ceil(max / 5) * 5;
  }, [jobStats]);

  // 6. Monthly Trend for Trend View
  const monthlyTrendData = useMemo(() => {
    const months = Array(12).fill(0);
    const targetYear = selectedYear;

    (analytics.raw_applications || []).forEach((app) => {
      if (!app.created_at) return;
      const d = new Date(app.created_at);
      if (d.getFullYear() === targetYear) {
        months[d.getMonth()] += 1;
      }
    });

    return months.map((count, index) => ({
      month: MONTH_NAMES[index].slice(0, 3),
      fullMonth: MONTH_NAMES[index],
      count,
    }));
  }, [analytics.raw_applications, selectedYear]);

  const maxTrendCount = useMemo(() => {
    const max = Math.max(...monthlyTrendData.map((m) => m.count), 1);
    return max <= 5 ? 5 : Math.ceil(max / 5) * 5;
  }, [monthlyTrendData]);

  // 7. Donut Chart Slices
  const donutSlices = useMemo(() => {
    const total = jobStats.reduce((sum, j) => sum + j.count, 0);
    if (total === 0) return [];

    let accumulatedAngle = 0;
    return jobStats.map((job, idx) => {
      const percentage = (job.count / total) * 100;
      const angle = (job.count / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];

      return {
        ...job,
        percentage: Math.round(percentage),
        startAngle,
        endAngle: accumulatedAngle,
        color,
      };
    });
  }, [jobStats]);

  // Active hover info for HUD display
  const activeJob = hoveredIndex !== null && jobStats[hoveredIndex] ? jobStats[hoveredIndex] : jobStats[0];

  // 7. Grid Ticks for Y-Axis (Calculated linearly for pixel-perfect alignment)
  const gridTicks = useMemo(() => {
    const step = maxLineVal <= 5 ? 1 : maxLineVal <= 10 ? 2 : Math.ceil(maxLineVal / 5);
    const ticks: number[] = [];
    for (let val = maxLineVal; val >= 0; val -= step) {
      ticks.push(val);
    }
    if (!ticks.includes(0)) ticks.push(0);
    return ticks;
  }, [maxLineVal]);

  // 8. Line Chart Coordinates Calculation (SVG ViewBox: 1000 x 300)
  const paddingX = 85;
  const paddingRight = 40;
  const paddingYTop = 30;
  const paddingYBottom = 45;
  const chartWidth = 1000 - paddingX - paddingRight;
  const chartHeight = 300 - paddingYTop - paddingYBottom;
  const baselineY = paddingYTop + chartHeight; // 255

  const linePoints = useMemo(() => {
    const n = jobStats.length;
    if (n === 0) return [];

    return jobStats.map((job, idx) => {
      const x = n === 1 ? paddingX + chartWidth / 2 : paddingX + (idx / (n - 1)) * chartWidth;
      const ratio = job.count / (maxLineVal > 0 ? maxLineVal : 1);
      const y = paddingYTop + chartHeight * (1 - ratio);

      return {
        ...job,
        x,
        y,
        ratio,
      };
    });
  }, [jobStats, maxLineVal, chartWidth, chartHeight, paddingX, paddingYTop]);

  // Smooth SVG Path generator (Bezier curve for line chart)
  const { pathD, areaD } = useMemo(() => {
    if (linePoints.length === 0) return { pathD: "", areaD: "" };
    if (linePoints.length === 1) {
      const p = linePoints[0];
      return {
        pathD: `M ${paddingX},${p.y} L ${1000 - paddingRight},${p.y}`,
        areaD: `M ${paddingX},${p.y} L ${1000 - paddingRight},${p.y} L ${1000 - paddingRight},${baselineY} L ${paddingX},${baselineY} Z`,
      };
    }

    let d = `M ${linePoints[0].x},${linePoints[0].y}`;
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p0 = linePoints[i];
      const p1 = linePoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }

    const first = linePoints[0];
    const last = linePoints[linePoints.length - 1];
    const aD = `${d} L ${last.x},${baselineY} L ${first.x},${baselineY} Z`;

    return { pathD: d, areaD: aD };
  }, [linePoints, paddingX, paddingRight, baselineY]);

  return (
    <div className="space-y-6">
      {/* 1. Quick Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Lowongan Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#0F766E] dark:text-teal-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {analytics.active_jobs_count}
          </p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium mt-1 inline-block">
            Posisi dibuka
          </span>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {filterType === "all" ? "Total Pelamar" : "Pelamar Periode Ini"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalPeriodApplicants}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
            {filterType === "all" ? "Kandidat terdaftar" : "Sesuai filter waktu"}
          </span>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sedang Evaluasi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {filterType === "all" ? analytics.interviewing_count : interviewingInPeriod}
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1 inline-block">
            Tes & wawancara
          </span>
        </div>

        <div className="bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#0F766E]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Diterima (Hired)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-slate-900/80 flex items-center justify-center text-emerald-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {filterType === "all" ? analytics.hired_count : hiredInPeriod}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-teal-400 font-medium mt-1 inline-block">
            Lolos seleksi
          </span>
        </div>
      </section>

      {/* 2. FULL WIDTH MODERN LINE CHART */}
      <section className="w-full">
        <div className="w-full bg-white dark:bg-[#132238] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6 transition-colors">
          {/* Top Controls: Title, Period Filter, and Chart Mode */}
          <div className="flex flex-col gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#0F766E] dark:text-teal-400">
                    <LineChartIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Grafik Garis Pelamar Per Lowongan Kerja
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Live Metrics
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Visualisasi kurva garis (Line Chart) interaktif distribusi pelamar per posisi lowongan dengan filter bulanan & tahunan.
                </p>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setChartView("line")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartView === "line"
                      ? "bg-white dark:bg-[#132238] text-[#0F766E] dark:text-teal-300 shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tampilan Line Chart Modern"
                >
                  <LineChartIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
                  <span>Line Chart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartView("donut")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartView === "donut"
                      ? "bg-white dark:bg-[#132238] text-[#0F766E] dark:text-teal-300 shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tampilan Proporsi Donat"
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Donat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartView("trend")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    chartView === "trend"
                      ? "bg-white dark:bg-[#132238] text-[#0F766E] dark:text-teal-300 shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tampilan Tren Bulanan"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tren Bulanan</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-[#0F766E] dark:text-teal-400" />
                Filter Periode:
              </span>

              {/* Mode Waktu Pills */}
              <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-[#0F766E] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Semua Waktu
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("year")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterType === "year"
                      ? "bg-[#0F766E] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Per Tahun
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("month")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterType === "month"
                      ? "bg-[#0F766E] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Per Bulan
                </button>
              </div>

              {/* Year Dropdown */}
              {filterType !== "all" && (
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none pl-3 pr-7 py-1 rounded-xl bg-slate-50 dark:bg-[#0B132B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        Tahun {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                </div>
              )}

              {/* Month Dropdown */}
              {filterType === "month" && (
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="appearance-none pl-3 pr-7 py-1 rounded-xl bg-slate-50 dark:bg-[#0B132B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx}>
                        Bulan {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                </div>
              )}

              {/* Status Indicator Legend */}
              <div className="ml-auto hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
                  Kurva Distribusi Pelamar
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Titik Posisi Lowongan
                </span>
              </div>
            </div>
          </div>

          {/* VIEW 1: MODERN LINE CHART */}
          {chartView === "line" && (
            <div className="space-y-4">
              {/* Interactive Line HUD Bar */}
              {activeJob && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {activeJob.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-teal-400 font-medium">
                      ({activeJob.dept})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400">
                      Total Pelamar:{" "}
                      <strong className="text-cyan-700 dark:text-cyan-300 font-extrabold text-sm">
                        {activeJob.count}
                      </strong>
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      Interview:{" "}
                      <strong className="text-purple-700 dark:text-purple-300">{activeJob.interviewCount}</strong>
                    </span>
                    <span className="text-emerald-600 dark:text-teal-400">
                      Hired:{" "}
                      <strong className="text-emerald-700 dark:text-teal-300">{activeJob.hiredCount}</strong>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-teal-300">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {totalPeriodApplicants > 0
                        ? `${Math.round((activeJob.count / totalPeriodApplicants) * 100)}% dari total`
                        : "0%"}
                    </span>
                  </div>
                </div>
              )}

              {/* Line Chart Canvas with SVG */}
              <div className="relative pt-2 pb-2 min-h-[320px]">
                {/* SVG Line & Area Rendering */}
                <div className="relative z-10 h-72 w-full pb-16">
                  <svg
                    viewBox="0 0 1000 300"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      {/* Gradient for Area Fill */}
                      <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="#14B8A6" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Gradient for Line Stroke */}
                      <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0F766E" />
                        <stop offset="50%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#00F2FE" />
                      </linearGradient>

                      {/* Drop Shadow filter for neon glow */}
                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00F2FE" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Y-Axis Horizontal Grid Lines and Labels inside SVG */}
                    <g className="grid-lines">
                      {gridTicks.map((val) => {
                        const ratio = maxLineVal > 0 ? val / maxLineVal : 0;
                        const y = paddingYTop + chartHeight * (1 - ratio);
                        const isBaseline = val === 0;

                        return (
                          <g key={val}>
                            {/* Horizontal Line */}
                            <line
                              x1={paddingX}
                              x2={1000 - paddingRight}
                              y1={y}
                              y2={y}
                              stroke="currentColor"
                              strokeDasharray={isBaseline ? undefined : "4 4"}
                              className={
                                isBaseline
                                  ? "text-slate-300 dark:text-slate-700"
                                  : "text-slate-200 dark:text-slate-800/80"
                              }
                              strokeWidth={isBaseline ? "1.5" : "1"}
                            />
                            {/* Y-Axis Text Label */}
                            <text
                              x={paddingX - 12}
                              y={y + 4}
                              textAnchor="end"
                              className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono select-none"
                            >
                              {val === maxLineVal ? `${val} Pelamar` : val}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Gradient Area Fill under the line */}
                    {areaD && (
                      <path
                        d={areaD}
                        fill="url(#lineAreaGrad)"
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {/* Connecting Stroke Curve */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="url(#lineStrokeGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#neonGlow)"
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {/* Hover Guide Line */}
                    {hoveredIndex !== null && linePoints[hoveredIndex] && (
                      <line
                        x1={linePoints[hoveredIndex].x}
                        x2={linePoints[hoveredIndex].x}
                        y1={25}
                        y2={255}
                        stroke="#00F2FE"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="opacity-70 transition-all duration-200"
                      />
                    )}

                    {/* Interactive Data Point Dots */}
                    {linePoints.map((pt, idx) => {
                      const isHovered = hoveredIndex === idx;

                      return (
                        <g
                          key={pt.job_id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {/* Pulsing Outer Ring on Hover */}
                          {isHovered && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="15"
                              fill="#00F2FE"
                              fillOpacity="0.25"
                              className="animate-ping"
                            />
                          )}

                          {/* Outer Border Circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? "8.5" : "6"}
                            fill="#0B132B"
                            stroke="#00F2FE"
                            strokeWidth={isHovered ? "3" : "2.5"}
                            className="transition-all duration-300 shadow-md"
                          />

                          {/* Inner Dot */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? "4" : "3"}
                            fill={isHovered ? "#00F2FE" : "#14B8A6"}
                            className="transition-all duration-300"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Overlaid Data Value Badges & X-Axis Labels */}
                  <div className="absolute inset-0 flex justify-between items-end pointer-events-none px-6">
                    {linePoints.map((pt, idx) => {
                      const isHovered = hoveredIndex === idx;

                      return (
                        <div
                          key={pt.job_id}
                          style={{
                            left: `${(pt.x / 1000) * 100}%`,
                          }}
                          className="absolute -translate-x-1/2 bottom-0 w-24 text-center pointer-events-auto cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {/* Floating Value Pill Above Point */}
                          <div
                            style={{
                              bottom: `${((300 - pt.y) / 300) * 100 + 4}%`,
                            }}
                            className={`absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono transition-all duration-200 pointer-events-none ${
                              isHovered
                                ? "bg-[#0F766E] text-white shadow-md shadow-teal-500/30 scale-110"
                                : pt.count > 0
                                ? "bg-slate-100 dark:bg-[#0B132B] text-slate-900 dark:text-teal-300 border border-slate-200 dark:border-slate-800"
                                : "text-slate-400 dark:text-slate-600"
                            }`}
                          >
                            {pt.count}
                          </div>

                          {/* X-Axis Job Title Label */}
                          <div className="pt-2">
                            <p
                              className={`text-[11px] font-bold truncate transition-colors ${
                                isHovered
                                  ? "text-[#0F766E] dark:text-teal-300 scale-105"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                              title={pt.title}
                            >
                              {pt.title}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                              {pt.dept}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Summary Pill */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Total kandidat pelamar pada kurva garis aktif:
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 dark:text-teal-400 text-sm">
                    {totalPeriodApplicants} Pelamar Terdaftar
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {jobStats.length} Posisi Lowongan
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DONUT DISTRIBUTION */}
          {chartView === "donut" && (
            <div className="space-y-4">
              {totalPeriodApplicants === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs italic">
                  Belum ada pelamar pada periode yang dipilih.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
                  {/* SVG Donut */}
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-60 h-60 transform -rotate-90">
                      {donutSlices.map((slice, idx) => {
                        const radius = 70;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((slice.startAngle / 360) * circumference);

                        return (
                          <circle
                            key={slice.job_id}
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={hoveredIndex === idx ? "26" : "20"}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {totalPeriodApplicants}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-teal-400 font-semibold uppercase tracking-wider">
                        Pelamar
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2.5">
                    {donutSlices.map((slice, idx) => (
                      <div
                        key={slice.job_id}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          hoveredIndex === idx
                            ? "bg-slate-100 dark:bg-[#0B132B] border-slate-300 dark:border-slate-700"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-[#0B132B]/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          <span
                            className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {slice.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {slice.count}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B132B] text-slate-500 dark:text-slate-400 font-bold font-mono">
                            {slice.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: MONTHLY TREND */}
          {chartView === "trend" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tren Pendaftaran Lamaran per Bulan (Tahun {selectedYear})</span>
                <span className="font-bold text-slate-800 dark:text-teal-300">
                  Puncak Tertinggi: {Math.max(...monthlyTrendData.map((m) => m.count))} Pelamar
                </span>
              </div>

              <div className="relative pt-6 pb-2">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-6 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-between">
                    <span>{maxTrendCount}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-between">
                    <span>{Math.round(maxTrendCount * 0.5)}</span>
                  </div>
                  <div className="border-b border-slate-300 dark:border-slate-700 flex justify-between">
                    <span>0</span>
                  </div>
                </div>

                <div className="relative z-10 h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-6 pt-4 pb-10">
                  {monthlyTrendData.map((item, idx) => {
                    const heightPercent = maxTrendCount > 0 ? (item.count / maxTrendCount) * 100 : 0;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <div
                        key={item.month}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div
                          className={`mb-1 text-[10px] font-extrabold transition-all font-mono ${
                            isHovered
                              ? "text-[#0F766E] dark:text-teal-300 scale-125"
                              : item.count > 0
                              ? "text-slate-800 dark:text-teal-400"
                              : "text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          {item.count}
                        </div>

                        <div
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                            item.count > 0
                              ? isHovered
                                ? "bg-gradient-to-t from-teal-600 to-cyan-400 shadow-md"
                                : "bg-slate-800 dark:bg-gradient-to-t dark:from-teal-800 dark:to-teal-500"
                              : "bg-slate-200 dark:bg-slate-800/50"
                          }`}
                        />

                        <div className="absolute -bottom-1 text-center pointer-events-none">
                          <span
                            className={`text-[10px] font-bold ${
                              isHovered
                                ? "text-[#0F766E] dark:text-teal-300"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {item.month}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
