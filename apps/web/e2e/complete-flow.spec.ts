import { test, expect } from '@playwright/test';

test.describe('Parcours Utilisateur Complet (Tej Patta)', () => {
  test('devrait se connecter, naviguer vers le catalogue et ajouter un produit au panier', async ({ page }) => {
    // 1. Aller sur la page d'accueil
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // 2. Ouvrir le popover de connexion de la AdminBar
    const loginToggleBtn = page.locator('button[title="Connexion"]');
    await expect(loginToggleBtn).toBeVisible();
    await loginToggleBtn.click();

    // 3. Remplir les identifiants de test
    await page.fill('input[type="email"]', 'test27@gmail.com');
    await page.fill('input[type="password"]', 'test27');

    // 4. Soumettre le formulaire de connexion
    const submitButton = page.getByRole('button', { name: /se connecter/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 5. Valider que la session est active (le bouton Déconnexion apparaît sur place)
    const logoutBtn = page.locator('button[title="Déconnexion"]');
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });

    // 6. Navigation vers le catalogue public (/products)
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);

    // 7. Ajouter le premier produit au panier (utilisation de .first() pour cibler 
    // le premier élément de la liste générée par le .map())
    const addToCartButton = page.getByRole('button', { name: /ajouter au panier/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
  });
});