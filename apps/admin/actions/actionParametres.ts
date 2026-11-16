'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';

type RegleParametre =
  | { type: 'boolean' }
  | { type: 'number'; min: number; max?: number }
  | { type: 'string'; maxLength: number };

const REGLES: Record<string, RegleParametre> = {
  boutique_ouverte: { type: 'boolean' },
  seuil_alerte_stock: { type: 'number', min: 0 },
  frais_livraison: { type: 'number', min: 0 },
  seuil_livraison_gratuite: { type: 'number', min: 0 },
  delai_relance_livraison_heures: { type: 'number', min: 1, max: 168 },
  bandeau_information: { type: 'string', maxLength: 200 },
};

export async function modifierParametreAction(cle: string, brut: string) {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const regle = REGLES[cle];
  if (!regle) return { error: 'Paramètre inconnu.' };

  let valeur: boolean | number | string;

  if (regle.type === 'boolean') {
    if (brut !== 'true' && brut !== 'false') return { error: 'Valeur attendue : oui ou non.' };
    valeur = brut === 'true';
  } else if (regle.type === 'number') {
    const n = Number(brut);
    if (brut.trim() === '' || !Number.isFinite(n)) return { error: 'Valeur numérique attendue.' };
    if (n < regle.min) return { error: `La valeur minimale est ${regle.min}.` };
    if (regle.max !== undefined && n > regle.max) return { error: `La valeur maximale est ${regle.max}.` };
    valeur = n;
  } else {
    const texte = brut.trim();
    if (texte.length > regle.maxLength) {
      return { error: `Maximum ${regle.maxLength} caractères.` };
    }
    valeur = texte;
  }

  const { error } = await auth.supabase
    .from('parametres_site')
    .update({
      valeur,
      updated_at: new Date().toISOString(),
      updated_by: auth.user.id,
    })
    .eq('cle', cle);

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}