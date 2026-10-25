import { SupabaseClient } from '@supabase/supabase-js';

export interface SpiceFilterParams {
  region?: string;
  family?: string;
  origin?:string;
  search?: string;
}

export async function getFilteredSpices(
  supabase: SupabaseClient,
  filters: SpiceFilterParams
) {
  let query = supabase
    .from('produits')
    .select('*');

  if (filters.region) {
    query = query.eq('region', filters.region);
  }

  if (filters.origin) {
    query = query.eq('origin', filters.region);
  }


  if (filters.family) {
    query = query.eq('family', filters.family);
  }

  if (filters.search) {
    query = query.ilike('nom', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erreur récupération épices: ${error.message}`);
  return data || [];
}


export async function getCategoryGroups(supabase: SupabaseClient) {
  const { data: origin } = await supabase.from('origin').select('*');
  const { data: regions } = await supabase.from('region').select('*');

  return {
    families: origin || [],
    regions: regions || [],
  };
}

export async function getSpicesByBestSeller(
  supabase: SupabaseClient, 
  is_best_seller: boolean = true
) {
  const { data, error } = await supabase
    .from('produits')
    .select('id, nom, slug, is_best_seller, price_unitaire, image_url, origin, description')
    .eq('is_best_seller', is_best_seller);

  if (error || !data) {
    console.error('Erreur lors de la récupération des best-sellers:', error);
    return [];
  }

  return data;
}

export async function getRelatedSpices(
  supabase: SupabaseClient,
  spiceId: string,
  categoryId?: string,
  limit = 4
) {
  let query = supabase
    .from('produits')
    .select('*, category:categories(id, nom, slug)')
    .neq('id', spiceId)
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data } = await query;
  return data || [];
}

/**
 * Récupère toutes les régions avec leurs épices associées
 */
export async function getRegionsWithSpices(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('produits')
    .select('*, products(*, category:categories(id, nom, slug))');

  if (error) throw new Error(`Erreur récupération origines: ${error.message}`);
  return data || [];
}

/**
 * Récupère les événements chronologiques pour la page Histoire
 */
export async function getHistoryTimeline(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('produits')
    .select('nom, description, origin')
    .order('origin', { ascending: true });

  if (error) throw new Error(`Erreur récupération histoire: ${error.message}`);
  return data || [];
}