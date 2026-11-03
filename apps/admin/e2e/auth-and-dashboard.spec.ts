import { test, expect } from '@playwright/test';

test.describe('Interface d\'administration - Connexion et Tableau de bord', () => {

  test.beforeEach(async ({ page }) => {
    // Navigue vers la page de connexion avant chaque test
    await page.goto('auth/login');
  });

  test('1. Doit afficher correctement la page de connexion', async ({ page }) => {
    // Vérification du titre de la page
    await expect(page.locator('h1')).toHaveText('Administration - Connexion');

    // Vérification des champs et du bouton
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Se connecter');
  });

  test('2. Doit afficher un message d\'erreur avec des identifiants invalides', async ({ page }) => {
    // Saisie de mauvais identifiants
    await page.fill('input[name="email"]', 'mauvais@admin.com');
    await page.fill('input[name="password"]', 'mauvaispass');

    // Soumission du formulaire
    await page.click('button[type="submit"]');

    // Vérification de la bannière d'alerte d'erreur
    const alert = page.getByTestId('login-error');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('Identifiants incorrects');
    
    // S'assurer qu'on reste sur la page de connexion
    await expect(page).toHaveURL('auth/login');
  });

  test('3. Doit se connecter avec succès et accéder au tableau de bord', async ({ page }) => {
    // Saisie des identifiants de test configurés dans l'interface
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Soumission du formulaire
    await page.click('button[type="submit"]');

    // Vérification de la redirection vers la racine du tableau de bord
    await expect(page).toHaveURL('/');

    // Vérification des éléments clés du Tableau de Bord
    await expect(page.locator('h1')).toHaveText('Tableau de bord');
    await expect(page.locator('aside')).toContainText('Admin Panel');

    // Vérification de la présence des cartes statistiques
    const statsCards = page.locator('main .grid > div');
    await expect(statsCards).toHaveCount(3);
    await expect(statsCards.nth(0)).toContainText('Utilisateurs totaux');
  });

});