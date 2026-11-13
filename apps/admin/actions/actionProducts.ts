'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { STAFF_ROLES } from '@/lib/permissions';

export async function saveProductAction(formData: FormData) {
  const auth = await requireRole(STAFF_ROLES).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const id = String(formData.get('id') ?? '') || null;
  const nom = String(formData.get('nom') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const prix_unitaire = Number(formData.get('prix_unitaire'));
  const family = String(formData.get('family') ?? '').trim() || null;
  const region = String(formData.get('region') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;
  const image_url = String(formData.get('image_url') ?? '').trim() || null;

  if (!nom || !slug || !Number.isFinite(prix_unitaire) || prix_unitaire < 0) {
    return { error: 'Nom, slug et prix valide requis.' };
  }

  const payload = { nom, slug, prix_unitaire, family, region, description, image_url };

  const { error } = id
    ? await auth.supabase.from('produits').update(payload).eq('id', id)
    : await auth.supabase.from('produits').insert(payload);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  return { success: true };
}