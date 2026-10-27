import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/database", "@repo/ui"],
  turbopack: { root: "../.." },
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
