'use server';

import { createClient } from '@repo/database/server';

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: 'Veuillez saisir votre adresse email.' };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/resetPassword/update`,
  });

  if (error) return { error: error.message };

  return { success: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' };
}