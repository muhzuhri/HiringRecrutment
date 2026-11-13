import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CandidateHeader from "@/components/candidate/CandidateHeader";
import { getCandidateProfile } from "@/app/actions/candidate";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import RuangAmanBackground from "@/components/candidate/RuangAmanBackground";

export const metadata = {
  title: "Portal Kandidat | Nexora Digital Recruitment",
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
      <div className="min-h-screen bg-[#f8fafc] bg-ruangaman-grid dark:bg-[#061f1d] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white dark:selection:bg-teal-500 transition-colors relative overflow-x-hidden">
        {/* RuangAman Background: Grid + Radial Glow + Floating 3D Cubes */}
        <RuangAmanBackground />

        {/* Header Navigation */}
        <CandidateHeader profile={profile} userEmail={user.email || ""} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-[#0c2b29]/80 backdrop-blur-sm border-t border-slate-200/80 text-slate-500 dark:border-teal-800/40 dark:text-teal-300/80 text-xs py-6 mt-12 transition-colors relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Nexora Digital Recruitment System. All rights reserved.</p>
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
