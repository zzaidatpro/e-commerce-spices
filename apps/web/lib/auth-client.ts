import { createClient } from '@repo/database/server';

export async function requireClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profil } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profil?.role !== 'client' || profil.status !== 'approved') return null;
  return { supabase, user };
}