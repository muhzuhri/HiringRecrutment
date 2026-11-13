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
    default: "Nexora Digital – Karier & Rekrutmen",
    template: "%s | Nexora Digital",
  },
  description:
    "Bergabunglah bersama Nexora Digital dan temukan karier impianmu. Kami membuka peluang luar biasa bagi para profesional berbakat Indonesia.",
  keywords: ["lowongan kerja", "karier", "rekrutmen", "hiring", "talent", "nexora digital"],
  openGraph: {
    title: "Nexora Digital – Temukan Karier Impianmu",
    description:
      "Platform rekrutmen modern Nexora Digital untuk kandidat terbaik Indonesia.",
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
