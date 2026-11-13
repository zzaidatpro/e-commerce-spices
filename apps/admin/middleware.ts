import { type NextRequest } from 'next/server';
import { guardRequest } from '@repo/auth';
import { AUTH_COOKIE_NAME } from '@repo/database';

export function middleware(request: NextRequest) {
  return guardRequest(request, {
    allowedRoles: ['admin', 'manager'],
    routeRules: [
      { prefix: '/admin/settings', roles: ['admin'] },
      { prefix: '/admin/users', roles: ['admin'] },
      { prefix: '/admin/products', roles: ['admin'] },

    ],
    loginPath: '/login',
    forbiddenPath: '/unauthorized',
    cookieName: AUTH_COOKIE_NAME,
  });
}

export const config = {
   matcher: [
    '/((?!login|register|unauthorized|auth|resetPassword|password-recovery|_next/static|_next/image|favicon.ico).*)',
  ],
};