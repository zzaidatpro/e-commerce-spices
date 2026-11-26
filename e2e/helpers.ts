import { expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { lireComptes, type Role } from './comptes-store';

export type { Role };
export const WEB = 'http://localhost:3000';
export const ADMIN = 'http://localhost:3001';
export const PWD = 'Test-1234-secure';

export const comptes = () => lireComptes();

export function clientAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function creerCommandePayee(clientId: string, total = 500): Promise<string> {
  const { data, error } = await clientAdmin()
    .from('orders')
    .insert({ client_id: clientId, statut: 'payée', total })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function loginWeb(page: Page, role: Role) {
  await page.goto(`${WEB}/`);
  await page.getByTitle('Connexion').click();
  await page.locator('input[type="email"]').fill(comptes()[role].email);
  await page.locator('input[type="password"]').fill(PWD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByTitle('Déconnexion')).toBeVisible({ timeout: 15_000 });
}

export async function loginAdmin(page: Page, role: Role) {
  await page.goto(`${ADMIN}/login`);
  await page.locator('input[type="email"]').fill(comptes()[role].email);
  await page.locator('input[type="password"]').fill(PWD);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}