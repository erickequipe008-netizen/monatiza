import type { Metadata } from "next";
import { listPublishedMagazines } from "@/lib/magazines";
import { SITE_URL } from "@/lib/seo";
import MagazineStore from "@/components/revista/MagazineStore";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Revistas Digitais — Monatiza",
  description:
    "Loja de revistas digitais da Monatiza: edições em PDF com reportagens especiais, negócios, tecnologia e IA. Compre e receba por e-mail.",
  alternates: { canonical: `${SITE_URL}/revista` },
  openGraph: {
    title: "Revistas Digitais — Monatiza",
    description: "Edições digitais em PDF. Compre, receba por e-mail e leia onde quiser.",
    url: `${SITE_URL}/revista`,
    type: "website",
  },
};

export default async function RevistaStorePage() {
  const magazines = await listPublishedMagazines();
  return <MagazineStore magazines={magazines} />;
}
