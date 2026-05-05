import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const session = req.cookies.get('__session')?.value
  const pathname = req.nextUrl.pathname

  const protectedPaths = ['/schedule', '/feed', '/admin', '/onboarding', '/invites', '/profile']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/schedule/:path*',
    '/feed/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/invites/:path*',
    '/profile/:path*',
  ],
}
