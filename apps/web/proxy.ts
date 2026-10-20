import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type {Database} from "@repo/database"; 

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 1. Initialisation du client Supabase dans le Proxy
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 2. Vérification et rafraîchissement de la session utilisateur
  // Note: getUser() est plus sécurisé que getSession() dans un middleware / proxy
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname === "/login";

  // 3. Gestion de la protection des routes (RBAC)

  // Cas A : Utilisateur NON connecté tentant d'accéder à une page protégée
  if (!user && !isLoginPage) {
    url.pathname = "/login";
    // Conserver la destination initiale pour redirection post-connexion
    //url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Cas B : Utilisateur CONNECTÉ
  if (user) {
    // Vérification du rôle d'administration (ex: stocké dans app_metadata ou la table profiles)
    const userRole = user.app_metadata?.role || "user";

    // Si l'utilisateur n'a pas le rôle 'admin', refuser l'accès aux routes protégées
    if (userRole !== "admin" && !isLoginPage) {
      url.pathname = "/unauthorized"; // Redirection vers une page d'accès refusé
      return NextResponse.redirect(url);
    }

    // Rediriger vers le dashboard s'il essaie d'aller sur /login alors qu'il est déjà connecté en admin
    if (isLoginPage && userRole === "admin") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// 4. Matcher : Intercepter uniquement les routes de l'application (en ignorant les fichiers statiques)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};