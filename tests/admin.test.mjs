import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "public/admin/index.html"), "utf8");

/**
 * Decap-fladen på /admin — den eneste vej et menneske uden kode har ind
 * i indholdet.
 *
 * Fejlen den her vogter mod, er målt i produktion 31/8: Next svarer 308 fra
 * /admin/ til /admin, og fra /admin peger «./» på roden. En relativ
 * script-sti blev derfor hentet som /decap-cms.js — 404, blank skærm.
 *
 * Det lumske er at HTML'en svarer 200 hele vejen igennem. En statuskode på
 * /admin måler at filen bliver leveret, ikke at siden virker.
 */

test("intet på /admin hentes relativt", () => {
  // Negativ kontrol først: findes «./» overhovedet, er resten ligegyldigt.
  assert.doesNotMatch(
    html,
    /(?:src|href)="\.\//,
    "relativ sti på /admin — den opløses mod roden, ikke mod /admin/",
  );

  const stier = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(stier.length >= 2, "hverken script eller config peges der på");

  for (const sti of stier) {
    if (/^https?:\/\//.test(sti)) continue; // eksterne må gerne være absolutte URL'er
    assert.ok(
      sti.startsWith("/admin/"),
      `${sti} ligger ikke under /admin/ — den findes ikke fra /admin`,
    );
    assert.ok(
      existsSync(join(root, "public", sti)),
      `${sti} peges der på, men filen findes ikke i public/`,
    );
  }
});

test("config'en peges der eksplicit på", () => {
  // Uden denne linje henter Decap selv «config.yml» relativt til siden,
  // altså /config.yml — 404. Script-stien alene er ikke nok: målt 31/8 giver
  // det «Error loading the CMS configuration» i stedet for en blank skærm.
  assert.match(
    html,
    /rel="cms-config-url"/,
    "ingen cms-config-url — Decap gætter selv, og gætter forkert på /admin",
  );
  assert.match(html, /href="\/admin\/config\.yml"/);
});
