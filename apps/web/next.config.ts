import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 transpilePackages: ["@repo/database", "@repo/ui"],
 turbopack:{root:"../.."},
 
};

export default nextConfig;
