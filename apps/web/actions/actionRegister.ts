'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerUser(formData: FormData) {
  const cookieStore = await cookies();

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
          } catch {}
        },
      },
    }
  );

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 1. Création du compte d'authentification
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Erreur lors de l'inscription.");
  }

  // 2. Insertion minimale dans la table 'profiles' (optionnel si géré par un Trigger Supabase)
  await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email,
    role: 'user',
  });

  redirect('/dashboard');
}