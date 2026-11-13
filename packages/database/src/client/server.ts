import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from './constants';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_ANON_KEY!,

    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, path: '/' }),
            );
          } catch {
            // Ignoré dans un Server Component en lecture seule
          }
        },
      },
    },
  );
}
