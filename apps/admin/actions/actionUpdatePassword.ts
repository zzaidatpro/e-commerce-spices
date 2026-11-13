'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

export async function updatePasswordAction(formData: FormData) {
  const newPassword = String(formData.get('newPassword') ?? '');

  if (newPassword.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: `Mise à jour du mot de passe impossible : ${error.message}` };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}