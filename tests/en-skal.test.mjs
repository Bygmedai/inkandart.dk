import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Den engelske flade taler engelsk — hele vejen ned, ikke kun i indholdet.
 *
 * S574 rettede skallen så nav og footer fulgte siden (Sirius' fund #5).
 * Fem prøver hegnede det — på fem UDVALGTE sider. Fuld QA 3/9 renderede
 * alle 51 ruter og fandt den sjette: `/en/samtykke` kaldte `RummetShell`
 * uden `lang`, så en engelsk kunde mødte «Gå til indhold», dansk nav,
 * dansk dør og «Du kan afmelde når som helst» — på samtykkesiden, midt i
 * det mest følsomme skridt i hele rejsen.
 *
 * Et hegn der nævner sine sider ved navn kan aldrig fange den syvende.
 * Dette hegn TÆLLER dem: det finder selv hver komponent der tager `lang`,
 * og hver side under app/(en), og kræver at parret er komplet. En ny
 * EN-side eller en ny sprogbærende komponent er dermed dækket den dag den
 * skrives — ikke den dag nogen husker at tilføje den her.
 */

const root = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const uden = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/**
 * Hver komponent hvis `lang` DEFAULTER TIL DANSK. Fundet, ikke listet.
 *
 * Det er den præcise fejlklasse. `Bio` tager også et sprog, men uden
 * default: udelader man det, arver teksten siden, og det er rigtigt.
 * `RummetShell` defaulter til dansk: udelader man det, bliver en engelsk
 * side dansk i skallen — lydløst, uden en fejl nogen kan se i koden.
 * Kun den slags skal kræve et eksplicit sprog.
 */
function komponenterDerDefaulterTilDansk() {
  const filer = readdirSync(join(root, "components"), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".tsx"));
  const navne = new Map();
  for (const f of filer) {
    const src = uden(read(join("components", f)));
    for (const m of src.matchAll(/export function (\w+)\(\{([\s\S]*?)\}[^{]*\{/g)) {
      if (/\blang = (?:DEFAULT_LOCALE|"da")/.test(m[2])) navne.set(m[1], join("components", f));
    }
  }
  return navne;
}

/** Hver side under app/(en) — også dem ingen har skrevet endnu. */
function enSider() {
  return readdirSync(join(root, "app/(en)"), { recursive: true })
    .map((f) => join("app/(en)", String(f)))
    .filter((f) => f.endsWith("page.tsx"));
}

test("en komponent der defaulter til dansk får altid et sprog på en /en-side", () => {
  const komponenter = komponenterDerDefaulterTilDansk();
  assert.ok(komponenter.size >= 10, `negativ kontrol: fandt kun ${komponenter.size} komponenter der defaulter til dansk`);
  assert.ok(komponenter.has("RummetShell"), "negativ kontrol: fandt ikke skallen");
  assert.ok(!komponenter.has("Bio"), "Bio arver siden — den skal ikke kræve et sprog");

  const sider = enSider();
  assert.ok(sider.length >= 15, `negativ kontrol: fandt kun ${sider.length} EN-sider`);

  const fund = [];
  let målte = 0;
  for (const side of sider) {
    const src = uden(read(side));
    for (const navn of komponenter.keys()) {
      // Hver brug af komponenten, bundet til sin egen tag-åbning: `<Navn`
      // frem til `>` — så en nabo-komponents lang ikke kan tælle med.
      for (const m of src.matchAll(new RegExp(`<${navn}(?![A-Za-z])([^>]*)>`, "g"))) {
        målte++;
        // «lang="da"» er tilladt og rigtigt: det MARKERER et dansk
        // afsnit på en engelsk side, så en skærmlæser skifter stemme
        // (WCAG 3.1.2). Fejlen er det UDELADTE sprog, som lydløst bliver
        // dansk uden at nogen har besluttet det.
        if (!/\blang=/.test(m[1])) {
          fund.push(`${side}: <${navn}${m[1].replace(/\s+/g, " ").slice(0, 40)}> mangler lang`);
        }
      }
    }
  }
  assert.ok(målte >= 20, `negativ kontrol: målte kun ${målte} brug`);
  assert.deepEqual(fund, [], "dansk skal på en engelsk side:\n" + fund.join("\n"));
});

test("samtykkesiden er engelsk hele vejen — den side hvor sproget betyder mest", () => {
  const side = read("app/(en)/(rummet)/en/samtykke/page.tsx");
  assert.match(side, /<RummetShell lang="en">/, "skallen skal tale engelsk");
  assert.match(side, /<SamtykkeFlade[^>]*lang="en"/, "indholdet skal tale engelsk");
  assert.match(side, /betingelserHref="\/en\/betingelser"/, "samtykket må ikke sende til de danske betingelser");
});

test("engelske YAML-felter bærer ikke husets ord", () => {
  const HUSETS_ORD = ["Stolen", "Mærket", "Hylden", "Væggen", "Natten", "Gaden", "Blackbook", "Huset", "Nattespot", "The house"];
  // Personalets egne sider bag husets kode må gerne sige Huset — det er
  // deres ord om deres arbejdsplads. Kundens flade må ikke (S579).
  const PERSONALETS = ["teamguide.en.yml", "gulvet.en.yml", "afstemning.en.yml"];
  const enYaml = readdirSync(join(root, "content"))
    .filter((f) => f.endsWith(".en.yml") && !PERSONALETS.includes(f));
  assert.ok(enYaml.length >= 5, `negativ kontrol: fandt kun ${enYaml.length} engelske YAML-filer`);
  const fund = [];
  for (const f of enYaml) {
    const udenKommentarer = read(join("content", f)).replace(/^\s*#.*$/gm, "");
    for (const ord of HUSETS_ORD) {
      const re = new RegExp(`(^|[^\\p{L}/\\-_])${ord}(?![\\p{L}\\-_])`, "mu");
      if (re.test(udenKommentarer)) fund.push(`${f}: «${ord}»`);
    }
  }
  assert.deepEqual(fund, [], "husets ord i engelsk indhold:\n" + fund.join("\n"));
});

test("negativ kontrol: hegnet kan blive rødt", () => {
  // Et hegn der ikke kan fejle måler ingenting. Her er formen det leder
  // efter, uden at røre træet: en skal uden sprog, og en med.
  const mangler = (src) =>
    [...src.matchAll(/<RummetShell(?![A-Za-z])([^>]*)>/g)].filter((m) => !/\blang=/.test(m[1])).length;
  assert.equal(mangler("<RummetShell>\n  <X lang=\"en\" />\n</RummetShell>"), 1, "en skal uden sprog skal ses");
  assert.equal(mangler('<RummetShell lang="en">'), 0, "en engelsk skal må ikke råbes op om");
  assert.equal(mangler('<RummetShell lang="da">'), 0, "et markeret dansk afsnit er ikke fejlen");
  // Og navnet skal bindes til sin egen tag-åbning, ikke til naboens.
  assert.equal(mangler('<RummetShellV2 lang="en"><RummetShell>'), 1, "et længere navn må ikke tælle som skallen");
});
