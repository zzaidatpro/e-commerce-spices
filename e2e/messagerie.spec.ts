import { test, expect } from '@playwright/test';
import { ADMIN, WEB, loginAdmin, loginWeb } from './helpers';

test('client → staff : message, réponse, notifications des deux côtés', async ({ browser }) => {
  const sujet = `E2E ${Date.now()}`;

  const clientCtx = await browser.newContext();
  const managerCtx = await browser.newContext();

  try {
    // Client (site) : envoi du message
    const clientPage = await clientCtx.newPage();
    await loginWeb(clientPage, 'client');
    await clientPage.goto(`${WEB}/dashboard`);
    await clientPage.getByPlaceholder('Sujet').fill(sujet);
    await clientPage.getByPlaceholder('Votre message').fill('Message de test de bout en bout.');
    await clientPage.getByRole('button', { name: 'Envoyer', exact: true }).click();
    await expect(clientPage.getByText('Message envoyé.')).toBeVisible();

    // Manager (admin) : notification ciblée sur ce message, puis réponse
    const managerPage = await managerCtx.newPage();
    await loginAdmin(managerPage, 'manager');
    await managerPage.goto(`${ADMIN}/admin`);

    await managerPage.getByTestId('notif-bell').click();
    const notifManager = managerPage
      .getByTestId('notif-list')
      .getByRole('link')
      .filter({ hasText: sujet });
    await expect(notifManager).toHaveCount(1);
    await expect(notifManager.getByText('Nouveau message client')).toBeVisible();

    await managerPage.goto(`${ADMIN}/admin/feedback`);
    const carte = managerPage.locator('article', { hasText: sujet });
    await expect(carte).toBeVisible();
    await expect(carte.getByText(/Client E2E/)).toBeVisible();

    await carte.locator('textarea[name="reponse"]').fill('Merci, bien reçu.');
    await carte.getByRole('button', { name: 'Répondre', exact: true }).click();
    await expect(carte.getByText(/non lue par le client/)).toBeVisible();

    // Client (site) : réponse visible, notification de réponse
    await clientPage.reload();
    const carteClient = clientPage.locator('li', { hasText: sujet });
    await expect(carteClient).toHaveCount(1);
    await expect(carteClient.getByText('Merci, bien reçu.')).toBeVisible();

    await clientPage.getByTestId('notif-bell').click();
    const notifClient = clientPage
      .getByTestId('notif-list')
      .getByRole('link')
      .filter({ hasText: sujet });
    await expect(notifClient).toHaveCount(1);
    await expect(notifClient.getByText('Réponse à votre message')).toBeVisible();
      } finally {
    await clientCtx.close();
    await managerCtx.close();
  }
});