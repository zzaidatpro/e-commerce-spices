'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

type Resultat = { ok: boolean; message: string };

export async function envoyerFeedbackAction(formData: FormData): Promise<Resultat> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('envoyer_feedback_client', {
    p_sujet: String(formData.get('sujet') ?? ''),
    p_message: String(formData.get('message') ?? ''),
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  return { ok: true, message: 'Message envoyé. Nous vous répondrons ici.' };
}

export async function marquerReponseLueAction(id: string): Promise<Resultat> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('marquer_reponse_lue', { p_id: id });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  return { ok: true, message: 'Réponse marquée comme lue.' };
}