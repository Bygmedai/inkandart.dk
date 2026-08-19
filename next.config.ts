import type { NextConfig } from "next";
import path from "node:path";
import { nextRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return nextRedirects;
  },
};

export default nextConfig;
