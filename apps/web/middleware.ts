import { type NextRequest } from 'next/server';
import { guardRequest } from '@repo/auth';
import { AUTH_COOKIE_NAME } from '@repo/database';

export function middleware(request: NextRequest) {
  return guardRequest(request, {
    allowedRoles: ['client', 'livreur', 'admin'],
    routeRules : [
      { prefix: '/livraisons', roles: ['livreur'] },
    ],
    loginPath: '/',
    forbiddenPath: '/unauthorized',
    cookieName: AUTH_COOKIE_NAME,
  });
}

export const config = {
  matcher: ['/account/:path*', '/dashboard/:path*', '/livraisons/:path*', '/wishlist/:path*'],
};