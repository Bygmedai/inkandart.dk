#!/usr/bin/env node
/**
 * F3 (Haruki-review S566): prægenererer WebP-varianter (480w/960w) af de
 * rasterbilleder SceneV05 refererer, til srcset. Ingen runtime-afhængighed —
 * kør ved asset-ændring og commit outputtet:  node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scene = readFileSync(join(root, "components/emerge/SceneV05.tsx"), "utf8");
const jpgs = [...new Set([...scene.matchAll(/src="(\/[^"]+\.jpg)"/g)].map((m) => m[1]))];
const WIDTHS = [480, 960];

for (const rel of jpgs) {
  const src = join(root, "public", rel);
  for (const w of WIDTHS) {
    const out = join(root, "public/optimized", rel.replace(/\.jpg$/, `-${w}.webp`));
    mkdirSync(dirname(out), { recursive: true });
    const img = sharp(src);
    const meta = await img.metadata();
    await img
      .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(out);
    console.log(rel, "→", out.replace(root + "/", ""));
  }
}
