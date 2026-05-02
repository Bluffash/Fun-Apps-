import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from './ProfileForm'
import { SportPickerProfile } from './SportPickerProfile'
import { formatDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [user, sports, userSports] = await Promise.all([
    (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, role: true },
    }),
    (prisma as any).sport.findMany({ orderBy: { name: 'asc' } }),
    (prisma as any).userSport.findMany({
      where: { userId: session.user.id },
      select: { sportId: true },
    }),
  ])

  const sportMap = Object.fromEntries(sports.map((s: any) => [s.slug, s.id]))
  const selectedSportIds = userSports.map((us: any) => us.sportId)

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Member since {formatDate(user.createdAt)} · {user.role}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Personal Info</h2>
        <ProfileForm initial={{ name: user.name, phone: user.phone ?? '', email: user.email }} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Sport Interests</h2>
          <p className="text-muted-foreground text-sm mt-1">
            These determine which players you can invite and which games you see first.
          </p>
        </div>
        <SportPickerProfile sportMap={sportMap} initialSelected={selectedSportIds} />
      </div>
    </div>
  )
}
