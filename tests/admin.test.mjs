import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * `/admin` er død (Sirius, CMS-RULING-01, 31/8).
 *
 * Denne fil vogtede før at Decap-fladen VIRKEDE. Nu vogter den det modsatte:
 * at der ikke ligger CMS-bytes på kundesitet, og at adressen svarer 410.
 *
 * Grunden til at det er en prøve og ikke bare en sletning: en 5,1 MB
 * eval-kapabel app og et GitHub-OAuth-indgangspunkt på kundens origin er
 * nemme at få tilbage ved et uheld — et `npm run build` af et gammelt
 * værktøj, en gendannet mappe, en kopieret opsætning. Grænsen skal have en
 * vagt, ikke en hukommelse.
 */

test("der ligger ingen CMS-bytes under public/", () => {
  assert.equal(existsSync(join(root, "public/admin")), false,
    "public/admin er tilbage — 5,1 MB eval-kapabel JS på kundens origin");

  // Bredere end mappenavnet: en CMS-bundle må ikke ligge NOGET sted under
  // public/, uanset hvad nogen kalder mappen.
  const fundne = [];
  const gaa = (dir, sti = "") => {
    for (const navn of readdirSync(dir)) {
      const p = join(dir, navn);
      if (statSync(p).isDirectory()) gaa(p, `${sti}/${navn}`);
      else if (/decap|netlify-cms|sveltia/i.test(navn)) fundne.push(`${sti}/${navn}`);
    }
  };
  gaa(join(root, "public"));
  assert.deepEqual(fundne, [], "en CMS-bundle er sluppet ind under public/");
});

test("/admin svarer 410 — væk med vilje, ikke en tastefejl", () => {
  const rute = join(root, "app/admin/[[...slug]]/route.ts");
  assert.ok(existsSync(rute), "der er ingen rute til at svare på /admin");
  const src = readFileSync(rute, "utf8");

  // 410 og ikke 404: adressen HAR eksisteret. Et 404 ville sige «findes
  // ikke», hvilket er forkert — og en crawler ville blive ved med at prøve.
  assert.match(src, /status: 410/);
  assert.doesNotMatch(src, /status: 404/);
  assert.match(src, /export function GET/);
  assert.match(src, /export function HEAD/, "HEAD skal svare det samme som GET");
});

test("kontrakten overlevede fladen", () => {
  // Listen over hvad et menneske skal kunne rette er stadig sand; kun
  // redigeringsfladen skiftede. Slettes den her uden en Shopify-kontrakt i
  // stedet, mister huset sin eneste beskrivelse af hvad der ER indhold.
  const kontrakt = join(root, "docs/cms/indholds-kontrakt.yml");
  assert.ok(existsSync(kontrakt), "indholds-kontrakten er væk");
  const src = readFileSync(kontrakt, "utf8");
  assert.match(src, /HUSETS INDHOLDS-KONTRAKT/);
  assert.match(src, /HOUSE-CMS-01/, "der står ikke hvad der afløser den");
});
