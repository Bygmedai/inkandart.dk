/** Hilsen på et gavekort. Aldrig koden — den bor i Shopify-mailen. */
export type GiftNote = {
  til: string;
  fra: string;
  hilsen: string;
};

function one(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function readGiftNote(q: Record<string, string | string[] | undefined>): GiftNote {
  return {
    til: cleanLine(one(q.til), 48),
    fra: cleanLine(one(q.fra), 48),
    hilsen: cleanNote(one(q.hilsen), 240),
  };
}

export function giftNoteQuery(note: GiftNote): string {
  const p = new URLSearchParams();
  if (note.til) p.set("til", note.til);
  if (note.fra) p.set("fra", note.fra);
  if (note.hilsen) p.set("hilsen", note.hilsen);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Enkeltlinje: kontroltegn bliver mellemrum, så ord ikke limes. */
function cleanLine(raw: string, max: number): string {
  return raw
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim()
    .slice(0, max);
}

/** Hilsen: linjeskift bevares (textarea, print). Øvrige C0 → mellemrum. */
function cleanNote(raw: string, max: number): string {
  return raw
    .replace(/[<>]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/ \n/g, "\n")
    .replace(/\n /g, "\n")
    .trim()
    .slice(0, max);
}
