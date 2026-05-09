'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { Calendar, Newspaper, Shield, LogOut, Menu, X, Mail, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from './ThemeToggle'
import { AnimatedLogo } from './AnimatedLogo'
import { cn, initials } from '@/lib/utils'
import { useState } from 'react'

interface NavbarProps {
  userName: string
  userRole: string
  pendingInvites?: number
}

const navLinks = [
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/feed', label: 'News & Scores', icon: Newspaper },
  { href: '/invites', label: 'Invites', icon: Mail },
]

export function Navbar({ userName, userRole, pendingInvites = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut(firebaseAuth)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 nav-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/schedule">
              <AnimatedLogo />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {userRole === 'ADMIN' && (
                <Link
                  href="/admin/slots"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingInvites > 0 && (
              <Link href="/invites" className="relative inline-flex items-center p-2">
                <Mail className="w-5 h-5 text-white/70" />
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {pendingInvites}
                </span>
              </Link>
            )}
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Link href="/profile">
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition-all">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <span className="text-sm font-medium text-white/80 hidden lg:block">{userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 nav-dark px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {userRole === 'ADMIN' && (
            <Link
              href="/admin/slots"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
            <Link
              href="/profile"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith('/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setMobileOpen(false)}
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white/80">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
