'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@repo/database/server';

export type LoginState = { success: boolean; message: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: 'Email ou mot de passe incorrect.' };
  }

  redirect('/dashboard');
}