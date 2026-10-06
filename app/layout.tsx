import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TalentHub – Karier & Rekrutmen",
    template: "%s | TalentHub",
  },
  description:
    "Bergabunglah bersama kami dan temukan karier impianmu. TalentHub membuka peluang luar biasa bagi para profesional berbakat Indonesia.",
  keywords: ["lowongan kerja", "karier", "rekrutmen", "hiring", "talent"],
  openGraph: {
    title: "TalentHub – Temukan Karier Impianmu",
    description:
      "Platform rekrutmen modern untuk kandidat terbaik Indonesia.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
