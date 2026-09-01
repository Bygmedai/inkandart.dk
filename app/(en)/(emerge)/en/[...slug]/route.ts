/** Unknown English paths are gone, not silently folded into the Danish home. */
export function GET() {
  return new Response(
    `<!DOCTYPE html><html lang="da"><head><meta charset="utf-8"><title>410 Gone</title></head><body style="background:#0A0A0A;color:#E8E0D5;font-family:system-ui;padding:3rem"><p>Denne adresse findes ikke længere.</p><p><a href="/" style="color:#C9A227">Ink &amp; Art</a></p></body></html>`,
    {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export function HEAD() {
  return new Response(null, { status: 410 });
}
