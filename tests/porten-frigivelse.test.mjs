import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const { frigivelse, anvendFrigivelse, MAA_LAASE_OP, LAAST_STI_GRUND } = await import("../scripts/porten-frigivelse.mjs");

/**
 * Frigivelse af en laast sti. Acceptkriterium 3 i docs/accept/porten.md,
 * rettet 2/9 efter Steven: «Det giver jo ikke en mening at have en port
 * der aldrig kan blive groen.»
 */

const HEAD = "df77dc7d46ee83a1c69f838e8d01234f2241cbc8";
const GAMMEL = "0000000000000000000000000000000000000000";
const steven = { login: "stevenwensley-a11y", type: "User" };
const vilde = { login: "Vilde2026", type: "User" };
const haruki = { login: "bygmedai-haruki", type: "User" };
const review = (user, state, commit_id = HEAD, t = "2026-09-02T07:27:52Z") =>
  ({ user, state, commit_id, submitted_at: t });

test("en godkendelse fra en navngiven konto paa NETOP dette commit frigiver", () => {
  const r = frigivelse({ reviews: [review(steven, "APPROVED")], headSha: HEAD, forfatter: "Vilde2026" });
  assert.equal(r.frigivet, true);
  assert.equal(r.af, "stevenwensley-a11y");
});

test("fail-closed: hver manglende betingelse for sig giver NEJ", () => {
  const ok = { reviews: [review(steven, "APPROVED")], headSha: HEAD, forfatter: "Vilde2026" };
  // Positiv kontrol foerst — ellers beviser de negative ingenting.
  assert.equal(frigivelse(ok).frigivet, true);

  for (const [navn, k] of [
    ["godkendelse paa et AELDRE commit", { ...ok, reviews: [review(steven, "APPROVED", GAMMEL)] }],
    // Godkenderen er IKKE forfatteren her — ellers maaler sagen forfatter-
    // reglen og ikke listen. Mutation «allowlisten ignoreret» gik groen i
    // foerste udgave netop fordi Vilde2026 var begge dele.
    ["godkender staar ikke paa listen (og er ikke forfatteren)", { ...ok, reviews: [review(haruki, "APPROVED")] }],
    ["godkender staar ikke paa listen OG er forfatteren", { ...ok, reviews: [review(vilde, "APPROVED")] }],
    ["godkender er forfatteren selv", { ...ok, forfatter: "stevenwensley-a11y" }],
    ["godkender er en Bot-konto med rigtigt navn", { ...ok, reviews: [review({ ...steven, type: "Bot" }, "APPROVED")] }],
    ["CHANGES_REQUESTED er ikke godkendt", { ...ok, reviews: [review(steven, "CHANGES_REQUESTED")] }],
    ["COMMENTED er ikke godkendt", { ...ok, reviews: [review(steven, "COMMENTED")] }],
    ["DISMISSED er ikke godkendt", { ...ok, reviews: [review(steven, "DISMISSED")] }],
    ["ingen reviews", { ...ok, reviews: [] }],
    ["reviews mangler helt", { ...ok, reviews: undefined }],
    ["intet head-commit", { ...ok, headSha: "" }],
    ["tom allowliste", { ...ok, maaLaaseOp: [] }],
    ["tomt input", {}],
    ["undefined", undefined],
  ]) {
    const r = frigivelse(k);
    assert.equal(r.frigivet, false, `${navn}: frigav alligevel`);
    assert.equal(r.af, null, `${navn}: naevner en godkender uden at frigive`);
    assert.ok(r.grund, `${navn}: siger ikke hvorfor`);
  }
});

test("SENESTE review pr. konto taeller — raekkefoelgen i input er ligegyldig", () => {
  const foerst = "2026-09-02T07:00:00Z", saa = "2026-09-02T08:00:00Z";
  const k = { headSha: HEAD, forfatter: "Vilde2026" };

  // Godkendt, saa aendringer kraevet: NEJ — ogsaa naar listen kommer omvendt.
  const trukket = [review(steven, "APPROVED", HEAD, foerst), review(steven, "CHANGES_REQUESTED", HEAD, saa)];
  assert.equal(frigivelse({ ...k, reviews: trukket }).frigivet, false);
  assert.equal(frigivelse({ ...k, reviews: [...trukket].reverse() }).frigivet, false, "raekkefoelgen afgjorde dommen");

  // Aendringer kraevet, saa godkendt: JA — og igen uanset raekkefoelge.
  const givet = [review(steven, "CHANGES_REQUESTED", HEAD, foerst), review(steven, "APPROVED", HEAD, saa)];
  assert.equal(frigivelse({ ...k, reviews: givet }).frigivet, true);
  assert.equal(frigivelse({ ...k, reviews: [...givet].reverse() }).frigivet, true, "raekkefoelgen afgjorde dommen");

  // Godkendt paa gammelt commit, saa nyt push: NEJ, indtil hun godkender igen.
  const gammelSaaNy = [review(steven, "APPROVED", GAMMEL, foerst)];
  assert.equal(frigivelse({ ...k, reviews: gammelSaaNy }).frigivet, false);
  assert.equal(frigivelse({ ...k, reviews: [...gammelSaaNy, review(steven, "APPROVED", HEAD, saa)] }).frigivet, true);
});

