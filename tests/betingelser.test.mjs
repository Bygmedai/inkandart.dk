import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (p) => parse(readFileSync(join(root, p), "utf8"));

const da = load("content/betingelser.yml").sektioner;
const en = load("content/betingelser.en.yml").sektioner;

/**
 * Betingelserne staar to steder paa to sprog. De maa aldrig sige forskellige
 * ting — det var praecis den drift som samtykkeformularen afsloerede: husets
 * egne betingelser og Simones formular sagde to ting om det samme ansvar.
 */

test("de to sprog har lige mange afsnit, i samme raekkefoelge", () => {
  assert.equal(da.length, en.length);
});

test("hvert afsnit har en overskrift og en tekst", () => {
  for (const s of [...da, ...en]) {
    assert.ok(s.overskrift && s.overskrift.trim(), "afsnit uden overskrift");
    assert.ok(s.tekst && s.tekst.trim().length > 40, `for kort: ${s.overskrift}`);
  }
});

test("ansvaret er delt og staar begge sprog", () => {
  const d = da.find((s) => s.overskrift === "Hvem der står for hvad");
  const e = en.find((s) => s.overskrift === "Who is responsible for what");
  assert.ok(d && e, "ansvarsafsnittet mangler paa et sprog");
  // Vi staar ved arbejdet OG siger hvor kundens del begynder. Falder den ene
  // halvdel ud, er det ikke laengere en deling.
  assert.match(d.tekst, /hygiejnen/);
  assert.match(d.tekst, /aftercare/);
  assert.match(e.tekst, /hygiene/);
  assert.match(e.tekst, /aftercare/);
});

test("betingelserne peger paa samtykkeerklaeringen, begge sprog", () => {
  for (const liste of [da, en]) {
    const alt = liste.map((s) => s.tekst).join(" ");
    assert.match(alt, /inkandart\.dk\/samtykke/, "ingen doer til erklaeringen");
  }
});

test("fotosamtykket er et selvstaendigt ja der kan trrekkes tilbage", () => {
  const d = da.find((s) => s.overskrift === "Billeder");
  const e = en.find((s) => s.overskrift === "Photos");
  assert.match(d.tekst, /samtykkeerklæringen/);
  assert.match(d.tekst, /trække det tilbage/);
  assert.match(e.tekst, /consent form/);
  assert.match(e.tekst, /withdraw/);
});

test("risikoen staar der — permanent, allergi, infektion", () => {
  const d = da.find((s) => s.overskrift === "Hvad du siger ja til");
  assert.ok(d, "risikoafsnittet mangler");
  for (const ord of [/permanent/i, /[Aa]llergi/, /[Ii]nfektion/]) {
    assert.match(d.tekst, ord);
  }
});
