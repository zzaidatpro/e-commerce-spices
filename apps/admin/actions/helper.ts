import { createClient } from '@repo/database/server';

export async function requireRole(allowed: readonly string[]) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Non authentifié');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'approved' || !allowed.includes(profile.role)) {
    throw new Error('Accès refusé');
  }

  return { supabase, user, role: profile.role };
}