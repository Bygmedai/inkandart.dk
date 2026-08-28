import type { Metadata } from "next";
import { site } from "@/lib/site";
import { RummetShell } from "@/components/rummet/Shell";

export const metadata: Metadata = {
  alternates: { canonical: "/privatlivspolitik" },
  title: "Privatlivspolitik · Ink & Art",
};

export default function PrivacyPage() {
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <h1 className="rum-poster">Privatlivspolitik</h1>
        <div className="rum-body-copy" style={{ marginTop: 24 }}>
          <p>
            Ink &amp; Art Copenhagen, {site.address.street}, {site.address.postalCode}{" "}
            {site.address.city}. Vi indsamler kun det du selv giver os — navn, kontakt og
            det du skriver om din idé.
          </p>
          <p style={{ marginTop: 16 }}>
            Booking sker via vores bookingsystem. Nyhedsbreve og formularer bruges til at
            svare dig, ikke til at sælge dine data. Du kan bede om sletning når som helst.
          </p>
          <p style={{ marginTop: 16 }}>
            Vi måler besøg med Vercel Web Analytics. Det er cookieløst: der sættes ingen
            cookies, der bruges ingen fingerprinting, og din IP-adresse gemmes ikke. Vi ser
            kun hvilke sider der bliver besøgt, og hvor besøget kom fra — aldrig hvem du er.
          </p>
          <p style={{ marginTop: 16 }}>Sidst opdateret 2026-08-21.</p>
        </div>
      </main>
    </RummetShell>
  );
}
