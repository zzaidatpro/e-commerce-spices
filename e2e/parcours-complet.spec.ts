import { test, expect } from '@playwright/test';
import { ADMIN, WEB, comptes, creerCommandePayee, loginAdmin, loginWeb } from './helpers';

test('parcours complet : désignation → remise → déclaration → confirmation → terminée', async ({ browser }) => {
  const c = comptes();
  const commandeId = await creerCommandePayee(c.client.id, 500);

  const managerCtx = await browser.newContext();
  const livreurCtx = await browser.newContext();
  const clientCtx = await browser.newContext();

  try {
    // 1. Manager : désignation, code, envoi
    const managerPage = await managerCtx.newPage();
    await loginAdmin(managerPage, 'manager');
    await managerPage.goto(`${ADMIN}/admin/orders/${commandeId}`);

    await managerPage.getByTestId('livreur-select').selectOption(c.livreur.id);
    await managerPage.getByRole('button', { name: 'Désigner', exact: true }).click();

    const titreCode = managerPage.getByRole('heading', { name: 'Code de livraison' });
    const erreur = managerPage.getByTestId('erreur-designation');
    await expect(titreCode.or(erreur)).toBeVisible({ timeout: 15_000 });
    if (await erreur.isVisible()) {
      throw new Error(`Désignation refusée : ${await erreur.textContent()}`);
    }

    const section = managerPage.locator('section', { has: titreCode });
    await section.getByRole('button', { name: /générer le code/i }).click();

    const codeAffiche = managerPage.getByTestId('code-livraison');
    await expect(codeAffiche).toHaveText(/^\d{6}$/, { timeout: 10_000 });
    const code = (await codeAffiche.innerText()).trim();

    await managerPage.getByRole('button', { name: "J'ai envoyé le code" }).click();
    await expect(managerPage.getByText(/Code envoyé au livreur/)).toBeVisible();

    // 2. Livreur : validation du code, acceptation, démarrage
    const livreurPage = await livreurCtx.newPage();
    await loginWeb(livreurPage, 'livreur');
    await livreurPage.goto(`${WEB}/livraisons`);

    const carteLivreur = livreurPage.locator('article', { hasText: commandeId.slice(0, 8) });
    await expect(carteLivreur).toBeVisible();
    await carteLivreur.getByPlaceholder('000000').fill(code);
    await carteLivreur.getByRole('button', { name: 'Valider', exact: true }).click();
    await carteLivreur.getByRole('button', { name: 'Accepter', exact: true }).click();
    await expect(carteLivreur.getByRole('button', { name: 'Démarrer la livraison' })).toBeVisible();
    await carteLivreur.getByRole('button', { name: 'Démarrer la livraison' }).click();
    await expect(carteLivreur.getByText('En livraison')).toBeVisible();

    // 3. Client : saisie du code à la réception
    const clientPage = await clientCtx.newPage();
    await loginWeb(clientPage, 'client');
    await clientPage.goto(`${WEB}/orders/${commandeId}`);

    const formulaireRemise = clientPage.locator('form', { hasText: 'Réception' }).first();
    await formulaireRemise.getByRole('textbox').fill(code);
    await formulaireRemise.getByRole('button', { name: /confirmer/i }).click();
    await expect(clientPage.getByText('Colis remis')).toBeVisible();

    // 4. Livreur : déclaration du montant remis
    await livreurPage.reload();
    const carteApresRemise = livreurPage.locator('article', { hasText: commandeId.slice(0, 8) });
    await carteApresRemise.getByRole('spinbutton').fill('500');
    await carteApresRemise.getByRole('button', { name: 'Déclarer', exact: true }).click();
    await expect(carteApresRemise.getByText(/en attente de la confirmation/)).toBeVisible();

    // 5. Manager : confirmation de la vente
    await managerPage.reload();
    await expect(managerPage.getByText('Montant déclaré par le livreur')).toBeVisible();
    await managerPage.getByRole('button', { name: 'Confirmer la vente', exact: true }).click();
    await expect(managerPage.getByText('Opération terminée')).toBeVisible();

    // 6. Client : timeline finale
    await clientPage.reload();
    await expect(clientPage.getByText('Vente confirmée')).toBeVisible();
    await expect(clientPage.getByText('Opération terminée')).toBeVisible();
  } finally {
    await managerCtx.close();
    await livreurCtx.close();
    await clientCtx.close();
  }
});