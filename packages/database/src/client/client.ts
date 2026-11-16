import { createBrowserClient } from '@supabase/ssr';
import { Database } from "../types/db.types";
import { AUTH_COOKIE_NAME } from './constants';

export function createUserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
    },
  );
}
