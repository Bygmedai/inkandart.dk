import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Husets telefonnummer står ÉT sted — og de to kilder skal være enige.
 *
 * `content/gaden.yml` siger det allerede: «Adressen og nummeret findes ét
 * sted for hele huset — den dag huset flytter, flytter det sig her.» Men
 * det passede ikke. Nummeret lå to steder:
 *
 *   content/kontakt.yml   Rummet: forside, gaden, artistsider, 404,
 *                         footer, personale — via loadKontakt()
 *   lib/site.ts           Emerge: /gavekort/til-dig, MobileDock,
 *                         KerbReservation på /shop — via site.phone
 *
 * De KAN ikke slås sammen: kontakt.yml læses med fs på serveren, og
 * site.ts bruges i klientkomponenter. Så de forbliver to — og hegnet her
 * holder dem mod hinanden i stedet.
 *
 * Fundet 10/9, da Steven gav huset et nyt nummer: fem filer skulle rettes,
 * og ingen prøve ville have sagt til hvis én blev glemt. En kunde der
 * ringer på et nummer huset ikke har, ringer ikke igen.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/** Otte cifre efter +45. Ikke en validering af nummeret — en af formen. */
const E164 = /^\+45\d{8}$/;

test("de to kilder er enige om husets nummer", async () => {
  const { loadKontakt } = await import("../lib/content.ts");
  const { site } = await import("../lib/site.ts");
  const k = loadKontakt();

  assert.match(k.telefon_e164, E164, "kontakt.yml: e164-formen");
  assert.match(site.phoneIntl, E164, "site.ts: e164-formen");
  assert.equal(site.phoneIntl, k.telefon_e164, "site.ts og kontakt.yml ringer til hvert sit nummer");
  assert.equal(site.phone, k.telefon_vist, "site.ts og kontakt.yml VISER hvert sit nummer");

  // Det viste nummer og det man ringer til skal være samme tal. Ellers
  // læser en skærmlæser ét op og linket ringer til et andet.
  assert.equal("+45" + site.phone.replace(/\s/g, ""), site.phoneIntl, "det viste og det kaldte nummer er ikke det samme");
});

test("Googles virksomhedsdata har husets nummer, ikke et gammelt", async () => {
  // seo-ld.js er en statisk fil (CSP: script-src 'self') og kan ikke
  // importere kontakt.yml. Derfor er den det oplagte sted at glemme.
  // Google viser det nummer der står her, i søgeresultatet.
  const { loadKontakt } = await import("../lib/content.ts");
  const ld = read("public/seo-ld.js");
  const fundet = ld.match(/telephone:\s*"([^"]+)"/);
  assert.ok(fundet, "seo-ld.js mangler telephone");
  assert.equal(fundet[1], loadKontakt().telefon_e164, "structured data ringer til et andet nummer end huset");
});

/**
 * Hvert dansk nummer i en tekst, som otte cifre.
 *
 * Landekoden skal med i mønsteret, ikke ignoreres. Første udgave brugte
 * `\b\d\d \d\d \d\d \d\d\b` og læste «45 91 88 73» ud af
 * «+45 91 88 73 96» — den meldte de engelske filer røde for et nummer
 * der var helt rigtigt. Et hegn der råber om noget der er i orden,
 * lærer folk at overhøre det.
 */
function numreI(tekst) {
  // TO former, og de er begge rigtige i huset:
  //   «+45 91 88 73 96» og «91 88 73 96»   — tekst, YAML, markup
  //   «+4591887396»                        — e164 i site.ts og kontakt.yml
  // Første udgave kendte kun den med mellemrum og fandt derfor 2 af 3
  // numre i repoet. Den negative kontrol («fandt kun N») fangede det —
  // det er hele grunden til at den står der.
  return [...tekst.matchAll(/\+45\d{8}\b|(?:\+45[\s ]?)?\b\d\d[\s ]\d\d[\s ]\d\d[\s ]\d\d\b/g)]
    .map((m) => m[0].replace(/\D/g, ""))
    .map((d) => (d.length === 10 && d.startsWith("45") ? d.slice(2) : d))
    .filter((d) => d.length === 8);
}

