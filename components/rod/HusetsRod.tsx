import { Analytics } from "@vercel/analytics/next";
import { KlikVagt } from "@/components/analytics/Klik";
import { JsonLd } from "@/components/seo/JsonLd";
import { husetsGraf } from "@/lib/jsonld";
import { loadAabningstider, loadKontakt } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * Husets skal — det ene sted <html> og <body> bliver skrevet.
 *
 * HVORFOR DEN FINDES. Et dokument har ét sprog, og det står i <html lang>.
 * Indtil nu stod der `da` på hele sitet, også på /en, hvor teksten er
 * engelsk. Skærmlæseren læste altså engelsk op med dansk udtale, og Google
 * fik at vide at den engelske flade var dansk — mens hreflang på samme side
 * sagde det modsatte. To signaler der modsiger hinanden er værre end ingen.
 *
 * Next skriver <html> ét sted: i rod-layoutet. Attributten kan derfor ikke
 * skifte pr. side uden enten at gøre hele sitet dynamisk (og betale for det
 * på hver eneste statiske side) eller at give sproget sit eget rod-layout.
 * Vi valgte det sidste: `app/(da)` og `app/(en)` er to rødder, og de deler
 * denne komponent, så alt andet end sproget kun findes ét sted.
 *
 * Prisen: et klik mellem dansk og engelsk er en fuld sideindlæsning i
 * stedet for en klient-overgang. Det sker én gang pr. besøg, og det er
 * billigere end en flade der lyver om sit eget sprog.
 */
export function HusetsRod({
  lang,
  children,
}: {
  lang: "da" | "en";
  children: React.ReactNode;
}) {
  return (
    <html lang={lang}>
      <body className="bg-[var(--void)] text-[var(--text)] antialiased">
        {/* Husets strukturerede data — i HTML'en fra serveren, ét @id for
            studiet på begge sprog (docs/accept/json-ld.md). Afløser
            public/seo-ld.js, som kun fandtes efter hydrering. */}
        <JsonLd data={husetsGraf({ kontakt: loadKontakt(), tider: loadAabningstider(), site })} />
        {children}
        <Analytics />
        {/* Klik-events (#245 C). Én ø for hele sitet, saa handelsfladerne
            forbliver server-renderede og virker uden JS. */}
        <KlikVagt />
      </body>
    </html>
  );
}
