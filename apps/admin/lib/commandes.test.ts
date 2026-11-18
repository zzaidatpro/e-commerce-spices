import { describe, it, expect } from 'vitest';
import { Constants } from '../../../packages/database/src/types/db.types';
import { STATUT_LABELS, STATUTS_STAFF } from './commandes';

describe('libellés des statuts', () => {
  it('chaque valeur de l’enum a un libellé', () => {
    for (const statut of Constants.public.Enums.statut_commande) {
      expect(STATUT_LABELS[statut], statut).toBeDefined();
    }
  });

  it('le staff ne peut pas poser un statut de flux à la main', () => {
    const cibles = Object.values(STATUTS_STAFF).flat();
    expect(cibles).not.toContain('livrée');
    expect(cibles).not.toContain('confirmée');
    expect(cibles).not.toContain('remboursée');
  });
});