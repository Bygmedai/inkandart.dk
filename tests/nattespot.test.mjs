import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

/**
 * Nattespot — Natten kan sælge noget (Stevens kald 30/8, docs/accept/nattespot.md).
 *
 * Prøverne er bundet til STRUKTUREN, ikke til ordene: copy'en er Stevens
 * og skal kunne rettes i Decap uden at CI går rød.
 */

test("beløbet står ét sted — siden og butikken kan ikke sige to tal", () => {
  const commerce = read("lib/commerce.ts");
  const blok = commerce.slice(
    commerce.indexOf("export const NATTESPOT"),
    commerce.indexOf("} as const;", commerce.indexOf("export const NATTESPOT")),
  );
  assert.match(blok, /kr: 300/, "300 kr er Stevens kald");
  assert.match(blok, /variantId: "\d{14}"/, "levende variant-ID");

  // Beløbet må IKKE stå i YAML. Står det to steder, driver de fra hinanden
  // i det øjeblik nogen retter prisen ét af stederne.
  for (const fil of ["content/natten.yml", "content/natten.en.yml"]) {
    assert.doesNotMatch(read(fil), /300/, `${fil} må ikke bære beløbet`);
  }
});

test("knappen er et rigtigt link — den virker uden JavaScript", () => {
  const flade = read("components/rummet/NattenFlade.tsx");
  const spot = flade.slice(flade.indexOf('className="rum-spot"'));
  assert.match(spot, /<a\s/, "et <a>, ikke en onClick-knap");
  assert.match(spot, /nattespotCartUrl\(\)/, "peger på Shopifys cart-permalink");
  assert.doesNotMatch(flade, /^\s*["']use client["']/m, "fladen er server-renderet");
});

test("REGRESSION: Nattespot tæller som depositum på /booking/tak", () => {
  // Harukis råb i commerce.ts: en ny depositum-vare SKAL med i
  // depositumVarianter(), ellers betaler kunden 300 kr og får at vide at
  // ordren ikke er en holdt tid. Den kobling er usynlig i diffen.
  const commerce = read("lib/commerce.ts");
  const fn = commerce.slice(commerce.indexOf("export function depositumVarianter"));
  assert.match(fn, /NATTESPOT\.variantId/);
});

test("sektionen kan slukkes fra Decap uden en udvikler", () => {
  // Tom spot_titel => ingen sektion. Så kan huset tage den af fladen
  // hvis natten holder pause, uden at nogen rører koden.
  const flade = read("components/rummet/NattenFlade.tsx");
  assert.match(flade, /copy\.spot_titel \? \(/);
});

test("begge sprog har alle fire felter — ingen halvtom engelsk sektion", () => {
  for (const fil of ["content/natten.yml", "content/natten.en.yml"]) {
    const y = read(fil);
    for (const n of ["spot_titel", "spot_linje", "spot_vilkaar", "spot_koeb"]) {
      assert.match(y, new RegExp(`^${n}:`, "m"), `${fil} mangler ${n}`);
    }
  }
});

test("copy'en lover ikke en dato, et antal eller en artist (kriterium 5)", () => {
  // Sitet er en brandflade for et rigtigt studie (rails §4). Vi ved ikke
  // hvem der sidder kl. 02 om tre uger, og et tal vi ikke tæller er en løgn.
  const da = read("content/natten.yml");
  const spot = da.slice(da.indexOf("spot_titel:"));
  assert.doesNotMatch(spot, /\b\d{1,2}\.\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/i);
  assert.doesNotMatch(spot, /\b(Nizar|Emma|Anna)\b/, "ingen artist lovet");
  assert.doesNotMatch(spot, /\b\d+\s*(pladser|spots)\b/, "intet præcist antal");
});

test("REGRESSION: skærmlæser-sætningen taler kundens sprog", () => {
  // Fundet ved at måle den rigtige side: aria-etiketten var hårdkodet
  // dansk og fulgte med ud på /en, hvor en engelsk kunde fik «300 kroner
  // i depositum» læst op. For den der ikke kan se knappen, ER etiketten
  // knappen — så kriterium 3 gælder også her.
  const flade = read("components/rummet/NattenFlade.tsx");
  assert.match(flade, /aria-label=\{c\.spotAria\(/);
  assert.doesNotMatch(flade, /kroner i depositum/, "ingen dansk i markup");

  const i18n = read("lib/i18n.ts");
  assert.equal([...i18n.matchAll(/spotAria:/g)].length, 2, "begge sprog");
});

/**
 * S578. Villy meldte til Steven at natte-linjen var foraeldet efter at
 * huset fik nye tider (man–soen). Det var FORKERT: huset lukker 22 alle
 * andre dage, saa «torsdag, fredag og loerdag har vi aabent efter kl. 22»
 * var — og er — praecis rigtigt.
 *
 * Men fejlen var vaerd at have, fordi den viste hvad linjen ER: en
 * haandskrevet kopi af en kendsgerning der bor i aabningstider.yml.
 * Aendrer huset sine tider, bliver saetningen usand uden at noget bliver
 * roedt. Det er samme klasse som de seks duplikerede aabningstider vi
 * fjernede i S577 — den kan bare ikke loeses ved at pege ét sted hen,
 * fordi det er saelgende copy, ikke en tidsangivelse.
 *
 * Saa vagten binder sig til PAASTANDEN, ikke til ordene: naevner linjen
 * ugedage, skal det vaere praecis de dage huset faktisk har aabent efter
 * 22. Sonja kan omskrive saetningen frit — hun kan bare ikke komme til at
 * love en nat vi ikke har.
 */
test("natte-linjen naevner de dage huset faktisk har aabent efter 22", async () => {
  const yaml = await import("yaml");
  const { t } = await import("../lib/i18n.ts");
  const d = yaml.parse(read("content/aabningstider.yml"));

  // Aaben efter 22 = lukketiden ligger efter midnat (til < fra, fx 13→02)
  // eller senere end 22 samme dag. «13–22» lukker PAA 22 og taeller ikke.
  const sent = new Set(
    d.tider
      .filter((r) => Number(r.til) < Number(r.fra) || Number(r.til) > 22)
      .flatMap((r) => r.dage),
  );
  assert.ok(sent.size > 0, "negativ kontrol: ingen sene dage maalt i kilden");

  for (const [sprog, fil] of [["da", "content/natten.yml"], ["en", "content/natten.en.yml"]]) {
    const ordbog = t(sprog).rummet.tider.dag;
    const linje = yaml.parse(read(fil)).spot_linje ?? "";

    const naevnt = new Set(
      Object.entries(ordbog)
        .filter(([, ord]) => new RegExp(`\\b${ord}\\b`, "i").test(linje))
        .map(([noegle]) => noegle),
    );

    // Naevner copy'en slet ingen dage, lover den ingen bestemte naetter.
    // Det er en gyldig formulering og skal ikke tvinges roed.
    if (naevnt.size === 0) continue;

    assert.deepEqual(
      [...naevnt].sort(),
      [...sent].sort(),
      `${fil}: linjen lover ${[...naevnt].sort()} — huset har aabent efter 22 paa ${[...sent].sort()}`,
    );
  }
});
