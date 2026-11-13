'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', authData.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: 'Profil introuvable.' };
  }

  if (profile.status !== 'approved') {
    await supabase.auth.signOut();
    return { error: 'Votre compte est en attente de validation par un administrateur.' };
  }

  if (profile.role !== 'admin' && profile.role !== 'manager') {
    await supabase.auth.signOut();
    return { error: 'Accès refusé. Privilèges insuffisants.' };
  }

  redirect('/admin');
}