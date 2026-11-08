import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export type UserRole = 'admin' | 'manager' | 'client';
const ROLES: readonly UserRole[] = ['admin', 'manager', 'client'];

export function isUserRole(value: unknown): value is UserRole {
  return ROLES.includes(value as UserRole);
}

export interface GuardOptions {
  allowedRoles: readonly UserRole[];
  adminOnlyPrefixes?: readonly string[];
  loginPath: string;
  forbiddenPath: string;
  cookieName: string;
}

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + '/');
}

export async function guardRequest(request: NextRequest, opts: GuardOptions) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL(opts.loginPath, request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (
    !profile ||
    profile.status !== 'approved' ||
    !isUserRole(profile.role) ||
    !opts.allowedRoles.includes(profile.role)
  ) {
    return NextResponse.redirect(new URL(opts.forbiddenPath, request.url));
  }

  const path = request.nextUrl.pathname;
  const adminOnly = opts.adminOnlyPrefixes?.some((p) => matchesPrefix(path, p)) ?? false;
  if (adminOnly && profile.role !== 'admin') {
    return NextResponse.redirect(new URL(opts.forbiddenPath, request.url));
  }

  return response;
}