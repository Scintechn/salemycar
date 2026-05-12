import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin workspace root so Next doesn't latch onto an outer lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Photo uploads on /admin/listing go through a server action. Next's
  // default body limit is 1 MB; we raise it to 4 MB to fit typical phone
  // photos. Vercel's infra ceiling is ~4.5 MB per request body, so going
  // higher than this would fail at the edge anyway.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
