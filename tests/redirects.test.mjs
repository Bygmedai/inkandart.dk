import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const redirectsSrc = readFileSync(join(root, "lib/redirects.ts"), "utf8");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");

/**
 * Læs hele det objekt-literal der omslutter en position — begge veje fra
 * fundet, bundet af objektets egne krøllede parenteser.
 *
 * Et vidne der kun kigger fremad kan snydes af feltrækkefølgen (QA #167).
 * Samme lektion som ruleBody() i reservation.test.mjs: bind udsnittet til
 * strukturen, ikke til et gæt på hvor mange tegn der er nok.
 */
function enclosingObject(src, index) {
  let start = -1;
  let depth = 0;
  for (let i = index; i >= 0; i--) {
    if (src[i] === "}") depth++;
    else if (src[i] === "{") {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  assert.notEqual(start, -1, "ingen omsluttende objekt-literal fundet");
  depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error("objekt-literalet lukker aldrig");
}

test("next.config uses the explicit redirect matrix", () => {
  assert.match(nextConfig, /nextRedirects/);
  assert.doesNotMatch(nextConfig, /\/en\/:path\*/);
  assert.doesNotMatch(nextConfig, /\/en\/\*/);
});

test("matrix covers the retired 11ty routes", () => {
  const required = [
    "/artister/",
    "/artister/nizar/",
    "/find-din-tatovering/",
    "/del-din-ide/",
    "/en/privacy/",
    "/en/aftercare/",
    "/en/walk-in/",
    "/en/artists/",
    "/en/flash/",
    "/en/find-your-tattoo/",
    "/en/share-your-idea/",
  ];
  for (const from of required) {
    assert.match(redirectsSrc, new RegExp(from.replace(/[.*]/g, "\\$&")));
  }
});

test("Danish walk-in is a live page, not a 308 to the chair", () => {
  assert.doesNotMatch(redirectsSrc, /slashPair\("\/walk-in"/);
  assert.doesNotMatch(redirectsSrc, /from: "\/walk-in\/", to: "\/#booking"/);
});

test("named artist keeps its own anchor", () => {
  assert.match(redirectsSrc, /\/artister\/nizar\/", to: "\/#artist-nizar"/);
});

test("all next redirects are 308", () => {
  const codes = [...redirectsSrc.matchAll(/statusCode:\s*(\d+)/g)].map((m) => m[1]);
  assert.ok(codes.length > 0);
  for (const code of codes) assert.equal(code, "308");
});

test("no English catch-all onto the Danish home", () => {
  assert.doesNotMatch(redirectsSrc, /\/en\/:path\*/);
  assert.doesNotMatch(redirectsSrc, /source:\s*"\/en\/:\w+\*"/);
});

test("every fragment destination points at an anchor that actually exists", () => {
  // F1 (Haruki-review S566): matrixen pegede på /#artists og /#artist-nizar,
  // men scenen bar kun id="artist" — 6 af 17 rækker landede stille på toppen.
  // Dette vidne læser BEGGE sider af kontrakten, så drift fanges i CI.
  const fragments = [...redirectsSrc.matchAll(/to: "\/#([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.ok(fragments.length >= 4, "matrixen skal bære fragment-destinationer");
  const surfaces = [
    readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8"),
    readFileSync(join(root, "app/page.tsx"), "utf8"),
  ].join("\n");
  for (const id of new Set(fragments)) {
    assert.match(surfaces, new RegExp(`id="${id}"`), `anker #${id} findes ikke i scenen`);
  }
});

test("negativ kontrol: et opdigtet anker ville blive fanget", () => {
  const surfaces = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
  assert.doesNotMatch(surfaces, /id="findes-ikke-anker"/);
});

test("shop.inkandart.dk sendes til kataloget — host-gated 308 (vej B, S568)", () => {
  const m = redirectsSrc.match(
    /source:\s*"\/:path\*",\s*has:\s*\[\{\s*type:\s*"host",\s*value:\s*"shop\.inkandart\.dk"\s*\}\],\s*destination:\s*"https:\/\/inkandart\.dk\/shop",\s*statusCode:\s*308/
  );
  assert.ok(m, "host-reglen mangler eller er skilt fra sin host-vagt");
  assert.match(nextConfig, /hostRedirects/);
});

test("HOST_MIGRATION er et kontrolleret audit-spor, ikke pynt", () => {
  // ROUTE_MIGRATION og HOST_MIGRATION er dokumentation af hvad vi flyttede og
  // hvorfor — de importeres ingen steder. QA på #167 kaldte det med rette en
  // dead export. Svaret er ikke at slette sporet, men at gøre det bærende:
  // hver dokumenteret host-flytning SKAL svare til en regel der findes.
  // Skriver nogen en regel uden at dokumentere den (eller omvendt), går den rød.
  const rows = [...redirectsSrc.matchAll(
    /\{\s*from:\s*"([^"\/]+)\/:path\*",\s*to:\s*"([^"]+)",\s*reason:\s*"([^"]+)"/g
  )];
  assert.ok(rows.length >= 1, "HOST_MIGRATION skal beskrive mindst én flytning");
  for (const [, host, to, reason] of rows) {
    const rule = redirectsSrc.match(
      new RegExp(`value:\\s*"${host.replace(/\./g, "\\.")}"[\\s\\S]{0,160}?destination:\\s*"([^"]+)"`)
    );
    assert.ok(rule, `${host} er dokumenteret, men har ingen hostRedirect`);
    assert.equal(rule[1], to, `${host}: dokumentationen siger ${to}, reglen siger ${rule[1]}`);
    assert.ok(reason.length > 8, `${host}: begrundelsen skal kunne læses af et menneske`);
  }
});

test("enhver wildcard-source bærer sin egen host-vagt", () => {
  // En /:path*-redirect uden host-betingelse ville sende HELE hub'en til
  // /shop. Vidnet kræver at vagten står i SAMME OBJEKT som wildcarden.
  const hits = [...redirectsSrc.matchAll(/source:\s*"\/:path\*"/g)];
  assert.ok(hits.length >= 1, "host-reglen skal findes");
  for (const h of hits) {
    const obj = enclosingObject(redirectsSrc, h.index);
    assert.match(obj, /has:\s*\[\{\s*type:\s*"host"/, "wildcard-redirect uden host-vagt");
  }
});

test("negativ kontrol: vagt-vidnet er uafhængigt af feltrækkefølge", () => {
  // QA på #167: det gamle vidne slicede 220 tegn FREMAD fra `source:`. Skrev
  // nogen `has` FØR `source`, gled vagten ud af vinduet, og testen var stille
  // grøn mod en ubeskyttet wildcard. Et hegn der kun dækker den ene side er
  // ikke et hegn. enclosingObject() læser hele objektet — begge veje.
  const guardFirst = `[{ has: [{ type: "host", value: "x.dk" }], source: "/:path*", destination: "/y" }]`;
  const sourceFirst = `[{ source: "/:path*", has: [{ type: "host", value: "x.dk" }], destination: "/y" }]`;
  const unguarded = `[{ source: "/:path*", destination: "/y", statusCode: 308 }]`;
  const guard = /has:\s*\[\{\s*type:\s*"host"/;
  for (const [navn, src] of [["vagt først", guardFirst], ["source først", sourceFirst]]) {
    const i = src.indexOf('source: "/:path*"');
    assert.match(enclosingObject(src, i), guard, `${navn}: vagten skulle være fundet`);
  }
  const i = unguarded.indexOf('source: "/:path*"');
  assert.doesNotMatch(enclosingObject(unguarded, i), guard, "ubeskyttet wildcard skulle være fanget");
});
