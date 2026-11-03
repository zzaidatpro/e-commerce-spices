'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      auth : {
        flowType : 'pkce',

      },  
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    
    redirectTo: `http://localhost:3001/auth/callback?next=/resetPassword/update`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Email de réinitialisation envoyé avec succès !" };
}