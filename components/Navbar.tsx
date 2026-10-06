"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/jobs", label: "Lowongan" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0c2b29] border-b border-emerald-800/40 text-slate-100 shadow-lg backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" id="navbar-logo-link">
            <img
              src="/img/logo.png"
              alt="TalentHub Logo"
              className="w-14 h-14 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="text-white font-extrabold text-xl tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Talent<span className="text-emerald-400">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#061f1d] p-1.5 rounded-2xl border border-emerald-900/50">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-300 hover:text-white hover:bg-emerald-900/40"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-200 hover:text-white text-sm font-semibold hover:bg-emerald-900/40 rounded-xl transition-all bg-emerald-600 "             >
              Masuk
            </Link>

          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-900/40 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-emerald-900/60">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === link.href ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-emerald-900/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-emerald-900/60 mt-2">
                <Link href="/login" className="py-2.5 text-center text-sm font-semibold text-slate-200 border border-emerald-700/50 rounded-lg">
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
