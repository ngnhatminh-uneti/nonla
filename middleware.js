import { NextResponse } from 'next/server';

export function middleware(request) {
  const strictGeo = process.env.GEO_STRICT !== 'false';
  if (!strictGeo) return NextResponse.next();

  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
  if (country && country.toUpperCase() !== 'VN') {
    return NextResponse.redirect(new URL('/geo-block', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
