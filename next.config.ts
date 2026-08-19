import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: false },
      { source: "/en/:path*", destination: "/", permanent: false },
      { source: "/walk-in", destination: "/#booking", permanent: false },
      { source: "/artister", destination: "/#artists", permanent: false },
      { source: "/artister/:slug", destination: "/#artists", permanent: false },
    ];
  },
};

export default nextConfig;
