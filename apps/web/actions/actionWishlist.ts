'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function ajouterFavori(produitId: string) {
  if (!UUID_RE.test(produitId)) return { error: 'Produit invalide.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Connexion requise.' };

  const { error } = await supabase
    .from('favoris')
    .upsert(
      { profile_id: user.id, produit_id: produitId },
      { onConflict: 'profile_id,produit_id', ignoreDuplicates: true }
    );

  if (error) return { error: error.message };

  revalidatePath('/wishlist');
  return { success: true };
}

export async function retirerFavori(produitId: string) {
  if (!UUID_RE.test(produitId)) return { error: 'Produit invalide.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Connexion requise.' };

  const { error } = await supabase
    .from('favoris')
    .delete()
    .eq('profile_id', user.id)
    .eq('produit_id', produitId);

  if (error) return { error: error.message };

  revalidatePath('/wishlist');
  return { success: true };
}