"use client";

import React from "react";
import EvaluationsManager, { CandidateOption } from "@/components/admin/EvaluationsManager";
import { AssessmentReviewRow } from "@/types/admin";

/**
 * ============================================================================
 * KOMPONEN KHUSUS PORTAL PENILAI
 * Lokasi: components/penilai/PenilaiEvaluationsClient.tsx
 * 
 * Komponen ini digunakan khusus oleh aktor Penilai untuk:
 * 1. Melihat daftar kandidat yang ditugaskan kepada penilai
 * 2. Menginput skor Technical Test & catatan evaluasi
 * 3. Melihat profil lengkap & CV kandidat
 * ============================================================================
 */
interface PenilaiEvaluationsClientProps {
  initialAssessments: AssessmentReviewRow[];
  activeCandidates?: CandidateOption[];
  userRole?: string;
  userName?: string;
}

export default function PenilaiEvaluationsClient({
  initialAssessments,
  activeCandidates = [],
  userRole = "penilai",
  userName = "Penilai Seleksi",
}: PenilaiEvaluationsClientProps) {
  return (
    <EvaluationsManager
      initialAssessments={initialAssessments}
      activeCandidates={activeCandidates}
      userRole={userRole}
      userName={userName}
    />
  );
}
