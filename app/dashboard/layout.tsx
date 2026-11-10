import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CandidateHeader from "@/components/candidate/CandidateHeader";
import { getCandidateProfile } from "@/app/actions/candidate";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata = {
  title: "Portal Kandidat | TalentHub Recruitment Tracking",
  description: "Area khusus kandidat untuk memantau status lamaran, melengkapi data profil terstruktur, dan mengunggah CV PDF.",
};

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { profile } = await getCandidateProfile();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#061f1d] dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-emerald-500 transition-colors">
        {/* Header Navigation */}
        <CandidateHeader profile={profile} userEmail={user.email || ""} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 text-slate-500 dark:bg-[#0c2b29] dark:border-emerald-800/40 dark:text-emerald-300/80 text-xs py-6 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} TalentHub Recruitment Tracking System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                Privasi & Keamanan
              </span>
              <span>•</span>
              <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                Bantuan HR
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
