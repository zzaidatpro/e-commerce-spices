import { test, expect } from '@playwright/test';
import { ADMIN, WEB, loginAdmin, loginWeb } from './helpers';

test('client → staff : message, réponse, notifications des deux côtés', async ({ browser }) => {
  const sujet = `E2E ${Date.now()}`;

  // Client : envoi du message depuis le dashboard
  const clientCtx = await browser.newContext();
  const clientPage = await clientCtx.newPage();
  await loginWeb(clientPage, 'client');
  await clientPage.goto(`${WEB}/dashboard`);
  await clientPage.getByPlaceholder('Sujet').fill(sujet);
  await clientPage.getByPlaceholder('Votre message').fill('Message de test de bout en bout.');
  await clientPage.getByRole('button', { name: 'Envoyer', exact: true }).click();
  await expect(clientPage.getByText('Message envoyé.')).toBeVisible();

  // Manager : notification, puis lecture et réponse
  const managerCtx = await browser.newContext();
  const managerPage = await managerCtx.newPage();
  await loginAdmin(managerPage, 'manager');
  await managerPage.goto(`${ADMIN}/admin`);
  await managerPage.getByTestId('notif-bell').click();
  await expect(managerPage.getByTestId('notif-list').getByText('Nouveau message client')).toBeVisible();

  await managerPage.goto(`${ADMIN}/admin/feedback`);
  const carte = managerPage.locator('article', { hasText: sujet });
  await expect(carte).toBeVisible();
  await expect(carte.getByText('E2E Client')).toBeVisible();

  await carte.locator('textarea[name="reponse"]').fill('Merci, bien reçu.');
  await carte.getByRole('button', { name: 'Répondre', exact: true }).click();
  await expect(carte.getByText(/non lue par le client/)).toBeVisible();

  // Client : réponse visible, notification de réponse
  await clientPage.reload();
  await expect(clientPage.getByText('Merci, bien reçu.')).toBeVisible();
  await clientPage.getByTestId('notif-bell').click();
  await expect(clientPage.getByTestId('notif-list').getByText('Réponse à votre message')).toBeVisible();

  await clientCtx.close();
  await managerCtx.close();
});