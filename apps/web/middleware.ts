import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasAccessToRoute, type UserRole } from "@repo/auth";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Récupération de l'utilisateur authentifié
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: UserRole = "guest";

  // 2. Si l'utilisateur est connecté, on va chercher son rôle dans la table profiles
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = (profile?.role as UserRole) || "user";
  }

  const pathname = request.nextUrl.pathname;

  // 3. Vérification des accès via votre fonction RBAC
  const isAllowed = hasAccessToRoute(userRole, pathname);

  if (!isAllowed) {
    if (!user) {
      // S'il n'est pas connecté, on le redirige vers /login avec l'URL de retour
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    // S'il est connecté mais n'a pas les droits, on le redirige vers l'accueil
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Applique le middleware sur toutes les routes,
     * tout en ignorant les fichiers statiques, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};