'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';

type ResultatAction = { success?: boolean; error?: string };

export async function expedierAction(orderId: string, livreurId: string): Promise<ResultatAction> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  if (!livreurId) return { error: 'Choisissez un livreur.' };

  const { error } = await auth.supabase.rpc('expedier_commande', {
    p_order: orderId,
    p_livreur: livreurId,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { success: true };
}

export async function encaisserAction(orderId: string, formData: FormData): Promise<ResultatAction> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const code = String(formData.get('code_livreur') ?? '').trim().toUpperCase();
  const montant = Number(formData.get('montant'));

  if (!/^[A-Z0-9]{6}$/.test(code)) return { error: 'Le code livreur comporte 6 caractères.' };
  if (!Number.isFinite(montant)) return { error: 'Montant invalide.' };

  const { error } = await auth.supabase.rpc('enregistrer_encaissement', {
    p_order: orderId,
    p_code_livreur: code,
    p_montant: montant,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { success: true };
}

export async function assignerLivreurAction(orderId: string, livreurId: string): Promise<ResultatAction> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };
  if (!livreurId) return { error: 'Choisissez un livreur.' };

  const { error } = await auth.supabase.rpc('designer_livreur', {
    p_order: orderId,
    p_livreur: livreurId,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function marquerCodeEnvoyeAction(orderId: string): Promise<ResultatAction> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const { error } = await auth.supabase.rpc('marquer_code_envoye', { p_order: orderId });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}