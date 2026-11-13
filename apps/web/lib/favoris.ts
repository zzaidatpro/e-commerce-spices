import { createClient } from '@repo/database/server';
// faire passer un tableau depuis server component vers client component
export async function getFavoriIds(): Promise<string[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('favoris')
    .select('produit_id')
    .eq('profile_id', user.id);

  return (data ?? []).map((f) => f.produit_id);
}