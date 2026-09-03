import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { NattenFlade } from "@/components/rummet/NattenFlade";
import { activeNat, loadHouse, loadNattenCopy } from "@/lib/content";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Aftener · Ink & Art",
  description: "Næste nat. Ink & Art, Larsbjørnsstræde 13.",
  alternates: { ...alternates("/natten"), canonical: "/natten" },
};

/** Ordene bor i content/natten.yml; nætterne i nat.yml. */
export default function NattenPage() {
  return (
    <RummetShell door={false}>
      <NattenFlade
        copy={loadNattenCopy()}
        nat={activeNat(loadHouse().nats)}
        lang="da"
      />
    </RummetShell>
  );
}
