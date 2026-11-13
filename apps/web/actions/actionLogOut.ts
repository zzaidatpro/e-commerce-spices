'use server';

import { createClient } from '@repo/database/server';

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
}