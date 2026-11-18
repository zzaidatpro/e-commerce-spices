'use server';

import { revalidatePath } from 'next/cache';
import { requireClient } from '@/lib/auth-client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ResultatAction = { success?: boolean; error?: string };

export async function ajouterFavori(produitId: string): Promise<ResultatAction> {
  if (!UUID_RE.test(produitId)) return { error: 'Produit invalide.' };

  const auth = await requireClient();
  if (!auth) return { error: 'Espace réservé aux clients.' };

  const { error } = await auth.supabase
    .from('favoris')
    .upsert(
      { profile_id: auth.user.id, produit_id: produitId },
      { onConflict: 'profile_id,produit_id', ignoreDuplicates: true }
    );

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function retirerFavori(produitId: string): Promise<ResultatAction> {
  if (!UUID_RE.test(produitId)) return { error: 'Produit invalide.' };

  const auth = await requireClient();
  if (!auth) return { error: 'Espace réservé aux clients.' };

  const { error } = await auth.supabase
    .from('favoris')
    .delete()
    .eq('profile_id', auth.user.id)
    .eq('produit_id', produitId);

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}