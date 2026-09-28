// Billederne i telefonstørrelse — docs/accept/billeder-mobil.md.
//
// Tre ting skal holde:
//   1. Et foto på en af husets sider går gennem foto() (punkt 5). Ellers får
//      telefonen skrivebordsfilen, og ingen test ville opdage det.
//   2. Mangler mobilversionen, vises originalen (punkt 7). Et srcset med en
//      fil der svarer 404, giver et brudt billede — browseren falder ikke
//      tilbage til src.
//   3. Varianterne forstørrer aldrig, og en lille original får en version i
//      sin egen bredde (punkt 3: aldrig mere sløret end i dag).
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { foto, variantSti } from "../lib/foto.ts";
import { bredderFor, lavFotovarianter } from "../lib/fotovarianter.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------- hegnet

/**
 * Husets egne flader. Groks og Vildes (Gift*, Walkin*, /flash, /gavekort)
 * er ikke med — de er deres lanes, og hegnet må ikke gå rødt i deres PR'er.
 */
function husetsFiler() {
  const ud = [];
  const gaa = (mappe) => {
    for (const e of readdirSync(join(root, mappe), { withFileTypes: true })) {
      const sti = join(mappe, e.name);
      if (e.isDirectory()) gaa(sti);
      else if (e.name.endsWith(".tsx")) ud.push(sti);
    }
  };
  gaa("components/rummet");
  gaa("app/(da)/(rummet)");
  gaa("app/(en)/(rummet)");
  return ud;
}

/**
 * Ikke kundefotos: seglet og logoet er SVG, og Chateau er en anden adresse
 * med sin egen opsætning (uden for købet i acceptkriterierne).
 */
const UNDTAGET = new Set([
  "components/rummet/Segl.tsx",
  "components/rummet/Nav.tsx",
  "components/rummet/ChateauHero.tsx",
  "components/rummet/ChateauCollabFlade.tsx",
]);

/** Alle <img …>-elementer i en kildefil, med linjenummer. */
export function imgTags(kilde) {
  const ud = [];
  const re = /<img\b/g;
  let m;
  while ((m = re.exec(kilde))) {
    let dybde = 0;
    let i = m.index;
    for (; i < kilde.length; i++) {
      const c = kilde[i];
      if (c === "{") dybde++;
      else if (c === "}") dybde--;
      else if (c === ">" && dybde === 0) break;
    }
    ud.push({
      tag: kilde.slice(m.index, i + 1),
      linje: kilde.slice(0, m.index).split("\n").length,
    });
  }
  return ud;
}

