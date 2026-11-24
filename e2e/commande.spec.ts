import { test, expect } from '@playwright/test';
import { ADMIN, WEB, comptes, creerCommandePayee, loginAdmin, loginWeb } from './helpers';

test('désignation, code, validation et acceptation par le livreur', async ({ browser }) => {
  const c = comptes();
  const commandeId = await creerCommandePayee(c.client.id, 500);

  // Manager : désignation du livreur, génération et envoi du code
  const managerCtx = await browser.newContext();
  const livreurCtx = await browser.newContext();
  try {
  const managerPage = await managerCtx.newPage();
  await loginAdmin(managerPage, 'manager');
  await managerPage.goto(`${ADMIN}/admin/orders/${commandeId}`);

  // await managerPage.getByRole('combobox').first().selectOption(c.livreur.id);
  await managerPage.getByTestId('livreur-select').selectOption(c.livreur.id);
  await managerPage.getByRole('button', { name: 'Désigner', exact: true }).click();
  await expect(
  managerPage.getByText('Livreur désigné.')
  .or(managerPage.getByText(/Livreur invalide|Un livreur est déjà assigne |Commande assignee/))
  .filter({ visible: true })
  .first()
  ).toBeVisible();
  await expect(managerPage.getByRole('heading', { name: 'Code de livraison' })).toBeVisible();

  await managerPage.getByRole('button', { name: /Générer le code/ }).click();

  const code = ((await managerPage.getByTestId('code-livraison').textContent()) ?? '').trim();
  expect(code).toMatch(/^\d{6}$/);

  await managerPage.getByRole('button', { name: "J'ai envoyé le code" }).click();
  await expect(managerPage.getByText(/Code envoyé au livreur/)).toBeVisible();

  // Livreur : saisie du code, acceptation, démarrage
 
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