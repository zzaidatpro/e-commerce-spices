import { test, expect } from '@playwright/test';

test.describe('Parcours d\'Authentification (AdminBar)', () => {
  test('devrait ouvrir le popover de connexion et se connecter avec succès', async ({ page }) => {
    // 1. Aller sur l'accueil (contenant la AdminBar)
    await page.goto('/');

    // 2. Cliquer sur l'icône de connexion de la AdminBar
    const loginToggleBtn = page.locator('button[title="Connexion"]');
    await expect(loginToggleBtn).toBeVisible();
    await loginToggleBtn.click();

    // 3. Remplir le formulaire avec les identifiants de test fournis
    await page.fill('input[type="email"]', 'test27@gmail.com');
    await page.fill('input[type="password"]', 'test27');

    // 4. Cliquer sur le bouton "Se connecter" du popover
    const submitButton = page.getByRole('button', { name: /se connecter/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 5. Vérifier que la connexion a réussi (le lien Dashboard devient visible)
    const logoutButton = page.locator('button[title="Déconnexion"]');
    await expect(logoutButton).toBeVisible({ timeout: 15000 });
  });
});