'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from './helper';
import { adminClient } from '@/lib/supabase/admin';
import { ROLES, STATUTS_UTILISATEUR, type Role, type StatutUtilisateur } from '@/lib/permissions';

async function requireAdmin() {
  return requireRole(['admin']).catch(() => null);
}

export async function createUserAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth) return { error: 'Accès refusé.' };

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nom = String(formData.get('nom') ?? '').trim();
  const prenom = String(formData.get('prenom') ?? '').trim();
  const telephone = String(formData.get('telephone') ?? '').trim();
  const role = String(formData.get('role') ?? '') as Role;
  const status = String(formData.get('status') ?? 'approved') as StatutUtilisateur;

  if (!email || !nom || !prenom || password.length < 8) {
    return { error: 'Champs invalides (mot de passe : 8 caractères minimum).' };
  }
  if (!ROLES.includes(role)) return { error: 'Rôle invalide.' };
  if (!STATUTS_UTILISATEUR.includes(status)) return { error: 'Statut invalide.' };

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom, prenom, telephone },
  });
  if (error || !data.user) return { error: error?.message ?? 'Création impossible.' };

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role, status })
    .eq('id', data.user.id);
  if (updateError) return { error: updateError.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const auth = await requireAdmin();
  if (!auth) return { error: 'Accès refusé.' };

  const role = String(formData.get('role') ?? '') as Role;
  if (!ROLES.includes(role)) return { error: 'Rôle invalide.' };
  if (userId === auth.user.id && role !== 'admin') {
    return { error: 'Vous ne pouvez pas retirer votre propre rôle admin.' };
  }

  const { error } = await auth.supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserStatusAction(userId: string, status: string) {
  const auth = await requireAdmin();
  if (!auth) return { error: 'Accès refusé.' };

  if (!STATUTS_UTILISATEUR.includes(status as StatutUtilisateur)) return { error: 'Statut invalide.' };
  if (userId === auth.user.id) return { error: 'Vous ne pouvez pas modifier votre propre statut.' };

  const { error } = await auth.supabase.from('profiles').update({ status }).eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const auth = await requireAdmin();
  if (!auth) return { error: 'Accès refusé.' };
  if (userId === auth.user.id) return { error: 'Vous ne pouvez pas supprimer votre propre compte.' };

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}