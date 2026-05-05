import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ProfileForm } from './ProfileForm'
import { SportPickerProfile } from './SportPickerProfile'
import { formatDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SPORTS } from '@/lib/constants'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const doc = await adminDb.collection('users').doc(session.user.id).get()
  const user = doc.exists ? doc.data()! : {}

  const sportMap = Object.fromEntries(SPORTS.map((s) => [s.slug, s.slug]))
  const selectedSportIds: string[] = (user as any).sportIds ?? []

  const createdAt = (user as any).createdAt instanceof Timestamp
    ? (user as any).createdAt.toDate()
    : new Date()

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Member since {formatDate(createdAt)} · {session.user.role}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Personal Info</h2>
        <ProfileForm initial={{
          name: (user as any).name ?? session.user.name,
          phone: (user as any).phone ?? '',
          email: session.user.email,
        }} />
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
