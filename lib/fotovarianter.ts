import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import sharp from "sharp";

/**
 * Laver mobilversionerne af sitets fotos (accept: docs/accept/billeder-mobil.md).
 *
 * Kører i next.config.ts ved hver `next build` — også på Vercel, hvis
 * buildCommand er `next build` og ikke `npm run build`. Derfor ikke et
 * npm-script: et foto der kommer ind i en PR, skal have sin mobilversion ved
 * udrulningen, uden at nogen skal huske at køre noget.
 *
 * Reglerne:
 *   · Aldrig forstørre. En bredde over originalens springes over.
 *   · Er originalen smallere end den største bredde, laves også en version i
 *     originalens egen bredde. Ellers ville en stor skærm få en mindre fil
 *     end i dag, og billedet ville blive sløret.
 *   · Manifestet skrives til sidst og nævner kun filer der faktisk blev
 *     skrevet. lib/foto.ts stoler på det.
 */

export const BREDDER = [480, 800, 1200, 1600] as const;
const KVALITET = 72;
const RASTER = /\.(jpe?g|png)$/i;

/** Mapper under public/ der ikke er kundefotos, eller allerede er output. */
const SPRING_OVER = new Set(["_v", "optimized", "brand", "fonts"]);

async function* fotos(mappe: string, rod: string): AsyncGenerator<string> {
  for (const e of await readdir(mappe, { withFileTypes: true })) {
    const sti = join(mappe, e.name);
    if (e.isDirectory()) {
      if (mappe === rod && SPRING_OVER.has(e.name)) continue;
      yield* fotos(sti, rod);
    } else if (RASTER.test(e.name) && mappe !== rod) {
      // Filer direkte i public/ er favicon og OG-billeder, ikke sidefotos.
      yield sti;
    }
  }
}

export function bredderFor(original: number): number[] {
  const max = BREDDER[BREDDER.length - 1];
  if (original > max) return [...BREDDER];
  return [...BREDDER.filter((w) => w < original), original];
}

export async function lavFotovarianter(
  projekt: string = process.cwd(),
): Promise<{ fotos: number; filer: number; ms: number }> {
  const start = Date.now();
  const pub = join(projekt, "public");
  const ud = join(pub, "_v");
  const manifest: Record<string, number[]> = {};
  let filer = 0;

  for await (const kilde of fotos(pub, pub)) {
    const url = "/" + relative(pub, kilde).split(sep).join("/");
    const meta = await sharp(kilde).metadata();
    // EXIF 5–8 er drejet 90°: det browseren viser som bredde, er filens højde.
    const width = (meta.orientation ?? 1) >= 5 ? meta.height : meta.width;
    if (!width) continue;
    const kildeTid = (await stat(kilde)).mtimeMs;
    const bredder = bredderFor(width);
    for (const w of bredder) {
      const mål = join(ud, url.replace(RASTER, "") + `-${w}.webp`);
      const findes = await stat(mål).then((s) => s.mtimeMs >= kildeTid, () => false);
      if (!findes) {
        await mkdir(dirname(mål), { recursive: true });
        await sharp(kilde)
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: KVALITET })
          .toFile(mål);
        filer++;
      }
    }
    manifest[url] = bredder;
  }

  await mkdir(ud, { recursive: true });
  await writeFile(join(ud, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
  return { fotos: Object.keys(manifest).length, filer, ms: Date.now() - start };
}
