'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';

export async function updatePasswordAction(formData: FormData) {
  const newPassword = formData.get('newPassword') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  const cookieStore = await cookies();

  // implementation des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            
          }
        },
      },
    }
  );

  // nouveau mot de passe 
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: "Mise a jour mot de passe impossible : " + error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}