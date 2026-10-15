import { CookieOptionsWithName, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../types/db.types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet :{ name: string; value: string; options: CookieOptionsWithName }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignoré si appelé depuis un Server Component (géré par le middleware)
          }
        },
      },
    }
  );
}