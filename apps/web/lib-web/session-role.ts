import { createClient } from '@repo/database/server';

export type RoleSite = 'client' | 'livreur' | null;

export async function getRoleSite(): Promise<{ role: RoleSite; email: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { role: null, email: null };

  const { data } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!data || data.status !== 'approved') return { role: null, email: user.email ?? null };
  if (data.role === 'client' || data.role === 'livreur') {
    return { role: data.role, email: user.email ?? null };
  }
  // Admin et manager : pas d'espace sur le site
  return { role: null, email: user.email ?? null };
}