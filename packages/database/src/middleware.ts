import { createServerClient} from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { Database } from "./types/db.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string}[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          
          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value}) => {
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Crucial : Rafraîchit le jeton d'authentification s'il a expiré
  const { data: { user } } = await supabase.auth.getUser();

  return { supabase, response: supabaseResponse, user };
}