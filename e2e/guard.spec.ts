import { test, expect } from '@playwright/test';
import { WEB, loginWeb } from './helpers';

test('invité : /livraisons renvoie vers l’accueil', async ({ page }) => {
  await page.goto(`${WEB}/livraisons`);
  await expect(page).toHaveURL(`${WEB}/`);
});

test('livreur : /dashboard renvoie vers /livraisons', async ({ page }) => {
  await loginWeb(page, 'livreur');
  await page.goto(`${WEB}/dashboard`);
  await expect(page).toHaveURL(/\/livraisons$/);
});

test('client : /livraisons renvoie vers /dashboard', async ({ page }) => {
  await loginWeb(page, 'client');
  await page.goto(`${WEB}/livraisons`);
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('livreur : menu limité à livraisons et contact', async ({ page }) => {
  await loginWeb(page, 'livreur');
  await page.goto(`${WEB}/livraisons`);
  await expect(page.locator('header nav').getByRole('link')).toHaveText(['Mes livraisons', 'Contact']);
});

test('manager : ne peut pas ouvrir le site comme client', async ({ page }) => {
  await loginWeb(page, 'manager');
  await page.goto(`${WEB}/dashboard`);
  await expect(page).toHaveURL(/\/unauthorized|\/$/);
});