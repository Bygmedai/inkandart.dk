import type { Metadata } from "next";
import { RummetShell } from "@/components/rummet/Shell";
import { AftercareFlade } from "@/components/rummet/AftercareFlade";
import { loadAftercareEn } from "@/lib/content";
import { alternates } from "@/lib/i18n";

const _a = loadAftercareEn();

export const metadata: Metadata = {
  alternates: { ...alternates("/aftercare"), canonical: "/en/aftercare" },
  title: `${_a.titel} · Ink & Art`,
  description: _a.lead,
};

/** Aftercare in English — instructions people follow on their own skin. */
export default function AftercarePageEn() {
  return (
    <RummetShell lang="en">
      <AftercareFlade copy={loadAftercareEn()} lang="en" />
    </RummetShell>
  );
}
