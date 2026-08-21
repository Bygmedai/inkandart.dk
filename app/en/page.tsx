import type { Metadata } from "next";
import { SceneV05 } from "@/components/emerge/SceneV05";
import { MobileDock } from "@/components/emerge/MobileDock";
import { alternates, t } from "@/lib/i18n";

import { SkipLink } from "@/components/i18n/SkipLink";
export const metadata: Metadata = {
  ...{ alternates: { ...alternates("/"), canonical: "/en" } },
  title: "Ink & Art Copenhagen — the mark stays",
  description:
    "Tattoo studio at Larsbjørnsstræde 13 in Pisserenden, Copenhagen. Walk-in, flash, gift cards. The mark stays.",
};

/** Samme landskab, andet sprog. Scenen er én komponent — ikke to kopier. */
export default function HomePageEn() {
  return (
    <>
      <SkipLink lang="en" />
    <main id="main" lang="en">
      <SceneV05 lang="en" />
      <MobileDock lang="en" />
    </main>
    </>
  );
}
