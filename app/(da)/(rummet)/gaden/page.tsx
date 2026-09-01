import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { GadenFlade } from "@/components/rummet/GadenFlade";
import { loadGaden, loadKontakt } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _k = loadKontakt();

export const metadata: Metadata = {
  title: "Gaden · Ink & Art",
  description: `${_k.adresse}, ${_k.by}. Tatovering og piercing.`,
  alternates: { ...alternates("/gaden"), canonical: "/gaden" },
};

/** Ordene bor i content/gaden.yml, stamdata i kontakt.yml. */
export default function GadenPage() {
  return (
    <RummetShell>
      <GadenFlade gaden={loadGaden()} lang="da" />
    </RummetShell>
  );
}
