import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin workspace root so Next doesn't latch onto an outer lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
