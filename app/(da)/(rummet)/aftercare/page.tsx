import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { AftercareFlade } from "@/components/rummet/AftercareFlade";
import { loadAftercare } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _a = loadAftercare();

export const metadata: Metadata = {
  alternates: { ...alternates("/aftercare"), canonical: "/aftercare" },
  title: `${_a.titel} · Ink & Art`,
  description: _a.lead,
};

/** Ordene bor i content/aftercare.yml — plejeråd rettes af dem der giver dem. */
export default function AftercarePage() {
  return (
    <RummetShell>
      <AftercareFlade copy={loadAftercare()} lang="da" />
    </RummetShell>
  );
}
