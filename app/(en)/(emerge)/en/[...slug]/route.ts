/**
 * Unknown English paths are gone, not silently folded into the Danish home.
 *
 * The 410 is deliberate (Haruki): an address that HAS existed should tell a
 * crawler it is gone, not that it is merely missing. That reasoning stands.
 *
 * What did not stand, measured in production 2/9: the page answered in
 * DANISH with `lang="da"` — on the English flade. An English customer who
 * mistyped an address got «Denne adresse findes ikke længere», and the only
 * way onwards was `/`, which is the Danish front page. Same class of fault
 * as #282 (the English flade declaring itself Danish) and as the consent
 * letters on 1/9: the language followed the file, not the reader.
 *
 * It is also a dead end no more: the way back is `/en`, and the two rooms a
 * lost visitor is most likely looking for are named.
 *
 * Kept deliberately dependency-free — no layout, no fonts, no JavaScript.
 * A 410 must be able to answer when everything else is broken.
 */
const KROP = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gone · Ink &amp; Art</title></head><body style="background:#070707;color:#e8dcc8;font-family:system-ui,sans-serif;margin:0;padding:3rem 1.5rem;line-height:1.5">
<p style="margin:0 0 1rem">This address is gone.</p>
<p style="margin:0 0 2rem;color:#8a8580">It may have moved, or it may never have existed. The English site is still here.</p>
<p style="margin:0;display:flex;flex-wrap:wrap;gap:1.5rem">
<a href="/en" style="color:#c8ff3d;display:inline-flex;align-items:center;min-height:44px">Ink &amp; Art</a>
<a href="/en/booking" style="color:#c8ff3d;display:inline-flex;align-items:center;min-height:44px">Book a session</a>
<a href="/en/walk-in" style="color:#c8ff3d;display:inline-flex;align-items:center;min-height:44px">Walk-in</a>
</p>
</body></html>`;

export function GET() {
  return new Response(KROP, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function HEAD() {
  return new Response(null, { status: 410 });
}
