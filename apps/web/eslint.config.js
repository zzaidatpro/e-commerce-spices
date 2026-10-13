import nextConfig from "@repo/eslint-config/nextjs";

export default [
  ...nextConfig,
{
    ignores: [".next/*", "node_modules/*", "dist/*"],
  },
];