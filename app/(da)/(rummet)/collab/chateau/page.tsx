import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { ChateauCollabFlade } from "@/components/rummet/ChateauCollabFlade";

export const metadata: Metadata = {
  title: "Flash upstairs at Chateau Motel · Ink & Art",
  description:
    "Flash ovenpå hos Chateau Motel — én stol, små stykker, begrænsede pladser. Pilot.",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Gæsteside for flash upstairs hos Chateau Motel. noindex, nofollow, nocache.
 * Står bevidst IKKE i nav eller sitemap — dem der skal se den, får linket.
 */
export default function ChateauCollabPage() {
  return (
    <RummetShell door={false}>
      <ChateauCollabFlade />
    </RummetShell>
  );
}
