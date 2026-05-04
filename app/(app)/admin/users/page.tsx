import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { AdminUserActions } from './AdminUserActions'
import { formatDate } from '@/lib/utils'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/schedule')

  const users = await (prisma as any).user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { gameRosters: true, createdSlots: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{users.length} registered users</p>
      <div className="space-y-2">
        {users.map((user: any) => (
          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-card">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{user.name}</span>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              {user.phone && <div className="text-sm text-muted-foreground">{user.phone}</div>}
              <div className="text-xs text-muted-foreground mt-0.5">
                Joined {formatDate(user.createdAt, 'MMM d, yyyy')} · {user._count.gameRosters} games · {user._count.createdSlots} slots created
              </div>
            </div>
            <AdminUserActions
              userId={user.id}
              currentRole={user.role}
              isSelf={user.id === session.user.id}
            />
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No users yet.</div>
        )}
      </div>
    </div>
  )
}
