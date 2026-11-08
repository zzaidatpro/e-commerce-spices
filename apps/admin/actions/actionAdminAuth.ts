'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user || !authData.session) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: 'Profil introuvable.' };
  }

  if (profile.status !== 'approved') {
    await supabase.auth.signOut();
    return { error: "Votre compte est en attente de validation par un administrateur." };
  }

  const userRole = profile.role;

  if (userRole !== 'admin' && userRole !== 'manager') {
    await supabase.auth.signOut();
    return { error: "Accès refusé. Privilèges insuffisants." };
  }


  cookieStore.set({
    name: 'admin_session',
    value: authData.session.access_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 jour
    sameSite: 'strict',
  });


  if (userRole === 'admin') {
    redirect('/admin');
  } else {
    redirect('/manager');
  }
}