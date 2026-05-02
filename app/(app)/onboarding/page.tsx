import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from './OnboardingForm'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const sports = await (prisma as any).sport.findMany({ orderBy: { name: 'asc' } })
  const sportMap = Object.fromEntries(sports.map((s: any) => [s.slug, s.id]))

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose your sports</h1>
        <p className="text-muted-foreground mt-2">
          Select the sports you're interested in. You'll see games and can invite players based on your choices.
        </p>
      </div>
      <OnboardingForm sportMap={sportMap} />
    </div>
  )
}
