import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth", "unpdf", "firecrawl"],
};

export default nextConfig;
