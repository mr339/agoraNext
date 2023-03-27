import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('user');
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

/**
 * Add all the protected routes here in the matcher.
 */
export const config = {
  matcher: ['/', '/home', '/call-now/:path*'],
};
