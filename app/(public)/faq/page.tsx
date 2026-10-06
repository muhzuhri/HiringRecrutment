"use client";

import { useState } from "react";
import { faqs } from "@/data/faq";
import type { FaqItem } from "@/data/faq";

function AccordionItem({ question, answer, id }: { question: string; answer: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item bg-white transition-all duration-200 ${open ? "shadow-md" : ""}`}>
      <button
        id={`faq-btn-${id}`}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`font-semibold text-sm leading-snug transition-colors ${open ? "text-emerald-900" : "text-gray-800"}`}>
          {question}
        </span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${open ? "bg-[#0c2b29] rotate-45 text-white" : "bg-emerald-50 text-emerald-900"}`}>
          <svg className={`w-4 h-4 transition-colors ${open ? "text-white" : "text-emerald-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// FAQ metadata is exported from a separate server component
// This page is a Client Component for accordion interactivity
export default function FAQPage() {
  return (
    <div className="bg-grid-pattern min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(12,43,41,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="section-tag mb-5 inline-flex"><span>❓</span><span>FAQ</span></div>
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta)", color: "#1a1a2e", letterSpacing: "-0.02em" }}
          >
            Pertanyaan yang Sering Ditanyakan
          </h1>
          <p className="text-gray-500 text-lg">
            Temukan jawaban atas pertanyaan umum seputar proses rekrutmen kami. Tidak menemukan jawaban?{" "}
            <a href="mailto:rekrutmen@talenthub.id" className="text-emerald-800 font-semibold hover:underline">
              Hubungi kami
            </a>.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-emerald-900/10" />
                <h2 className="section-tag text-xs whitespace-nowrap">{section.category}</h2>
                <div className="h-px flex-1 bg-emerald-900/10" />
              </div>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    question={item.q}
                    answer={item.a}
                    id={`${section.category.toLowerCase().replace(/\s+/g, "-")}-${i}`}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="career-card p-8 text-center bg-slate-50 border border-slate-200">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#1a1a2e" }}>Masih Ada Pertanyaan?</h3>
            <p className="text-gray-500 text-sm mb-5">Tim HR kami siap membantu kamu menjawab pertanyaan yang lebih spesifik.</p>
            <a href="mailto:rekrutmen@talenthub.id" className="btn-primary inline-flex">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Kirim Email ke Kami
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
