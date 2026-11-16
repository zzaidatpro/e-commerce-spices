'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { getAdminClient } from '@/lib/supabase/admin';

const ROLES_CREABLES = ['manager', 'livreur'] as const;
type RoleCreable = (typeof ROLES_CREABLES)[number];

export async function creerCompteStaffAction(formData: FormData) {
  const auth = await requireRole(['admin']).catch(() => null);
  if (!auth) return { error: 'Accès refusé.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const nom = String(formData.get('nom') ?? '').trim();
  const prenom = String(formData.get('prenom') ?? '').trim();
  const telephone = String(formData.get('telephone') ?? '').trim();
  const role = String(formData.get('role') ?? '') as RoleCreable;

  if (!email || !nom || !prenom) return { error: 'Email, nom et prénom sont obligatoires.' };
  if (password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  if (!ROLES_CREABLES.includes(role)) return { error: 'Rôle invalide.' };

  const { data, error } = await getAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom, prenom, telephone },
  });

  if (error || !data.user) {
    return { error: error?.message ?? 'Création impossible.' };
  }

  // Le trigger handle_new_user crée le profil en client/approved : on corrige le rôle
  const { error: updateError } = await getAdminClient()
    .from('profiles')
    .update({ role, status: 'approved', nom, prenom, telephone })
    .eq('id', data.user.id);

  if (updateError) {
    // Ne pas laisser un compte à moitié configuré : on le supprime
    await getAdminClient().auth.admin.deleteUser(data.user.id);
    return { error: `Profil non configuré : ${updateError.message}` };
  }

  revalidatePath('/admin/managers');
  return { success: true };
}