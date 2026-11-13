'use server';

import { createClient } from '@repo/database/server';

export async function registerUser(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  const prenom = String(formData.get('prenom') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const telephone = String(formData.get('telephone') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').trim();
  const date_naissance = String(formData.get('date_naissance') ?? '');

  if (!nom || !prenom || !email || !password || !telephone || !date_naissance) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom,
        prenom,
        telephone,
        whatsapp: whatsapp || telephone,
        date_naissance,
      },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Erreur lors de la création du compte.' };
  }

  return {
    success: true,
    message: 'Compte créé. Il sera activé après validation par un administrateur.',
  };
}