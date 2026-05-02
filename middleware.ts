import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuth = !!req.auth
  const pathname = req.nextUrl.pathname

  const protectedPaths = ['/schedule', '/feed', '/admin', '/onboarding', '/invites', '/profile']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/admin')) {
    const role = req.auth?.user?.role
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/schedule', req.url))
    }
  }
})

export const config = {
  matcher: ['/schedule/:path*', '/feed/:path*', '/admin/:path*', '/onboarding/:path*', '/invites/:path*', '/profile/:path*'],
}
