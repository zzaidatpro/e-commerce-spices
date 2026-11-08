import { type NextRequest } from 'next/server';
import { guardRequest } from '@repo/auth';

export function middleware(request: NextRequest) {
  return guardRequest(request, {
    allowedRoles: ['admin', 'manager'],
    adminOnlyPrefixes: ['/admin/settings'], 
    loginPath: '/login',
    forbiddenPath: '/unauthorized',
    cookieName: 'sb-admin-auth',
  });
}

export const config = {
 
  matcher: ['/((?!login|unauthorized|_next/static|_next/image|favicon.ico).*)'],
};