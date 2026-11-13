import { createBrowserClient } from '@supabase/ssr';
import { AUTH_COOKIE_NAME } from './constants';

export function createUserClient() {
  return createBrowserClient(process.env.NEXT_SUPABASE_URL!, process.env.NEXT_SUPABASE_ANON_KEY!, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
  });
}
