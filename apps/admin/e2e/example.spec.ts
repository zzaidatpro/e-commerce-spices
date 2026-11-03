import { test, expect } from '@playwright/test';

test.describe('E2E Admin - Vérification initiale', () => {
  test('devrait charger la page principale et vérifier le titre', async ({ page }) => {
    // Navigue vers la racine de l'application (basée sur le baseURL du playwright.config.ts : http://localhost:3001)
    await page.goto('/');

    // Vérifie que l'URL est correcte
    await expect(page).toHaveURL(/localhost:3001/);

    // Exemple : Vérifier qu'un élément visuel ou un titre est présent sur la page
    // (Vous pouvez adapter le sélecteur selon le contenu de votre page)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});