test("login sammenlignes uden hensyn til store og smaa bogstaver — som GitHub goer", () => {
  const r = frigivelse({ reviews: [review({ login: "StevenWensley-A11Y", type: "User" }, "APPROVED")], headSha: HEAD, forfatter: "x" });
  assert.equal(r.frigivet, true);
});

test("allowlisten er kort, navngiven, og indeholder ingen agentkonto", () => {
  assert.ok(MAA_LAASE_OP.length >= 1 && MAA_LAASE_OP.length <= 3, "listen er ikke kort");
  for (const l of MAA_LAASE_OP) {
    for (const frag of ["claude", "haruki", "vilde", "grok", "[bot]", "renovate", "dependabot"]) {
      assert.ok(!l.toLowerCase().includes(frag), `agentkonto paa allowlisten: ${l}`);
    }
  }
});



test("anvendelsen fjerner KUN laast-sti-grunden — en roed check kan ingen godkendelse frigive", () => {
  const AABEN = "ÅBEN", SPAERRET = "SPÆRRET";
  const fri = { frigivet: true, af: "stevenwensley-a11y", grund: "" };
  const ramt = [".github/workflows/porten.yml"];
  const laast = "Rører 1 låst sti: .github/workflows/porten.yml. Kræver et menneskes merge — uanset forfatter.";
  const roed = "Påkrævet check «check» sluttede som «failure».";

  // Kun laast sti: frigivet => AABEN, og noten siger af hvem og paa hvilket commit.
  const a = anvendFrigivelse({ dom: SPAERRET, grunde: [laast], noter: [] }, { fri, ramt, headSha: HEAD, AABEN });
  assert.equal(a.dom, AABEN);
  assert.deepEqual(a.grunde, []);
  assert.match(a.noter.join("\n"), /frigivet: @stevenwensley-a11y godkendte df77dc7/);

  // Laast sti OG roed check: laast sti frigives, men dommen forbliver SPAERRET.
  const b = anvendFrigivelse({ dom: SPAERRET, grunde: [laast, roed], noter: [] }, { fri, ramt, headSha: HEAD, AABEN });
  assert.equal(b.dom, SPAERRET, "en godkendelse frigav en roed check");
  assert.deepEqual(b.grunde, [roed], "den roede check forsvandt fra grundene");

  // Ikke frigivet: intet fjernes, dommen staar, og noten siger hvordan man frigiver.
  const c = anvendFrigivelse({ dom: SPAERRET, grunde: [laast], noter: [] }, { fri: { frigivet: false, af: null, grund: "Ingen reviews." }, ramt, headSha: HEAD, AABEN });
  assert.equal(c.dom, SPAERRET);
  assert.deepEqual(c.grunde, [laast]);
  assert.match(c.noter.join("\n"), /frigives af en godkendelse på netop df77dc7/);

  // Ingen laast sti ramt: resultatet gaar uroert igennem — ogsaa med en «frigivelse».
  const d = anvendFrigivelse({ dom: SPAERRET, grunde: [roed], noter: [] }, { fri, ramt: [], headSha: HEAD, AABEN });
  assert.equal(d.dom, SPAERRET);
  assert.deepEqual(d.grunde, [roed]);
  assert.deepEqual(d.noter, []);

  // Input roeres ikke.
  const ind = { dom: SPAERRET, grunde: [laast], noter: [] };
  anvendFrigivelse(ind, { fri, ramt, headSha: HEAD, AABEN });
  assert.deepEqual(ind, { dom: SPAERRET, grunde: [laast], noter: [] }, "anvendelsen aendrede sit input");

  // Og moensteret er det samme som workflowet og dommeren deler.
  assert.ok(LAAST_STI_GRUND.test(laast));
  assert.ok(!LAAST_STI_GRUND.test(roed));
});

test("dommerens laast-sti-grund har stadig den ordlyd workflowet genkender", async () => {
  // Dommeren rulles ud af installeren. Aendrer nogen ordlyden dér, skal
  // dette gaa roedt her — ellers frigiver workflowet stille ingenting.
  const { porten } = await import("../.porten/porten.mjs");
  const r = porten({
    paakraevede: ["check"],
    checks: [{ navn: "check", status: "completed", konklusion: "success" }],
    filer: [".github/workflows/porten.yml"],
    forfatterErAgent: true,
  });
  const grund = r.grunde.find((g) => LAAST_STI_GRUND.test(g));
  assert.ok(grund, `dommerens laast-sti-grund har aendret ordlyd: ${JSON.stringify(r.grunde)}`);
});
