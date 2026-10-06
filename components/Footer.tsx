import Link from "next/link";

const footerLinks = {
  company: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/about#values", label: "Nilai Perusahaan" },
    { href: "/about#benefits", label: "Benefit & Fasilitas" },
  ],
  careers: [
    { href: "/jobs", label: "Semua Lowongan" },
    { href: "/jobs?dept=engineering", label: "Engineering" },
    { href: "/jobs?dept=marketing", label: "Marketing" },
    { href: "/jobs?dept=hr", label: "Human Resources" },
  ],
  support: [
    { href: "/faq", label: "FAQ" },
    { href: "/login", label: "Login Kandidat" },
    { href: "/register", label: "Daftar Akun" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#061f1d] border-t border-emerald-900/60 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-extrabold text-xl">Talent<span className="text-emerald-400">Hub</span></span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Platform rekrutmen end-to-end untuk perusahaan dan kandidat terbaik Indonesia.
            </p>
            <div className="flex gap-3">
              {["linkedin", "instagram", "twitter"].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center transition-colors border border-emerald-700/40"
                  aria-label={social}
                >
                  <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4">
                {category === "company" ? "Perusahaan" : category === "careers" ? "Karier" : "Bantuan"}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-emerald-300 text-sm transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-emerald-900/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} TalentHub. Hak cipta dilindungi.
          </p>
          <p className="text-emerald-400 text-sm font-medium">
            Dibuat dengan 💚 untuk talenta Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
