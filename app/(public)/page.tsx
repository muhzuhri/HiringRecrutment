import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Beranda | TalentHub",
  description:
    "Temukan karier impianmu bersama TalentHub. Bergabung dengan ratusan profesional yang telah membangun karier cemerlang bersama kami.",
};

export default function HomePage() {
  return <HomePageClient />;
}
