'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Calendar, Newspaper, Shield, LogOut, Menu, X, Mail, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/schedule" className="text-xl font-bold text-primary">
              🏆 SportsPick
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
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingInvites > 0 && (
              <Link href="/invites" className="relative inline-flex items-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {pendingInvites}
                </span>
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/profile">
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition-all">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <span className="text-sm font-medium hidden lg:block">{userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
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
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          <div className="border-t pt-2 mt-2 space-y-1">
            <Link
              href="/profile"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith('/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              )}
              onClick={() => setMobileOpen(false)}
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </Link>
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
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
