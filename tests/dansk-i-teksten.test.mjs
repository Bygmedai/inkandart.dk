import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Æ, Ø og Å i den tekst kunden læser.
 *
 * content/samtykke.yml blev skrevet med aa/oe/ae og nåede produktion:
 * «Foedselsdato», «Jeg er fyldt 18 aar», «Stoerrelse». Villy fandt den
 * live 1/9 2026. Det er den formular et menneske skriver under på før de
 * bliver tatoveret — den må ikke se ud som om huset ikke kan stave.
 *
 * Vanen kommer fra kildekode, hvor ASCII er fint. Vagten her skiller de
 * to ting ad: NØGLER må gerne hedde `haandvaerk` og `maa_vises`, for de
 * er feltnavne. VÆRDIER er tekst, og tekst skal være dansk.
 *
 * Tilladelseslisten er en baseline, ikke en mening: det er de ord der
 * lovligt indeholder sekvenserne i dag. Kommer der et nyt, skal nogen
 * tage stilling til det — det er hele pointen.
 */

const MISTANKE = /\b[\wÆØÅæøå]*(aa|oe|ae)[\wÆØÅæøå]*\b/gi;

const LOVLIGE = new Set([
  // egennavne og id'er
  "saad", "gaest", "monroe", "madonna", "aarhus", "aalborg",
  // dagkoder i aabningstider.yml og artists.yml
  "loer",
  // ord hvor sekvensen er ægte dansk eller engelsk
  "datoen", "købsdatoen", "email", "emails", "does",
  // kamera + er. Fanget af vagten da teamguiden kom til — og det er
  // sådan listen skal vokse: et menneske tager stilling, én gang.
  "kameraer",
]);

const danskeFiler = readdirSync(join(root, "content"))
  .filter((f) => f.endsWith(".yml") && !f.endsWith(".en.yml"));

function tekster(v, sti, ud) {
  if (typeof v === "string") {
    // Stier og filnavne er ikke tekst.
    if (v.startsWith("/")) return;
    ud.push([sti, v]);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => tekster(x, `${sti}[${i}]`, ud));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) tekster(x, `${sti}.${k}`, ud);
  }
}

test("dansk kundetekst skrives med æ, ø og å — ikke ae, oe og aa", () => {
  const fejl = [];
  for (const f of danskeFiler) {
    const ud = [];
    tekster(parse(readFileSync(join(root, "content", f), "utf8")), "", ud);
    for (const [sti, v] of ud) {
      for (const m of v.matchAll(MISTANKE)) {
        const ord = m[0];
        if (LOVLIGE.has(ord.toLowerCase())) continue;
        fejl.push(`${f}${sti}: «${ord}» i «${v.slice(0, 70)}»`);
      }
    }
  }
  assert.deepEqual(fejl, [], "translitereret dansk i kundetekst:\n" + fejl.join("\n"));
});

test("negativ kontrol: vagten kan faktisk se en fejl", () => {
  // Uden den her ville en tom eller for smal søgning bestå i stilhed.
  const prøve = "Jeg er fyldt 18 aar og hedder Foedselsdato";
  const fund = [...prøve.matchAll(MISTANKE)]
    .map((m) => m[0])
    .filter((o) => !LOVLIGE.has(o.toLowerCase()));
  assert.deepEqual(fund, ["aar", "Foedselsdato"]);
});

test("samtykkeerklæringen har rigtige danske bogstaver", () => {
  const s = readFileSync(join(root, "content/samtykke.yml"), "utf8");
  // Positiv kontrol: filen SKAL indeholde danske bogstaver. En dansk
  // formular uden ét eneste æøå er translitereret, ikke velskrevet.
  assert.match(s, /[æøåÆØÅ]/);
  for (const gammel of ["Foedselsdato", "18 aar", "Stoerrelse", "vaere", "ogsaa"]) {
    assert.doesNotMatch(s, new RegExp(gammel), `«${gammel}» er tilbage`);
  }
});

test("de to sprogfiler har stadig de samme nøgler", () => {
  const n = (f) => Object.keys(parse(readFileSync(join(root, "content", f), "utf8"))).sort();
  assert.deepEqual(n("samtykke.yml"), n("samtykke.en.yml"));
});
