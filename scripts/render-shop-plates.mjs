#!/usr/bin/env node
/**
 * Rene, mørke produktplader fra Emerge-SVG. Haruki leverer den endelige
 * render — det her er arbejdplader så drafts kan gøres klar.
 *
 *   node scripts/render-shop-plates.mjs
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/emerge/shop");
mkdirSync(outDir, { recursive: true });

const SIZE = 1200;

function mulberry32(a) {
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starfield(seed) {
  const rand = mulberry32(seed);
  let dots = "";
  for (let i = 0; i < 420; i++) {
    const x = (rand() * SIZE).toFixed(1);
    const y = (rand() * SIZE).toFixed(1);
    const r = (0.35 + rand() * 1.15).toFixed(2);
    const o = (0.12 + rand() * 0.45).toFixed(2);
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ddd2bf" opacity="${o}"/>`;
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">${dots}</svg>`,
  );
}

const jobs = [
  { svg: "public/emerge/v05/dagger.svg", out: "dolk.png", height: 760, seed: 3 },
  { svg: "public/emerge/v05/ouroboros.svg", out: "ouroboros.png", height: 640, seed: 23 },
  { svg: "public/emerge/shop/signet.svg", out: "signetring.png", height: 680, seed: 61 },
];

for (const job of jobs) {
  const motif = await sharp(join(root, job.svg))
    .resize({ height: job.height, withoutEnlargement: false })
    .png()
    .toBuffer();
  const stars = await sharp(starfield(job.seed)).png().toBuffer();
  const dest = join(outDir, job.out);
  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: { r: 10, g: 10, b: 10 },
    },
  })
    .composite([
      { input: stars, blend: "over" },
      { input: motif, gravity: "centre" },
    ])
    .png()
    .toFile(dest);
  console.log("plate", job.out);
}

writeFileSync(join(outDir, "README.txt"), "Working plates. Haruki replaces these with rendered files.\n");
