import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { getJobsFromSupabase } from "@/app/actions/jobs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beranda | Nexora Digital",
  description:
    "Temukan karier impianmu bersama Nexora Digital. Bergabung dengan ratusan profesional yang telah membangun karier cemerlang bersama kami.",
};

export default async function HomePage() {
  const { jobs } = await getJobsFromSupabase();

  return <HomePageClient jobs={jobs} />;
}
