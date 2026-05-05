import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { OnboardingForm } from './OnboardingForm'
import { SPORTS } from '@/lib/constants'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // sportMap maps slug → slug (Firestore sport docs use slug as ID)
  const sportMap = Object.fromEntries(SPORTS.map((s) => [s.slug, s.slug]))

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose your sports</h1>
        <p className="text-muted-foreground mt-2">
          Select the sports you&apos;re interested in. You&apos;ll see games and can invite players based on your choices.
        </p>
      </div>
      <OnboardingForm sportMap={sportMap} />
    </div>
  )
}
