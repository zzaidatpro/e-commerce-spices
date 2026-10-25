'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Utilisateur non authentifié.');
  }

  // Concaténation de la nouvelle adresse
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

  // Mise à jour du profil de l'utilisateur
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      telephone: formData.get('telephone'),
      whatsapp: formData.get('whatsapp'),
      date_naissance: formData.get('dateNaissance') || null,
      adresse: adresseConcatence,
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error(`Erreur mise à jour : ${updateError.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'Profil mis à jour avec succès !' };
}