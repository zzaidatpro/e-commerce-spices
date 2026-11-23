'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';

type Resultat = { success?: boolean; error?: string; id?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function lire(formData: FormData) {
  const texte = (cle: string) => {
    const v = String(formData.get(cle) ?? '').trim();
    return v === '' ? null : v;
  };
  const nombre = (cle: string) => {
    const v = texte(cle);
    return v === null ? null : Number(v);
  };

  const nom = texte('nom');
  const prix = nombre('prix_unitaire');
  const stock = nombre('stock') ?? 0;

  return {
    nom,
    slug: texte('slug') ?? (nom ? slugify(nom) : null),
    description: texte('description'),
    prix_unitaire: prix,
    stock,
    family: texte('family'),
    region: texte('region'),
    origin: texte('origin'),
    weight: texte('weight'),
    sku: texte('sku'),
    image_url: texte('image_url'),
    is_best_seller: formData.get('is_best_seller') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  };
}

export async function saveProductAction(formData: FormData): Promise<Resultat> {
  const auth = await requireRole(['admin', 'manager']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const id = String(formData.get('id') ?? '').trim();
  if (id && !UUID_RE.test(id)) return { error: 'Produit invalide.' };

  const v = lire(formData);
  if (!v.nom) return { error: 'Le nom est obligatoire.' };
  if (!v.slug) return { error: 'Le slug est obligatoire.' };
  if (v.prix_unitaire === null || !Number.isFinite(v.prix_unitaire) || v.prix_unitaire < 0) {
    return { error: 'Prix invalide.' };
  }
  if (!Number.isInteger(v.stock) || v.stock < 0) return { error: 'Stock invalide.' };

  const requete = id
    ? auth.supabase.from('produits').update(v).eq('id', id).select('id').single()
    : auth.supabase.from('produits').insert(v).select('id').single();

  const { data, error } = await requete;

  if (error) {
    if (error.code === '23505') return { error: 'Ce slug existe déjà. Modifiez-le.' };
    return { error: error.message };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${data.id}`);
  return { success: true, id: data.id };
}

export async function deleteProductAction(id: string): Promise<Resultat> {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };
  if (!UUID_RE.test(id)) return { error: 'Produit invalide.' };

  const { count, error: errCompte } = await auth.supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('produit_id', id);

  if (errCompte) return { error: errCompte.message };
  if ((count ?? 0) > 0) {
    return {
      error:
        'Ce produit a déjà été commandé : il ne peut pas être supprimé. Passez son stock à 0 pour le retirer de la vente.',
    };
  }

  const { error } = await auth.supabase.from('produits').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  return { success: true };
}