import { test, expect } from '@playwright/test';
import { ADMIN, loginAdmin } from './helpers';

const URL_PRODUIT = /\/admin\/products\/[0-9a-f-]{36}$/;

test('manager : crée, modifie un produit, sans bouton Supprimer', async ({ page }) => {
  const nom = `Produit E2E ${Date.now()}`;

  await loginAdmin(page, 'manager');
  await page.goto(`${ADMIN}/admin/products/new`);

  await page.getByLabel(/^Nom/).fill(nom);
  await page.getByLabel(/^Prix unitaire/).fill('350');
  await page.getByRole('button', { name: 'Créer le produit', exact: true }).click();

  await expect(page).toHaveURL(URL_PRODUIT, { timeout: 15_000 });
  await expect(page.getByLabel(/^Nom/)).toHaveValue(nom);

  await page.getByLabel(/^Prix unitaire/).fill('420');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText('Produit enregistré.')).toBeVisible();

  await page.reload();
  await expect(page.getByLabel(/^Prix unitaire/)).toHaveValue('420');
  await expect(page.getByRole('button', { name: 'Supprimer', exact: true })).toHaveCount(0);
});

test('manager : refuse un slug déjà utilisé', async ({ page }) => {
  const nom = `Doublon E2E ${Date.now()}`;

  await loginAdmin(page, 'manager');

  for (const tentative of [1, 2]) {
    await page.goto(`${ADMIN}/admin/products/new`);
    await page.getByLabel(/^Nom/).fill(nom);
    await page.getByLabel(/^Prix unitaire/).fill('100');
    await page.getByRole('button', { name: 'Créer le produit', exact: true }).click();

    if (tentative === 1) {
      await expect(page).toHaveURL(URL_PRODUIT, { timeout: 15_000 });
    }
  }

  await expect(page.getByText('Ce slug existe déjà. Modifiez-le.')).toBeVisible();
});

test('admin : supprime un produit jamais commandé', async ({ page }) => {
  const nom = `Produit à supprimer ${Date.now()}`;

  await loginAdmin(page, 'admin');
  await page.goto(`${ADMIN}/admin/products/new`);

  await page.getByLabel(/^Nom/).fill(nom);
  await page.getByLabel(/^Prix unitaire/).fill('100');
  await page.getByRole('button', { name: 'Créer le produit', exact: true }).click();
  await expect(page).toHaveURL(URL_PRODUIT, { timeout: 15_000 });

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();

  await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 15_000 });
  await expect(page.getByText(nom)).toHaveCount(0);
});