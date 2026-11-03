# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-and-dashboard.spec.ts >> Interface d'administration - Connexion et Tableau de bord >> 3. Doit se connecter avec succès et accéder au tableau de bord
- Location: e2e\auth-and-dashboard.spec.ts:37:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3001/"
Received: "http://localhost:3001/auth/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="fr" class="font-sans geist_da832ead-module__aN_Ytq__variable">…</html>
       - unexpected value "http://localhost:3001/auth/login"

```

```yaml
- heading "Administration - Connexion" [level=1]
- alert: Identifiants administrateur incorrects.
- text: Email
- textbox
- text: Mot de passe
- textbox
- button "Se connecter"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Interface d\'administration - Connexion et Tableau de bord', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Navigue vers la page de connexion avant chaque test
  7  |     await page.goto('auth/login');
  8  |   });
  9  | 
  10 |   test('1. Doit afficher correctement la page de connexion', async ({ page }) => {
  11 |     // Vérification du titre de la page
  12 |     await expect(page.locator('h1')).toHaveText('Administration - Connexion');
  13 | 
  14 |     // Vérification des champs et du bouton
  15 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  16 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  17 |     await expect(page.locator('button[type="submit"]')).toHaveText('Se connecter');
  18 |   });
  19 | 
  20 |   test('2. Doit afficher un message d\'erreur avec des identifiants invalides', async ({ page }) => {
  21 |     // Saisie de mauvais identifiants
  22 |     await page.fill('input[name="email"]', 'mauvais@admin.com');
  23 |     await page.fill('input[name="password"]', 'mauvaispass');
  24 | 
  25 |     // Soumission du formulaire
  26 |     await page.click('button[type="submit"]');
  27 | 
  28 |     // Vérification de la bannière d'alerte d'erreur
  29 |     const alert = page.getByTestId('login-error');
  30 |     await expect(alert).toBeVisible();
  31 |     await expect(alert).toHaveText('Identifiants incorrects');
  32 |     
  33 |     // S'assurer qu'on reste sur la page de connexion
  34 |     await expect(page).toHaveURL('auth/login');
  35 |   });
  36 | 
  37 |   test('3. Doit se connecter avec succès et accéder au tableau de bord', async ({ page }) => {
  38 |     // Saisie des identifiants de test configurés dans l'interface
  39 |     await page.fill('input[name="email"]', 'admin@example.com');
  40 |     await page.fill('input[name="password"]', 'password123');
  41 | 
  42 |     // Soumission du formulaire
  43 |     await page.click('button[type="submit"]');
  44 | 
  45 |     // Vérification de la redirection vers la racine du tableau de bord
> 46 |     await expect(page).toHaveURL('/');
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  47 | 
  48 |     // Vérification des éléments clés du Tableau de Bord
  49 |     await expect(page.locator('h1')).toHaveText('Tableau de bord');
  50 |     await expect(page.locator('aside')).toContainText('Admin Panel');
  51 | 
  52 |     // Vérification de la présence des cartes statistiques
  53 |     const statsCards = page.locator('main .grid > div');
  54 |     await expect(statsCards).toHaveCount(3);
  55 |     await expect(statsCards.nth(0)).toContainText('Utilisateurs totaux');
  56 |   });
  57 | 
  58 | });
```