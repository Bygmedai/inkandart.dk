/**
 * `/admin` er død (Sirius, CMS-RULING-01, 31/8).
 *
 * Decap lagde en eval-kapabel JavaScript-app på 5,1 MB og et GitHub-OAuth-
 * indgangspunkt på samme origin som kundesitet, og lod derefter den token
 * committe direkte til `main`. Det er den forkerte magtgrænse, uanset om
 * CSP'en lempes eller ej.
 *
 * Fladen var i forvejen i stykker i produktion (målt 31/8: den loadede og
 * fejlede på CSP), så der er ingen kapacitet at miste — kun angrebsflade at
 * fjerne. Derfor sker det NU og ikke efter migrationen: at beholde bytesene
 * på kundesitet i hele byggeperioden ville være at shippe hele risikoen og
 * intet af værdien.
 *
 * 410 og ikke 404: adressen HAR eksisteret. Et 410 fortæller en crawler at
 * den er væk med vilje, og et menneske at det ikke er en tastefejl. Samme
 * greb som app/(emerge)/en/[...slug].
 *
 * Indholdsredigering flytter til Shopify (HOUSE-CMS-01). Indtil da går
 * indholdsændringer gennem en PR — hvilket er langsommere, og ærligt.
 */
const KROP = `<!DOCTYPE html><html lang="da"><head><meta charset="utf-8"><title>410 Gone</title></head><body style="background:#0A0A0A;color:#E8E0D5;font-family:system-ui;padding:3rem"><p>Redigeringsfladen er flyttet. Denne adresse findes ikke længere.</p><p><a href="/" style="color:#C9A227">Ink &amp; Art</a></p></body></html>`;

export function GET() {
  return new Response(KROP, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function HEAD() {
  return new Response(null, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
