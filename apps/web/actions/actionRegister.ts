'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';

export type RegisterState = { success: boolean; message: string };

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
  ): Promise<RegisterState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email) {
  return { success: false, message: 'Veuillez saisir votre adresse e-mail.' };
  }
  if (password.length < 8) {
    return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { success: false, message: error?.message ?? "Erreur lors de l'inscription." };
  }

  if (!data.session) {
    return {
      success: true,
      message: 'Vérifiez votre boîte mail pour confirmer votre compte.',
    };
  }

  // Le profil est créé par le trigger handle_new_user
  redirect('/dashboard');
}