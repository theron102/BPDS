import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: process.env.ASSET_PREFIX || undefined,
};

export default nextConfig;