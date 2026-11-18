import { type NextRequest } from 'next/server';
import { guardRequest } from '@repo/auth';
import { AUTH_COOKIE_NAME } from '@repo/database';

export function middleware(request: NextRequest) {
  return guardRequest(request, {
    // Le web accueille que les clients et les livreurs
    allowedRoles: ['client', 'livreur'],
    routeRules: [
      { prefix: '/livraisons', roles: ['livreur'], forbiddenPath: '/dashboard' },
      { prefix: '/dashboard', roles: ['client'], forbiddenPath: '/livraisons' },
      { prefix: '/orders', roles: ['client'], forbiddenPath: '/livraisons' },
      { prefix: '/wishlist', roles: ['client'], forbiddenPath: '/livraisons' },
      { prefix: '/checkout', roles: ['client'], forbiddenPath: '/livraisons' },
      { prefix: '/account', roles: ['client'], forbiddenPath: '/livraisons' },
    ],
    loginPath: '/',
    forbiddenPath: '/unauthorized',
    cookieName: AUTH_COOKIE_NAME,
  });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/account/:path*',
    '/livraisons/:path*',
  ],
};