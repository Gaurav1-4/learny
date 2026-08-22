import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Check for gaha subdomain (handles local gaha.localhost:3000 and prod gaha.zorx.tech)
  if (hostname.startsWith('gaha.')) {
    // Rewrite all paths on the gaha subdomain to the /gaha-app directory
    return NextResponse.rewrite(new URL(`/gaha-app${url.pathname}`, req.url));
  }

  // Otherwise, it's Learny, proceed normally.
  return NextResponse.next();
}
