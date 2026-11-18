'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@repo/database/server';

type Resultat = { success?: boolean; error?: string };

const TEL_RE = /^\+?[0-9][0-9 .-]{6,18}$/;

export async function majCoordonneesLivreurAction(formData: FormData): Promise<Resultat> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Connexion requise.' };

  const { data: moi } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (moi?.role !== 'livreur' || moi.status !== 'approved') {
    return { error: 'Espace réservé aux livreurs approuvés.' };
  }

  const nom = String(formData.get('nom') ?? '').trim();
  const prenom = String(formData.get('prenom') ?? '').trim();
  const telephone = String(formData.get('telephone') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();

  if (!nom || nom.length > 100) return { error: 'Nom requis (100 caractères maximum).' };
  if (!prenom || prenom.length > 100) return { error: 'Prénom requis (100 caractères maximum).' };
  if (!TEL_RE.test(telephone)) return { error: 'Numéro de téléphone invalide.' };
  if (whatsapp && !TEL_RE.test(whatsapp)) return { error: 'Numéro WhatsApp invalide.' };

  const { error } = await supabase
    .from('profiles')
    .update({ nom, prenom, telephone, whatsapp: whatsapp || null })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/livraisons');
  return { success: true };
}