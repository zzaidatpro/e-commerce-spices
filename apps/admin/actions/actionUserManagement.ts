'use server';

import { createClient } from '@repo/database/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const role = formData.get('role') as string;
  if (!role) return { error: 'Rôle invalide.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserStatusAction(userId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}