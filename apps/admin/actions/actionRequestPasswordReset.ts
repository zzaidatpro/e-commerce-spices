"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Veuillez saisir une adresse e-mail valide." };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_SUPABASE_URL!, process.env.NEXT_SUPABASE_ANON_KEY!, {
    auth: {
      flowType: "pkce",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3001/auth/callback?next=/resetPassword/update",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
