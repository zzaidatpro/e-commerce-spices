'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

type Resultat = { ok: boolean; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function appeler(nom: string, args: Record<string, unknown>, succes: string): Promise<Resultat> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(nom, args);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/livraisons');
  return { ok: true, message: succes };
}

export async function validerCodeAction(orderId: string, code: string): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Livraison invalide.' };
  const propre = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(propre)) return { ok: false, message: 'Le code comporte 6 chiffres.' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('valider_code_reception', { p_order: orderId, p_code: propre });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/livraisons');
  return data as Resultat;
}

export async function accepterAction(orderId: string): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Livraison invalide.' };
  return appeler('accepter_livraison', { p_order: orderId }, 'Livraison acceptée. Vous pouvez la démarrer.');
}

export async function refuserAction(orderId: string, motif: string): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Livraison invalide.' };
  if (motif.trim().length < 5) return { ok: false, message: 'Motif requis (5 caractères minimum).' };
  return appeler(
    'refuser_livraison',
    { p_order: orderId, p_motif: motif.trim() },
    'Livraison refusée. Le manager va désigner un autre livreur.'
  );
}

export async function demarrerAction(orderId: string): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Livraison invalide.' };
  return appeler('demarrer_livraison', { p_order: orderId }, 'Livraison démarrée. Bonne route !');
}

export async function declarerMontantAction(orderId: string, montant: number): Promise<Resultat> {
  if (!UUID_RE.test(orderId)) return { ok: false, message: 'Livraison invalide.' };
  if (!Number.isFinite(montant) || montant < 0) return { ok: false, message: 'Montant invalide.' };
  return appeler(
    'declarer_remise',
    { p_order: orderId, p_montant: montant },
    'Montant déclaré. En attente de la confirmation du manager.'
  );
}