test("husets vilkår og privatliv opgiver det nummer huset har", async () => {
  const { loadKontakt } = await import("../lib/content.ts");
  const cifre = loadKontakt().telefon_vist.replace(/\D/g, "");
  for (const f of ["betingelser.yml", "betingelser.en.yml", "privatliv.yml", "privatliv.en.yml"]) {
    const numre = numreI(read(join("content", f)));
    assert.ok(numre.length > 0, `${f}: ingen kontakttelefon — juridisk tekst skal kunne ringes til`);
    for (const n of numre) assert.equal(n, cifre, `${f} opgiver ${n}, huset har ${cifre}`);
  }
});

/**
 * Hvert dansk telefonnummer i repoet, som otte cifre, med hvor det står.
 *
 * Skrevet fordi hegnet ovenfor kun ledte efter DET NUMMER huset havde.
 * Steven, 10/9, efter skiftet: «du har ikke fanget alle telefon numrene.»
 * Han havde ret — der var to mere, og de var usynlige for en søgning
 * efter det gamle nummer. Man finder ikke et nummer man ikke kender ved
 * at lede efter et man kender.
 */
function alleNumre() {
  const rødder = ["app", "components", "lib", "content", "public", "scripts"];
  const fil = /\.(tsx?|mjs|yml|js)$/;
  const gå = (dir) =>
    readdirSync(join(root, dir), { withFileTypes: true }).flatMap((d) => {
      const p = join(dir, d.name);
      if (d.name === "node_modules" || d.name.startsWith(".")) return [];
      return d.isDirectory() ? gå(p) : fil.test(d.name) ? [p] : [];
    });
  const fundet = new Map();
  for (const f of rødder.flatMap(gå)) {
    for (const n of numreI(read(f))) {
      if (!fundet.has(n)) fundet.set(n, new Set());
      fundet.get(n).add(f);
    }
  }
  return fundet;
}

/**
 * Husets numre, med hvad hvert er til. Et nummer der ikke står her, er
 * enten en fejl eller en beslutning ingen har skrevet ned — begge dele
 * skal stoppe en PR.
 */
const KENDTE = {
  "91887396": "husets nummer — kontakt.yml + site.ts + vilkår + privatliv + Googles data",
  "50279123": "WhatsApp — site.whatsapp. Kunden skriver her fra /flash, /gavekort og aftercare. EGET nummer: wa.me virker kun hvis nummeret ER på WhatsApp, så det følger ikke husets linje automatisk.",
  "60536068": "Simone Chimera, administration — kun i teamguiden bag husets kode. En persons egen linje, ikke husets.",
};

test("hvert telefonnummer i repoet er et vi har skrevet ned", () => {
  const fundet = alleNumre();
  assert.ok(fundet.size >= 3, `negativ kontrol: fandt kun ${fundet.size} numre`);

  const ukendte = [...fundet]
    .filter(([nr]) => !(nr in KENDTE))
    .map(([nr, steder]) => `${nr} i ${[...steder].join(", ")}`);
  assert.deepEqual(ukendte, [], "telefonnummer ingen har skrevet ned:\n" + ukendte.join("\n"));

  // Og omvendt: et nummer i listen der ikke længere findes, er en løgn
  // i dokumentationen. Så forsvinder Simone fra huset, går den rød.
  const forsvundne = Object.keys(KENDTE).filter((nr) => !fundet.has(nr));
  assert.deepEqual(forsvundne, [], "listen nævner numre der ikke findes i repoet");
});

test("dansk og engelsk teamguide opgiver de SAMME numre", () => {
  // Uden den her var listen ovenfor tilfreds med at nummeret fandtes ét
  // sted. Målt som mutation 10/9: fjern Simones nummer fra den danske
  // teamguide, og hegnet blev grønt — fordi den engelske stadig havde
  // det. To vejledninger med hvert sit nummer er værre end ingen: den
  // ene halvdel af holdet ringer forgæves.
  const da = numreI(read("content/teamguide.yml")).sort();
  const en = numreI(read("content/teamguide.en.yml")).sort();
  assert.ok(da.length > 0, "negativ kontrol: den danske teamguide har ingen numre");
  assert.deepEqual(da, en, "teamguiderne opgiver forskellige numre");
});

