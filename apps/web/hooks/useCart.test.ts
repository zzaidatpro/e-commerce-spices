import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart Hook', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it('devrait ajouter un produit au panier', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      // ❌ Retrait de quantity: 1 car addItem utilise Omit<CartItem, "quantity">
      result.current.addItem({
        id: 'prod-1',
        name: 'Cumin Bio',
        slug: 'cumin',
        price: 450,
        weight: '100g',
      });
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(450);
  });

  it('devrait incrémenter la quantité si le produit existe déjà', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      // ❌ Retrait de quantity ici aussi. Appeler addItem deux fois 
      // doit simuler l'ajout de 2 éléments distincts (1 + 1 = 2)
      result.current.addItem({ id: 'prod-1', name: 'Cumin', slug: 'cumin', price: 450 });
      result.current.addItem({ id: 'prod-1', name: 'Cumin', slug: 'cumin', price: 450 });
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0]?.quantity).toBe(2); // 💡 Ajusté à 2 (1 + 1)
    expect(result.current.totalItems).toBe(2);       // 💡 Ajusté à 2
    expect(result.current.totalPrice).toBe(900);      // 💡 Ajusté à 900
  });

  it('devrait supprimer un article du panier', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      // ❌ Retrait de quantity: 1
      result.current.addItem({ id: 'prod-1', name: 'Cumin', slug: 'cumin', price: 450 });
      result.current.removeItem('prod-1');
    });

    expect(result.current.cart.length).toBe(0);
    expect(result.current.totalItems).toBe(0);
  });
});