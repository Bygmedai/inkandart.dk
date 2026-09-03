import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { SamtykkeFlade } from "@/components/rummet/SamtykkeFlade";
import { loadSamtykkeEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _s = loadSamtykkeEn();

export const metadata: Metadata = {
  alternates: { ...alternates("/samtykke"), canonical: "/en/samtykke" },
  title: `${_s.titel} · Ink & Art`,
  description: _s.lede,
};

export default function SamtykkePageEn() {
  return (
    <RummetShell lang="en">
      <SamtykkeFlade c={loadSamtykkeEn()} lang="en" betingelserHref="/en/betingelser" />
    </RummetShell>
  );
}
