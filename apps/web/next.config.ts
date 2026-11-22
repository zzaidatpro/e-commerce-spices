import type { NextConfig } from "next";
import path from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/auth", "@repo/database", "@repo/lib", "@repo/ui"],
  turbopack: { root: path.resolve(process.cwd(), '../..'),},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'bgjsxsiwycodcktyanev.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
