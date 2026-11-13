'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}