test("WhatsApp-nummeret er sit eget, og det er et valg — ikke en forglemmelse", async () => {
  const { site } = await import("../lib/site.ts");
  const { loadKontakt } = await import("../lib/content.ts");
  assert.match(site.whatsapp, E164, "WhatsApp skal være e164 — wa.me får cifrene herfra");

  // Er de to ens en dag, er det fordi nogen har besluttet det. Er de
  // forskellige, er det også en beslutning. Hegnet kræver bare at
  // nummeret ER erklæret i KENDTE, så ingen tror det er en fejl.
  const wa = site.whatsapp.replace(/\D/g, "").replace(/^45/, "");
  assert.ok(wa in KENDTE, "WhatsApp-nummeret skal stå i KENDTE med hvad det er");

  // wa.me bruger kun cifre. Står der et mellemrum eller et plus i
  // site.whatsapp, bygger fladerne alligevel et gyldigt link — men kun
  // fordi hver af dem husker .replace(). Hegnet måler at de gør.
  const brugere = ["app/(da)/(emerge)/flash/page.tsx", "app/(en)/(emerge)/en/flash/page.tsx", "app/(da)/(emerge)/gavekort/page.tsx", "components/rummet/AftercareFlade.tsx"];
  for (const f of brugere) {
    assert.match(read(f), /wa\.me\/\$\{site\.whatsapp\.replace\(\/\\D\/g, ""\)\}/, `${f}: wa.me skal have rene cifre`);
  }
  assert.notEqual(site.whatsapp, loadKontakt().telefon_e164 + "x", "kontrol: sammenligningen kan udføres");
});

test("ingen flade skriver nummeret i markup", () => {
  // Skrevet i hånden ét sted er skrevet forkert et andet den dag det
  // skifter. Målt 10/9: SceneV05 havde tel:+45… og cifrene i markup, med
  // site.phone i sin egen aria-label — samme linje, to numre.
  const filer = readdirSync(join(root, "components"), { recursive: true })
    .map((f) => join("components", String(f)))
    .filter((f) => f.endsWith(".tsx"));
  assert.ok(filer.length >= 20, `negativ kontrol: fandt kun ${filer.length} komponenter`);
  const fund = [];
  for (const f of filer) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const n of numreI(src)) fund.push(`${f}: ${n}`);
    for (const m of src.matchAll(/\+45\d{8}/g)) fund.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(fund, [], "telefonnummer skrevet i hånden:\n" + fund.join("\n"));
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  assert.match("+4591887396", E164);
  assert.doesNotMatch("91887396", E164, "uden +45 er det ikke e164");
  assert.doesNotMatch("+45918873961", E164, "ni cifre er ikke et dansk nummer");
  assert.equal("+45" + "91 88 73 96".replace(/\s/g, ""), "+4591887396");
  assert.notEqual("+45" + "55 24 86 08".replace(/\s/g, ""), "+4591887396");

  // Fælden der fældede hegnet selv: landekoden må ikke spises som cifre.
  assert.deepEqual(numreI("Call +45 91 88 73 96 or write"), ["91887396"]);
  assert.deepEqual(numreI("ring på 91 88 73 96 eller"), ["91887396"]);
  assert.deepEqual(numreI("CVR 44226413 · booking@inkandart.dk"), [], "et CVR er ikke et telefonnummer");
  assert.deepEqual(numreI("gammelt: 55 24 86 08"), ["55248608"], "et forkert nummer skal stadig findes");

  // Begge skriveformer skal findes. Kun den ene kendte hegnet først, og
  // så var to af husets tre numre usynlige for det.
  assert.deepEqual(numreI('phoneIntl: "+4591887396",'), ["91887396"], "den kompakte e164-form");
  assert.deepEqual(numreI('whatsapp: "+4550279123",'), ["50279123"], "WhatsApp står også kompakt");
  assert.deepEqual(numreI('rolle: "+45 60 53 60 68"'), ["60536068"], "og en med mellemrum og landekode");
});
