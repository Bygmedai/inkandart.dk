import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { ChateauCollabFlade } from "@/components/rummet/ChateauCollabFlade";

export const metadata: Metadata = {
  title: "Ink & Art × Chateau Motel",
  description:
    "Collab-pitch: tatovørstol som lukket rum hos Chateau Motel. Ikke offentlig.",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * B2B one-pager til Chateau Motel (Monir). noindex, nofollow, nocache.
 * Står bevidst IKKE i nav eller sitemap — dem der skal se den, får linket.
 */
export default function ChateauCollabPage() {
  return (
    <RummetShell door={false}>
      <ChateauCollabFlade />
    </RummetShell>
  );
}
