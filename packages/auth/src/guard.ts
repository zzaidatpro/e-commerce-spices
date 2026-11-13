import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export type UserRole = 'admin' | 'manager' | 'client' | 'livreur';
const ROLES: readonly UserRole[] = ['admin', 'manager', 'client', 'livreur'];

export function isUserRole(value: unknown): value is UserRole {
  return ROLES.includes(value as UserRole);
}

export interface RouteRule {
  prefix: string;
  roles: readonly UserRole[];
}

export interface GuardOptions {
  allowedRoles: readonly UserRole[];
  routeRules?: readonly RouteRule[];
  loginPath: string;
  forbiddenPath: string;
  cookieName: string;
}

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + '/');
}

export async function guardRequest(request: NextRequest, opts: GuardOptions) {
  const log = (label: string, extra?: unknown) => {
    // eslint-disable-next-line no-console
    console.log('[guard]', label, request.nextUrl.pathname, extra ?? '');
  };

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: opts.cookieName },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    log('SORTIE login: pas d utilisateur');
    return NextResponse.redirect(new URL(opts.loginPath, request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  log('profil lu', { profile, profileError: profileError?.message, userId: user.id });

  const profileRole: unknown = profile?.role;

  if (!profile || profile.status !== 'approved' || !isUserRole(profileRole)) {
    log('SORTIE statut ou profil', { status: profile?.status, role: profileRole });
    return NextResponse.redirect(new URL(opts.forbiddenPath, request.url));
  }

  const role: UserRole = profileRole;

  if (!opts.allowedRoles.includes(role)) {
    log('SORTIE role non autorise', { role, allowedRoles: opts.allowedRoles });
    return NextResponse.redirect(new URL(opts.forbiddenPath, request.url));
  }

  const path = request.nextUrl.pathname;
  const rule = opts.routeRules
    ?.filter((r) => matchesPrefix(path, r.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (rule && !rule.roles.includes(role)) {
    log('SORTIE regle de route', { role, rule });
    return NextResponse.redirect(new URL(opts.forbiddenPath, request.url));
  }

  log('ACCES AUTORISE', { role });
  return response;
}
