import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin/slots', label: 'Game Slots' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/flags', label: 'Flagged Chat' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/schedule')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">Moderation and user management</p>
      </div>
      <nav className="flex gap-1 border-b pb-0">
        {adminNav.map(({ href, label }) => (
          <AdminNavLink key={href} href={href} label={label} />
        ))}
      </nav>
      {children}
    </div>
  )
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
        'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
      )}
    >
      {label}
    </Link>
  )
}