export function udenMobilversion(kilde) {
  return imgTags(kilde).filter(
    ({ tag }) =>
      !/\{\.\.\.(foto|fotoProps)\(/.test(tag) && !/\bsrc="[^"]+\.svg"/.test(tag),
  );
}

test("hegnet kan se forskel — negativ kontrol", () => {
  // Uden en kontrol der SKAL fejle, beviser et grønt hegn ingenting.
  assert.equal(udenMobilversion(`<img src={artist.foto} alt={alt} />`).length, 1);
  assert.equal(
    udenMobilversion(`<img\n  src={f.fil}\n  style={{ objectPosition: f.fokus }}\n/>`).length,
    1,
  );
  assert.equal(udenMobilversion(`<img {...foto(a.foto, "100vw")} alt={alt} />`).length, 0);
  assert.equal(udenMobilversion(`<img src="/brand/logo-segl.svg" alt="" />`).length, 0);
});

test("hvert foto på husets sider har en mobilversion (punkt 5)", () => {
  const fund = [];
  for (const fil of husetsFiler()) {
    const rel = relative(root, join(root, fil));
    if (UNDTAGET.has(rel)) continue;
    for (const { linje } of udenMobilversion(readFileSync(join(root, fil), "utf8"))) {
      fund.push(`${rel}:${linje}`);
    }
  }
  assert.deepEqual(
    fund,
    [],
    `Foto uden mobilversion — brug {...foto(src, sizes)} fra lib/foto.ts:\n  ${fund.join("\n  ")}`,
  );
});

// ---------------------------------------------------------------- foto()

test("foto(): kendt billede får srcset med præcis de bredder der findes", () => {
  const m = { "/slots/S-02.jpg": [480, 800, 1200, 1600] };
  const p = foto("/slots/S-02.jpg", "100vw", m);
  assert.equal(p.src, "/slots/S-02.jpg");
  assert.equal(
    p.srcSet,
    "/_v/slots/S-02-480.webp 480w, /_v/slots/S-02-800.webp 800w, /_v/slots/S-02-1200.webp 1200w, /_v/slots/S-02-1600.webp 1600w",
  );
  assert.equal(p.sizes, "100vw");
});

test("foto(): intet manifest eller ukendt billede giver originalen (punkt 7)", () => {
  assert.deepEqual(foto("/slots/S-02.jpg", "100vw", null), { src: "/slots/S-02.jpg" });
  assert.deepEqual(foto("/slots/ny.jpg", "100vw", { "/slots/S-02.jpg": [480] }), {
    src: "/slots/ny.jpg",
  });
  assert.deepEqual(foto("", "100vw", { "": [480] }), { src: "" });
});

test("variantSti: png og jpg lander som webp i /_v", () => {
  assert.equal(variantSti("/emerge/shop/dolk.png", 480), "/_v/emerge/shop/dolk-480.webp");
  assert.equal(variantSti("/slots/G-02.jpg", 1600), "/_v/slots/G-02-1600.webp");
});

// ---------------------------------------------------------------- varianterne

test("bredderFor: aldrig forstørre, og en lille original får sin egen bredde", () => {
  assert.deepEqual(bredderFor(2856), [480, 800, 1200, 1600]);
  assert.deepEqual(bredderFor(1600), [480, 800, 1200, 1600]);
  assert.deepEqual(bredderFor(1000), [480, 800, 1000]);
  assert.deepEqual(bredderFor(300), [300]);
});

test("lavFotovarianter skriver filerne og et manifest der passer til dem", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "fotovarianter-"));
  try {
    mkdirSync(join(tmp, "public/slots"), { recursive: true });
    mkdirSync(join(tmp, "public/brand"), { recursive: true });
    const flade = (w, h) =>
      sharp({ create: { width: w, height: h, channels: 3, background: "#8a8580" } });
    await flade(1000, 1250).jpeg().toFile(join(tmp, "public/slots/lille.jpg"));
    await flade(2000, 1000).jpeg().toFile(join(tmp, "public/slots/stor.jpg"));
    await flade(64, 64).png().toFile(join(tmp, "public/brand/logo.png"));
    await flade(64, 64).png().toFile(join(tmp, "public/favicon-32.png"));

    const r = await lavFotovarianter(tmp);
    const manifest = JSON.parse(readFileSync(join(tmp, "public/_v/manifest.json"), "utf8"));

    assert.deepEqual(manifest, {
      "/slots/lille.jpg": [480, 800, 1000],
      "/slots/stor.jpg": [480, 800, 1200, 1600],
    });
    assert.equal(r.fotos, 2);
    for (const [src, bredder] of Object.entries(manifest)) {
      for (const w of bredder) {
        const meta = await sharp(join(tmp, "public", variantSti(src, w))).metadata();
        assert.equal(meta.format, "webp");
        assert.equal(meta.width, w, `${src} @ ${w}`);
      }
    }

    // Anden kørsel laver intet om, når intet er ændret.
    assert.equal((await lavFotovarianter(tmp)).filer, 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("next.config laver varianterne ved hver build (punkt 4)", () => {
  // vercel.json kører `next build` direkte. Et npm-`prebuild` ville aldrig
  // køre i produktion; derfor skal det ske i selve konfigurationen.
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  assert.equal(vercel.buildCommand, "next build");
  const cfg = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(cfg, /PHASE_PRODUCTION_BUILD/);
  assert.match(cfg, /lavFotovarianter\(/);
  assert.match(cfg, /outputFileTracingIncludes[\s\S]*public\/_v\/manifest\.json/);
});
