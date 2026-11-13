import type { CookieOptions } from '@supabase/ssr';

// supprimé à la fermeture
export function sessionCookieOptions(options: CookieOptions, value: string): CookieOptions {
  const copie: CookieOptions = { ...options, path: '/' };

  if (value === '') return copie;

  delete copie.maxAge;
  delete copie.expires;
  return copie;
}