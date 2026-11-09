'use server';

import { createClient } from '@repo/database/server';
import { revalidatePath } from 'next/cache';

export interface CheckoutFormData {
  type_lieu: 'maison' | 'magasin' | 'depot';
  adresse_complete: string;
  url_google_maps?: string;
  items: Array<{ produit_id: string; quantite: number }>;
}

export async function createOrderAction(data: CheckoutFormData) {
  const supabase = await createClient();

  const { data: orderId, error } = await supabase.rpc('create_order', {
    p_type_lieu: data.type_lieu,
    p_adresse: data.adresse_complete,
    p_url: data.url_google_maps ?? null,
    p_items: data.items,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return { success: true, orderId };
}