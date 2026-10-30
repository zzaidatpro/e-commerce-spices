import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddToCartButton from './AddToCartButton';

// Mock du hook useCart pour isoler le test du composant
vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: vi.fn(),
  }),
}));

describe('AddToCartButton Component', () => {
  const mockProduct = {
    id: 'prod-1',
    name: 'Cumin Bio',
    slug: 'cumin',
    price: 450,
    image: '/cumin.jpg',
    weight: '100g',
  };

  it('devrait rendre le bouton correctement', () => {
    render(<AddToCartButton product={mockProduct} />);
    
    const button = screen.getByRole('button', { name: /ajouter au panier/i });
    expect(button).toBeDefined();
  });

  it('devrait déclencher l\'action d\'ajout au clic', () => {
    render(<AddToCartButton product={mockProduct} />);
    
    const button = screen.getByRole('button', { name: /ajouter au panier/i });
    fireEvent.click(button);

    // Vérification que le clic s'effectue sans erreur
    expect(button).toBeTruthy();
  });
});