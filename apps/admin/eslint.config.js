import nextConfig from "@repo/eslint-config/nextjs";

export default [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      ".turbo/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "**/db.types.ts",
      // Tests
      "tests/**",
      "**/tests/**",
      "__tests__/**",
      "**/__tests__/**",
      "**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
  },
];