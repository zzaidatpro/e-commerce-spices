'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';

type Resultat = { success?: boolean; error?: string };

// Envoi d'un message interne (manager vers admin)
export async function envoyerFeedbackInterneAction(formData: FormData): Promise<Resultat> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (subject.length < 3) return { error: 'Sujet trop court (3 caractères minimum).' };
  if (message.length < 10) return { error: 'Message trop court (10 caractères minimum).' };

  const { error } = await auth.supabase.from('feedbacks').insert({
    from_profile_id: auth.user.id,
    subject,
    message,
    categorie: 'interne',
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/feedback');
  return { success: true };
}

export async function repondreFeedbackAction(id: string, texte: string): Promise<Resultat> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const { error } = await auth.supabase.rpc('repondre_feedback', { p_id: id, p_reponse: texte });
  if (error) return { error: error.message };

  revalidatePath('/admin/feedback');
  return { success: true };
}

export async function marquerFeedbackLuAction(id: string): Promise<Resultat> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const { error } = await auth.supabase.rpc('marquer_feedback_lu', { p_id: id });
  if (error) return { error: error.message };

  revalidatePath('/admin/feedback');
  return { success: true };
}