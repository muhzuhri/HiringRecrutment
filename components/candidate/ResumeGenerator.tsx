"use client";

import React, { useRef, useState } from "react";
import { CandidateProfile } from "@/types/candidate";
import {
  Download,
  Printer,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";

interface ResumeGeneratorProps {
  profile: CandidateProfile;
}

export default function ResumeGenerator({ profile }: ResumeGeneratorProps) {
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fullName = profile.full_name || "MUH. ZUHRI MUBARAK";

  // Direct PDF Download logic (WITHOUT calling window.print)
  const handleDownloadPdf = async () => {
    const element = document.getElementById("resume-pdf-container");
    if (!element) return;

    setDownloading(true);
    setStatusMsg(null);

    try {
      let html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.getElementById("html2pdf-cdn-script");
          if (existingScript) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.id = "html2pdf-cdn-script";
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Gagal memuat pustaka html2pdf CDN"));
          document.head.appendChild(script);
        });
        html2pdf = (window as any).html2pdf;
      }

      if (html2pdf) {
        const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, "_");
        const opt = {
          margin: [0.3, 0.3, 0.4, 0.3],
          filename: `CV_${cleanName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(element).save();
        setStatusMsg("File CV berhasil diunduh ke folder Downloads laptop/perangkat Anda!");
      } else {
        // Fallback: Trigger HTML File Download if html2pdf is unavailable (NO window.print())
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>CV_${fullName}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                h1 { text-align: center; text-transform: uppercase; font-size: 24px; margin-bottom: 5px; }
                .contact { text-align: center; font-size: 12px; color: #334155; margin-bottom: 20px; }
                .section-title { font-size: 16px; font-weight: bold; color: #7e22ce; border-bottom: 2px solid #7e22ce; padding-bottom: 3px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
                ul { margin-top: 5px; padding-left: 20px; }
                li { font-size: 13px; margin-bottom: 4px; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CV_${fullName.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatusMsg("Berkas CV terunduh langsung dalam format dokumen web.");
      }
    } catch (err: any) {
      console.error("Direct PDF generation notice:", err);
      setStatusMsg("Gagal mengunduh berkas. Pastikan koneksi internet stabil.");
    } finally {
      setDownloading(false);
    }
  };

  // Explicit print function only for the secondary Print Preview button
  const handlePrintPdf = () => {
    window.print();
  };

  // Filter experiences into Work vs Organization / Community Service
  const workExpList = (profile.experience || []).filter(
    (exp) => exp.category !== "organization"
  );
  const orgExpList = (profile.experience || []).filter(
    (exp) => exp.category === "organization"
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="bg-[#0c2b29] border border-emerald-800/50 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            CV Generator Standar MagangHub & Profesional
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Pratinjau & Unduh Langsung CV
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Menggunakan format standar resume resmi (Pendidikan, Pengalaman, Pengabdian, Informasi Tambahan & Sertifikasi).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/80 transition-all cursor-pointer border border-emerald-400/30 disabled:opacity-50"
            id="download-cv-pdf-btn"
          >
            <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
            <span>{downloading ? "Mengunduh Berkas PDF..." : "Unduh File CV (PDF) Langsung"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-700/60 transition-colors"
            title="Pratinjau Cetak via Browser"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Pratinjau Cetak</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-600 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. PRINT-FRIENDLY A4 CV DOCUMENT PREVIEW (EXACT MATCH FOR SCREENSHOTS 3 & 4) */}
      <div className="bg-slate-950/80 p-2 sm:p-6 rounded-2xl border border-emerald-900/60 overflow-x-auto">
        <div
          id="resume-pdf-container"
          className="print-cv-area bg-white text-slate-900 rounded-xl shadow-2xl max-w-4xl mx-auto p-8 sm:p-14 space-y-6 border border-slate-200 font-sans leading-relaxed"
          style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', Arial, sans-serif" }}
        >
          {/* Header Info (Centered like Screenshot 3) */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-slate-900 uppercase">
              {fullName}
            </h1>

            {/* Contact Row 1 */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm text-slate-700 font-medium">
              {(profile.phone || profile.whatsapp) && (
                <span>{profile.whatsapp || profile.phone}</span>
              )}
              {profile.linkedin_url && (
                <>
                  <span>|</span>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-semibold"
                  >
                    {profile.linkedin_url}
                  </a>
                </>
              )}
            </div>

            {/* Contact Row 2 */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm text-slate-700 font-medium">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="text-blue-700 underline font-semibold">
                  {profile.email}
                </a>
              )}
              {profile.portfolio_url && (
                <>
                  <span>|</span>
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-semibold"
                  >
                    {profile.portfolio_url}
                  </a>
                </>
              )}
            </div>

            {/* Ringkasan Diri / Bio Paragraph */}
            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-700 text-justify leading-relaxed pt-3">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Section 1: Pendidikan */}
          {profile.education && profile.education.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-extrabold text-[#7e22ce] uppercase tracking-wider border-b-2 border-[#7e22ce] pb-1">
                Pendidikan
              </h2>

              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={edu.id || i} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {edu.school}
                      </h3>
                      <span className="text-xs font-semibold text-slate-700 shrink-0">
                        {edu.startYear} – {edu.endYear}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                      {edu.major} {edu.level ? `(${edu.level})` : ""}
                    </p>

                    <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
                      {edu.gpa && (
                        <li>IPK kumulatif {edu.gpa}</li>
                      )}
                      {edu.coursework && (
                        <li>
                          <strong>Mata Kuliah Relevan:</strong> {edu.coursework}
                        </li>
                      )}
                      {edu.thesis && (
                        <li>
                          <strong>Skripsi:</strong> "{edu.thesis}"
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Pengalaman Kerja */}
          {workExpList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#7e22ce] uppercase tracking-wider border-b-2 border-[#7e22ce] pb-1">
                Pengalaman Kerja
              </h2>

              <div className="space-y-4">
                {workExpList.map((exp, i) => (
                  <div key={exp.id || i} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {exp.company}
                      </h3>
                      <span className="text-xs font-semibold text-slate-700 shrink-0">
                        {exp.location ? `${exp.location} | ` : ""}
                        {exp.period || (exp.isCurrent ? `${exp.startMonth} ${exp.startYear} – Sekarang` : `${exp.startMonth} ${exp.startYear} – ${exp.endMonth} ${exp.endYear}`)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                      {exp.position}
                    </p>

                    {exp.description && (
                      <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
                        {exp.description.split("\n").map((line, idx) => {
                          const cleanLine = line.trim().replace(/^[-•*]\s*/, "");
                          if (!cleanLine) return null;
                          return <li key={idx}>{cleanLine}</li>;
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Pengabdian Masyarakat / Organisasi */}
          {orgExpList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#7e22ce] uppercase tracking-wider border-b-2 border-[#7e22ce] pb-1">
                Pengabdian Masyarakat
              </h2>

              <div className="space-y-4">
                {orgExpList.map((exp, i) => (
                  <div key={exp.id || i} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {exp.company}
                      </h3>
                      <span className="text-xs font-semibold text-slate-700 shrink-0">
                        {exp.location ? `${exp.location} | ` : ""}
                        {exp.period || `${exp.startMonth || ''} ${exp.startYear} – ${exp.endMonth || ''} ${exp.endYear}`}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                      {exp.position}
                    </p>

                    {exp.description && (
                      <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
                        {exp.description.split("\n").map((line, idx) => {
                          const cleanLine = line.trim().replace(/^[-•*]\s*/, "");
                          if (!cleanLine) return null;
                          return <li key={idx}>{cleanLine}</li>;
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Informasi Tambahan (Hard Skills, Soft Skills, Bahasa) */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#7e22ce] uppercase tracking-wider border-b-2 border-[#7e22ce] pb-1">
              Informasi Tambahan
            </h2>

            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <li>
                <strong>Hard Skills :</strong>{" "}
                {profile.hard_skills ||
                  (profile.skills && profile.skills.length > 0
                    ? profile.skills.join(", ")
                    : "Data Analysis (SQL, Power BI, Excel), Web Development (Laravel, React, Next.js, HTML, CSS, Tailwind), Git/GitHub")}
              </li>

              <li>
                <strong>Soft Skills :</strong>{" "}
                {profile.soft_skills ||
                  "Pemecahan Masalah, Berpikir Kritis, Kolaborasi Lintas Fungsi, Adaptabilitas, Kerja Tim, Komunikasi Dan Manajemen Waktu"}
              </li>

              <li>
                <strong>Bahasa :</strong> {profile.languages || "Indonesia (fluent), English (intermediate)"}
              </li>
            </ul>
          </div>

          {/* Section 5: Sertifikasi (Matching Screenshot 4) */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#7e22ce] uppercase tracking-wider border-b-2 border-[#7e22ce] pb-1">
                Sertifikasi
              </h2>

              <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-800 space-y-2">
                {profile.certifications.map((cert, i) => (
                  <li key={cert.id || i} className="leading-relaxed">
                    <strong>{cert.title}</strong> – {cert.issuer}
                    {cert.credentialUrl && (
                      <span>
                        {" "}| ID Kredensial:{" "}
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline font-medium"
                        >
                          {cert.credentialUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </span>
                    )}
                    {cert.noExpiry
                      ? ""
                      : (cert.expiryMonth || cert.expiryYear)
                        ? ` (Berlaku hingga ${cert.expiryMonth ? `${cert.expiryMonth} ` : ""}${cert.expiryYear})`
                        : ""}
                    {" | "}
                    <span className="font-semibold text-slate-700">
                      {cert.issueMonth ? `${cert.issueMonth} ` : ""}
                      {cert.issueYear}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {/* Embedded CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-cv-area, .print-cv-area * {
            visibility: visible;
          }
          .print-cv-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
