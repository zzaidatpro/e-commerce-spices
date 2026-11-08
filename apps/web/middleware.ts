import { type NextRequest } from 'next/server';
import { guardRequest } from '@repo/auth';

export function middleware(request: NextRequest) {
  return guardRequest(request, {
    allowedRoles: ['client'],
    loginPath: '/login',
    forbiddenPath: '/unauthorized',
    cookieName: 'sb-web-auth',
  });
}

export const config = {
  matcher: ['/account/:path*'], // seules les routes client sont protégées
};