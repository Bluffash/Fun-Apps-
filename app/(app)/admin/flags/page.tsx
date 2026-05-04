import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminFlagActions } from './AdminFlagActions'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Flag } from 'lucide-react'

export default async function AdminFlagsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/schedule')

  const flagged = await (prisma as any).chatMessage.findMany({
    where: { flagged: true },
    include: {
      user: { select: { id: true, name: true } },
      gameSlot: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {flagged.length} flagged {flagged.length === 1 ? 'message' : 'messages'}
      </p>
      <div className="space-y-3">
        {flagged.map((msg: any) => (
          <div key={msg.id} className="p-4 border rounded-lg bg-card border-destructive/40">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Flag className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <span className="font-medium text-sm">{msg.user.name}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <Link
                    href={`/schedule/${msg.gameSlot.id}`}
                    className="text-xs text-primary hover:underline truncate"
                  >
                    {msg.gameSlot.title}
                  </Link>
                </div>
                <p className="text-sm bg-muted rounded px-3 py-2 break-words">{msg.body}</p>
                <AdminFlagActions messageId={msg.id} />
              </div>
            </div>
          </div>
        ))}
        {flagged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No flagged messages. All clear.
          </div>
        )}
      </div>
    </div>
  )
}
