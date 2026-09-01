import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { SamtykkeFlade } from "@/components/rummet/SamtykkeFlade";
import { loadSamtykke } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _s = loadSamtykke();

export const metadata: Metadata = {
  alternates: { ...alternates("/samtykke"), canonical: "/samtykke" },
  title: `${_s.titel} · Ink & Art`,
  description: _s.lede,
};

/** Ordene bor i content/samtykke.yml. Felterne bor i lib/samtykke.ts. */
export default function SamtykkePage() {
  return (
    <RummetShell>
      <SamtykkeFlade c={loadSamtykke()} lang="da" betingelserHref="/betingelser" />
    </RummetShell>
  );
}
