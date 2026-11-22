'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

type Resultat = { ok: boolean; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function confirmerLivraisonAction(orderId: string, code: string): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Commande invalide.' };

  const propre = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(propre)) return { ok: false, message: 'Le code comporte 6 chiffres.' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('confirmer_livraison', {
    p_order: orderId,
    p_code: propre,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);

  return data as Resultat;
}

export async function demanderNouveauCodeAction(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('demander_nouveau_code', { p_order: orderId });
  if (error) return { ok: false, message: error.message };
  return data as { ok: boolean; message: string };
}