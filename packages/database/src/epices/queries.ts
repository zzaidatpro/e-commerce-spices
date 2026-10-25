import { SupabaseClient } from '@supabase/supabase-js';

export interface SpiceFilterParams {
  region?: string;
  family?: string;
  origin?:string;
  search?: string;
}

/**
 * Récupère la liste des épices avec filtres appliqués côté serveur
 */
export async function getFilteredSpices(
  supabase: SupabaseClient,
  filters: SpiceFilterParams
) {
  let query = supabase
    .from('products')
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

/**
 * Récupère les groupes de catégories pour la barre latérale
 */
export async function getCategoryGroups(supabase: SupabaseClient) {
  const { data: origin } = await supabase.from('origin').select('*');
  const { data: regions } = await supabase.from('region').select('*');

  return {
    families: origin || [],
    regions: regions || [],
  };
}

/**
 * Récupère une épice par son slug
 */
export async function getSpiceBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, nom, slug), region:regions(id, nom, slug)')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Récupère les épices associées (même région ou même catégorie)
 */
export async function getRelatedSpices(
  supabase: SupabaseClient,
  spiceId: string,
  categoryId?: string,
  limit = 4
) {
  let query = supabase
    .from('products')
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
    .from('regions')
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