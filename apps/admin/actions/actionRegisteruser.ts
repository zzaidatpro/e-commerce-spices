'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function registerUser(formData: FormData) {
  const nom = formData.get('nom') as string;
  const prenom = formData.get('prenom') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const telephone = formData.get('telephone') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const date_naissance = formData.get('date_naissance') as string;
  const role = formData.get('role') as string;

  if (!nom || !prenom || !email || !password || !telephone || !date_naissance) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );


  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Erreur lors de la création de l'utilisateur." };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      nom,
      prenom,
      telephone,
      whatsapp: whatsapp || telephone, 
      date_naissance,
      role: role || 'manager',
      status: 'pending', 
    });

  if (profileError) {
    return { error: profileError.message };
  }

  return { success: true };
}