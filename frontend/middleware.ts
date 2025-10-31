import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force public NIHB and Web Orders paths to admin equivalents
  if (pathname.startsWith('/nihb')) {
    const redirected = new URL(`/admin${pathname}`, request.url);
    return NextResponse.redirect(redirected);
  }
  if (pathname.startsWith('/web-orders')) {
    const redirected = new URL(`/admin${pathname}`, request.url);
    return NextResponse.redirect(redirected);
  }

  // Only protect admin routes
  if (pathname.startsWith('/admin') && 
      !pathname.startsWith('/admin/login')) {
    
    const authenticated = await isAuthenticated(request);
    
    if (!authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/nihb/:path*', '/web-orders/:path*']
};
