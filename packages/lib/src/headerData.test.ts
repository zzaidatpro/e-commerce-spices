import { describe, it, expect } from 'vitest';
import { menuPourRole, menuVitrine } from './headerData';

describe('menuPourRole', () => {
  it('livreur : livraisons et contact uniquement', () => {
    expect(menuPourRole('livreur').map((l) => l.href)).toEqual(['/livraisons', '/contact']);
  });
  it('invité : vitrine', () => {
    expect(menuPourRole(null)).toEqual(menuVitrine);
  });
});