import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasAccessToRoute, type UserRole } from './rbac';

export interface SharedMiddlewareOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
  loginPath?: string;
  unauthorizedPath?: string;
}

export async function updateSession(
  request: NextRequest,
  options: SharedMiddlewareOptions
) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const {
    supabaseUrl,
    supabaseAnonKey,
    loginPath = '/login',
    unauthorizedPath = '/',
  } = options;

  // Création du client Supabase avec gestion des cookies SSR et typage explicite
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. Récupération de l'utilisateur authentifié
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: UserRole = 'guest';

  // 2. Si l'utilisateur est connecté, on interroge la table 'profiles' pour son rôle
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    userRole = (profile?.role as UserRole) || 'user';
  }

  const pathname = request.nextUrl.pathname;
  const isAllowed = hasAccessToRoute(userRole, pathname);

  if (!isAllowed) {    
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }   
    const url = request.nextUrl.clone();
    url.pathname = unauthorizedPath;
    return NextResponse.redirect(url);
  }

  return response;
}