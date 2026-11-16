'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { getAdminClient } from '@/lib/supabase/admin';

export async function setClientStatutAction(clientId: string, statut: 'approved' | 'blocked') {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  if (statut !== 'approved' && statut !== 'blocked') return { error: 'Statut invalide.' };
  if (clientId === auth.user.id) return { error: 'Action impossible sur votre propre compte.' };

  // Gestion des clients par admin
  const { data: cible } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', clientId)
    .single();

  if (!cible || cible.role !== 'client') {
    return { error: 'Seuls les comptes clients peuvent être bloqués ici.' };
  }

  const { error } = await getAdminClient().from('profiles').update({ status: statut }).eq('id', clientId);
  if (error) return { error: error.message };

  revalidatePath('/admin/clients');
  return { success: true };
}