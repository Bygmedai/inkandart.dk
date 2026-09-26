import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import path from "node:path";
import { lavFotovarianter } from "./lib/fotovarianter";
import { hostRedirects, nextRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // lib/foto.ts læser manifestet ved rendering. Sider der renderes på
  // forespørgsel (fx /shop), kører i en funktion der kun har de filer
  // tracingen tager med — uden denne linje får de aldrig et srcset.
  outputFileTracingIncludes: {
    "/**": ["./public/_v/manifest.json"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [...nextRedirects, ...hostRedirects];
  },
};

/**
 * Mobilversionerne af fotos laves her, ikke i et npm-script: vercel.json
 * kører `next build` direkte, så et `prebuild` ville aldrig køre i
 * produktion (docs/accept/billeder-mobil.md, punkt 4). Kun ved build —
 * i dev vises originalerne, og lib/foto.ts falder pænt tilbage.
 */
export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const r = await lavFotovarianter(__dirname);
    console.log(
      `[fotovarianter] ${r.fotos} fotos, ${r.filer} nye filer, ${(r.ms / 1000).toFixed(1)} s`,
    );
  }
  return nextConfig;
}
