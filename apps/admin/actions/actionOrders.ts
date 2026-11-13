'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { STAFF_ROLES, STATUTS_COMMANDE, TRANSITIONS, type StatutCommande } from '@/lib/permissions';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const auth = await requireRole(STAFF_ROLES).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  if (!STATUTS_COMMANDE.includes(newStatus as StatutCommande)) return { error: 'Statut invalide.' };

  const { data: order, error: readError } = await auth.supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();
  if (readError || !order) return { error: 'Commande introuvable.' };

  const current = order.status as StatutCommande;
  const allowed = TRANSITIONS[current] ?? [];
  if (auth.role !== 'admin' && !allowed.includes(newStatus as StatutCommande)) {
    return { error: `Passage de « ${current} » à « ${newStatus} » non autorisé.` };
  }

  const { error } = await auth.supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function updateOrderDetails(orderId: string, formData: FormData) {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const type_lieu = String(formData.get('type_lieu') ?? '');
  if (!['maison', 'magasin', 'depot'].includes(type_lieu)) return { error: 'Type de lieu invalide.' };

  const { error } = await auth.supabase
    .from('orders')
    .update({
      type_lieu,
      adresse_complete: String(formData.get('adresse_complete') ?? '').trim(),
      url_google_maps: String(formData.get('url_google_maps') ?? '').trim() || null,
    })
    .eq('id', orderId);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}

// Suppression : admin uniquement
export async function deleteOrderAction(orderId: string) {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  await auth.supabase.from('order_items').delete().eq('order_id', orderId);

  const { error } = await auth.supabase.from('orders').delete().eq('id', orderId);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}