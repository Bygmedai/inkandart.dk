import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { t } from "../lib/i18n.ts";

/**
 * Man skal kunne SIGE det man kan LÆSE (WCAG 2.5.3, Label in Name).
 *
 * En der styrer computeren med stemmen siger de ord der står på knappen.
 * Matcher knappens navn ikke de ord, sker der ingenting — og fejlen er
 * usynlig for alle andre, fordi knappen ser rigtig ud og virker med mus.
 *
 * Målt i fuld QA 3/9 på husets egne købsknapper:
 *
 *   man læste            knappen hed
 *   Hold plads 100,-     Reservér piercing i øret med 100 kroner i depositum
 *   Hold min plads       Reservér en tid med 100 kroner i depositum
 *   Hold tiden 500,-     Hold en flash-tid i shoppen … med 500 kroner …
 *
 * Ingen af dem indeholdt det ord man kunne se. Husets eget rigtige
 * mønster stod allerede i `spotAria`, som BYGGER navnet af den synlige
 * tekst — det er formen alle fire bruger nu.
 *
 * Hegnet måler VÆRDIERNE, ikke kildekoden: det kalder de samme funktioner
 * siden kalder, på begge sprog. Så kan en oversættelse ikke skride fra
 * knappen uden at gå rød.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/**
 * Ordene man kan LÆSE, uden tal og pynt.
 *
 * Prisen står på knappen som «100,-», men navnet siger «100 kroner» —
 * det er den rigtige oplæsning, og en der taler siger verbet, ikke
 * beløbet. Pile og prikker er dekoration. Tilbage står de ord et
 * menneske faktisk ville sige.
 */
function taleord(synligt) {
  return synligt
    .toLowerCase()
    .split(/\s+/)
    .filter((o) => /[a-zæøåäöü]/.test(o.replace(/[.,:;!?—–·→]/g, "")))
    .map((o) => o.replace(/[.,:;!?—–·→]+$/g, ""))
    .join(" ")
    .trim();
}

/**
 * Hver købsknap en kunde faktisk kan NÅ: hvad man ser, og hvad den hedder.
 *
 * Her stod også kridtets to reservationer og de seks depositum-knapper
 * (piercing × 4, flash-tid × 2). #304 (3/9) slettede de to Emerge-
 * shopsider, og siden da renderes `DepositumRaekke` af ingen side, mens
 * `KerbReservation` kun findes i `SceneV05`, som selv ligger på ingen
 * rute. Målte hegnet videre på dem, ville det være grønt for evigt om
 * strenge ingen læser — den værste slags hegn.
 *
 * De står nu i PENSIONERET i tests/naaelige-flader.test.mjs, som holder
 * de to filer mod hinanden i BEGGE retninger: kommer en flade tilbage
 * uden at den bliver målt her, går den prøve rød.
 */
function knapper(lang) {
  const c = t(lang);
  return [
    {
      hvor: "rummet.spotAria",
      synligt: "Hold en plads",
      navn: c.rummet.spotAria("Hold en plads", "300"),
    },
  ];
}

test("hver købsknap hedder det man kan læse på den (WCAG 2.5.3)", () => {
  const fund = [];
  let målte = 0;
  for (const lang of ["da", "en"]) {
    for (const k of knapper(lang)) {
      målte++;
      const ord = taleord(k.synligt);
      assert.ok(ord.length > 0, `${lang} ${k.hvor}: negativ kontrol — ingen taleord i «${k.synligt}»`);
      if (!k.navn.toLowerCase().includes(ord)) {
        fund.push(`${lang} ${k.hvor}: man læser «${k.synligt}», knappen hedder «${k.navn}»`);
      }
    }
  }
  assert.ok(målte >= 2, `negativ kontrol: målte kun ${målte} knapper`);
  assert.deepEqual(fund, [], "knapper man ikke kan sige:\n" + fund.join("\n"));
});

test("navnet BEGYNDER med det synlige ord — så det er første man hører", () => {
  // Det er ikke et krav i 2.5.3, men det er forskellen på en knap der
  // giver mening og en der skal høres til ende før man ved hvad den er.
  const fund = [];
  for (const lang of ["da", "en"]) {
    for (const k of knapper(lang)) {
      if (!k.navn.toLowerCase().startsWith(taleord(k.synligt))) {
        fund.push(`${lang} ${k.hvor}: «${k.navn}» begynder ikke med «${k.synligt}»`);
      }
    }
  }
  assert.deepEqual(fund, [], "navne der ikke begynder med knappens eget ord:\n" + fund.join("\n"));
});

test("navnet siger stadig hvad beløbet ER — et depositum, ikke prisen", () => {
  // Uden det ord er «100 kroner» en pris, og så tror kunden hun har
  // betalt for lidt. Rails §4: sitet må ikke love noget forkert.
  for (const lang of ["da", "en"]) {
    const ord = lang === "da" ? /depositum/i : /deposit/i;
    for (const k of knapper(lang)) {
      assert.match(k.navn, ord, `${lang} ${k.hvor}: navnet siger ikke at beløbet er et depositum`);
    }
  }
});

test("knapperne henter navnet i ordbogen, ikke i markup", () => {
  // Ellers kan de to sprog skride fra hinanden uden at hegnet ser det:
  // det måler ordbogen, så ordbogen skal være kilden.
  assert.match(read("components/rummet/NattenFlade.tsx"), /aria-label=\{c\.spotAria\(/);
  // De pensionerede flader måles ikke her, men deres navne SKAL blive ved
  // at være rigtige, så de virker den dag de kommer tilbage. Kildekoden
  // hegnes derfor stadig — uden at love at knappen findes.
  assert.match(read("components/emerge/KerbReservation.tsx"), /aria-label=\{c\.ariaSlots\[/);
  assert.match(read("components/emerge/DepositumRaekke.tsx"), /aria-label=\{aria\(ariaSted\[v\.id\] \?\? navn, kr\(v\.kr\)\)\}/);
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  assert.equal(taleord("Hold plads 100,-"), "hold plads");
  assert.equal(taleord("Send linket i WhatsApp →"), "send linket i whatsapp");
  assert.equal(taleord("Hele dagen 1.000,-"), "hele dagen");
  // Den gamle, forkerte form skal falde igennem — ellers måler hegnet intet.
  assert.ok(!"Reservér piercing i øret med 100 kroner i depositum".toLowerCase().includes(taleord("Hold plads 100,-")));
  // Og den nye skal bestå.
  assert.ok("Hold plads — piercing i øret, 100 kroner i depositum".toLowerCase().includes(taleord("Hold plads 100,-")));
});
