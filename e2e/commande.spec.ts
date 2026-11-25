import { test, expect } from '@playwright/test';
import { ADMIN, WEB, comptes, creerCommandePayee, loginAdmin, loginWeb } from './helpers';

test('désignation, code, validation et acceptation par le livreur', async ({ browser }) => {
  const c = comptes();
  const commandeId = await creerCommandePayee(c.client.id, 500);

  const managerCtx = await browser.newContext();
  const livreurCtx = await browser.newContext();

  try {
    // Manager (admin) : désignation
    const managerPage = await managerCtx.newPage();
    await loginAdmin(managerPage, 'manager');
    await managerPage.goto(`${ADMIN}/admin/orders/${commandeId}`);

    await managerPage.getByTestId('livreur-select').selectOption(c.livreur.id);
    await managerPage.getByRole('button', { name: 'Désigner', exact: true }).click();

    const titreCode = managerPage.getByRole('heading', { name: 'Code de livraison' });
    const erreurDesignation = managerPage.getByTestId('erreur-designation');

    await expect(titreCode.or(erreurDesignation)).toBeVisible({ timeout: 15_000 });

    if (await erreurDesignation.isVisible()) {
      throw new Error(`Désignation refusée : ${await erreurDesignation.textContent()}`);
    }

    // Manager (admin) : génération du code, dans la section uniquement
    const section = managerPage.locator('section', { has: titreCode });
    const boutonGenerer = section.getByRole('button', { name: /générer le code/i });

    try {
      await expect(boutonGenerer).toBeVisible({ timeout: 10_000 });
    } catch {
      throw new Error(
        `Bouton « Générer le code » absent. Contenu de la section : ${await section.innerText()}`
      );
    }
    await boutonGenerer.click();
    const codeAffiche = managerPage.getByTestId('code-livraison');
    await expect(codeAffiche).toHaveText(/^\d{6}$/, { timeout: 10_000 });
    const code = (await codeAffiche.innerText()).trim();
    expect(code).toMatch(/^\d{6}$/);

    await managerPage.getByRole('button', { name: "J'ai envoyé le code" }).click();
    await expect(managerPage.getByText(/Code envoyé au livreur/)).toBeVisible();

    // Livreur (site) : validation du code, acceptation, démarrage
    const livreurPage = await livreurCtx.newPage();
    await loginWeb(livreurPage, 'livreur');
    await livreurPage.goto(`${WEB}/livraisons`);

    const carte = livreurPage.locator('article', { hasText: commandeId.slice(0, 8) });
    await expect(carte).toBeVisible();

    await carte.getByPlaceholder('000000').fill(code);
    await carte.getByRole('button', { name: 'Valider', exact: true }).click();

    await carte.getByRole('button', { name: 'Accepter', exact: true }).click();
    await expect(carte.getByRole('button', { name: 'Démarrer la livraison' })).toBeVisible();
  } finally {
    await managerCtx.close();
    await livreurCtx.close();
  }
});