import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { Badge } from '@/components/ui/badge'
import { AdminUserActions } from './AdminUserActions'
import { formatDate } from '@/lib/utils'
import { SPORTS } from '@/lib/constants'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/schedule')

  const snap = await adminDb.collection('users').orderBy('createdAt', 'asc').get()
  const users = snap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? null,
      role: data.role ?? 'USER',
      blocked: data.blocked ?? false,
      sportIds: (data.sportIds ?? []) as string[],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    }
  })

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{users.length} registered users</p>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-card">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{user.name}</span>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                {user.blocked && <Badge variant="destructive">Blocked</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              {user.phone && <div className="text-sm text-muted-foreground">{user.phone}</div>}
              <div className="text-xs text-muted-foreground mt-0.5">
                Joined {formatDate(user.createdAt, 'MMM d, yyyy')}
              </div>
              {user.sportIds.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  {user.sportIds.map((slug) => {
                    const sport = SPORTS.find((s) => s.slug === slug)
                    return sport ? (
                      <span key={slug} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                        {sport.icon} {sport.name}
                      </span>
                    ) : null
                  })}
                </div>
              )}
              {user.sportIds.length === 0 && (
                <div className="text-xs text-muted-foreground/60 mt-1">No sports selected</div>
              )}
            </div>
            <AdminUserActions userId={user.id} currentRole={user.role} blocked={user.blocked} isSelf={user.id === session.user.id} />
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No users yet.</div>
        )}
      </div>
    </div>
  )
}
