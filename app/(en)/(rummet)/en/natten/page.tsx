import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { NattenFlade } from "@/components/rummet/NattenFlade";
import { activeNat, loadHouse, loadNattenCopyEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Natten · Ink & Art",
  description: "The next night at Ink & Art, Larsbjørnsstræde 13, Copenhagen.",
  alternates: { ...alternates("/natten"), canonical: "/en/natten" },
};

/** Natten in English. The name itself stays — it is the house's word. */
export default function NattenPageEn() {
  return (
    <RummetShell lang="en" door={false}>
      <NattenFlade
        copy={loadNattenCopyEn()}
        nat={activeNat(loadHouse().nats)}
        lang="en"
      />
    </RummetShell>
  );
}
