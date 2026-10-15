// apps/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareSupabaseClient } from '@repo/database'; 

export async function middleware(request: NextRequest) {

  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  if (!user && pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
    return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};