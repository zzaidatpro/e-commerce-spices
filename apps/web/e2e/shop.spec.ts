import { test, expect } from '@playwright/test';

test.describe('Parcours utilisateur : Catalogue, Panier et Gestion des Quantités', () => {
  test('devrait ajouter un produit, ajuster la quantité et vérifier les mises à jour', async ({ page }) => {
    // 1. Accéder au catalogue public
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);

    // 2. Ouvrir la fiche du premier produit
    const firstProductLink = page.locator('a[href*="/products/"]').first();
    await expect(firstProductLink).toBeVisible({ timeout: 10000 });
    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/.+/);

    // 3. Récupérer le nom du produit
    const productTitle = page.locator('h1').first();
    await expect(productTitle).toBeVisible();
    const productName = await productTitle.textContent();

    // 4. Ajouter le produit au panier
    const addToCartButton = page.getByRole('button', { name: /ajouter au panier/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // 5. Accéder à l'interface du panier
    const cartButton = page.locator('a[href="/cart"], button[aria-label*="panier"], button[title*="panier"]').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    } else {
      await page.goto('/cart');
    }

    // 6. Confirmer la présence de l'article dans le panier
    if (productName) {
      const cartItem = page.getByText(productName.trim()).first();
      await expect(cartItem).toBeVisible({ timeout: 10000 });
    }

    // 7. Tester l'augmentation de la quantité (+1)
    const incrementBtn = page.locator('button[aria-label*="augmenter"], button:has-text("+")').first();
    if (await incrementBtn.isVisible()) {
      await incrementBtn.click();
      // Vérifier que la quantité affiche 2
      const quantityDisplay = page.locator('span:has-text("2"), input[value="2"]').first();
      await expect(quantityDisplay).toBeVisible();
    }

    // 8. Tester la diminution de la quantité (-1)
    const decrementBtn = page.locator('button[aria-label*="diminuer"], button:has-text("-")').first();
    if (await decrementBtn.isVisible()) {
      await decrementBtn.click();
      // Vérifier le retour à la quantité 1
      const quantityDisplay = page.locator('span:has-text("1"), input[value="1"]').first();
      await expect(quantityDisplay).toBeVisible();
    }
  });
});