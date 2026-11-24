import { defineConfig, devices } from '@playwright/test';
import { config as charger } from 'dotenv';
import path from 'node:path';

charger({ path: path.resolve(__dirname, 'apps/admin/.env.test'), override: true });
const env = process.env;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: env.CI ? 1 : 0,
  use: { actionTimeout: 15_000, navigationTimeout: 30_000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: env.SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY!,
        NEXT_PUBLIC_AUTH_COOKIE_NAME: 'sb-web-auth',
        NEXT_PUBLIC_WEB_URL: 'http://localhost:3000',
      },
    },
    {
      command: 'pnpm --filter admin dev',
      url: 'http://localhost:3001',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: env.SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY!,
        SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY!,
        NEXT_PUBLIC_AUTH_COOKIE_NAME: 'sb-admin-auth',
        NEXT_PUBLIC_WEB_URL: 'http://localhost:3000',
      },
    },
  ],
});