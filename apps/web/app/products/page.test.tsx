import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsCatalogPage from './page';

// Mock de Supabase pour le catalogue
vi.mock('@repo/database/client', () => ({
  createUserClient: () => ({
    from: () => ({
      select: () => ({
        order: async () => ({
          data: [
            { id: '1', nom: 'Cumin Bio', slug: 'cumin', prix_unitaire: 450, family: 'Cumin' }
          ],
          error: null,
        }),
      }),
    }),
  }),
}));

describe('ProductsCatalogPage', () => {
  it('devrait afficher le catalogue et les produits', async () => {
    const ui = await ProductsCatalogPage();
    render(ui);

    expect(screen.getByText(/Catalogue des Épices & Condiments/i)).toBeDefined();
    expect(screen.getByText('Cumin Bio')).toBeDefined();
  });
});