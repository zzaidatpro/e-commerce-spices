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

  // 2. Concaténation de l'adresse depuis le formulaire éclaté
  const numero = formData.get('numero') as string;
  const rue = formData.get('rue') as string;
  const cite = formData.get('cite') as string;
  const ville = formData.get('ville') as string;
  const codePostal = formData.get('codePostal') as string;
  const lieu = formData.get('lieu') as string;
  const urlGoogleMap = formData.get('urlGoogleMap') as string;

  const adresseConcatence = [
    numero ? `N° ${numero}` : null,
    rue,
    cite ? `Cité ${cite}` : null,
    ville,
    codePostal,
    lieu ? `(${lieu})` : null,
    urlGoogleMap ? `[GPS: ${urlGoogleMap}]` : null,
  ]
    .filter(Boolean)
    .join(', ');

  // 3. Insertion dans la table 'profiles' avec la colonne unique 'adresse'
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email,
    nom: formData.get('nom'),
    prenom: formData.get('prenom'),
    telephone: formData.get('telephone'),
    whatsapp: formData.get('whatsapp'),
    date_naissance: formData.get('dateNaissance') || null,
    adresse: adresseConcatence,
    role: 'user',
  });

  if (profileError) {
    throw new Error(`Erreur profil : ${profileError.message}`);
  }

  redirect('/dashboard');
}