'use server';

import { revalidatePath } from 'next/cache';
import {requireRole} from './helper';

export async function approveUserAction(targetUserId: string) {
  const auth = await requireRole(['admin']).catch(()=> null);
  if (!auth) return { error: 'Accès refusé.' };
  const { error } = await auth.supabase
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', targetUserId);
   if (error) return { error: error.message };

   revalidatePath('/admin/users');
  return { success: true };
}