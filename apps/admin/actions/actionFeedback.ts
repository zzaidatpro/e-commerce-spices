'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { STAFF_ROLES } from '@/lib/permissions';

export async function sendFeedbackAction(formData: FormData) {
  const auth = await requireRole(STAFF_ROLES).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  if (!subject || message.length < 10) {
    return { error: 'Sujet requis et message de 10 caractères minimum.' };
  }

  const { error } = await auth.supabase
    .from('feedbacks')
    .insert({ from_profile_id: auth.user.id, subject, message });
  if (error) return { error: error.message };

  revalidatePath('/admin/feedback');
  return { success: true };
}

export async function markFeedbackReadAction(feedbackId: string) {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const { error } = await auth.supabase
    .from('feedbacks')
    .update({ status: 'read' })
    .eq('id', feedbackId);
  if (error) return { error: error.message };

  revalidatePath('/admin/feedback');
  return { success: true };
}