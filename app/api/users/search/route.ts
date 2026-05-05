import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const slotId = searchParams.get('slotId')
  if (!slotId) return NextResponse.json({ error: 'slotId required' }, { status: 400 })

  // Get slot to find its sportSlug
  const slotDoc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!slotDoc.exists) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  const slot = slotDoc.data()!
  const sportSlug: string = slot.sportSlug

  // Get the current user's sportIds array
  const currentUserDoc = await adminDb.collection('users').doc(session.user.id).get()
  const currentUserData = currentUserDoc.exists ? currentUserDoc.data()! : {}
  const mySportIds: string[] = currentUserData.sportIds ?? []

  // Determine which sport slug to filter by — prefer the slot's sport, fall back to any of user's sports
  // Use the slot's sportSlug as the primary filter (most relevant)
  const filterSlug = sportSlug || (mySportIds.length > 0 ? mySportIds[0] : null)
  if (!filterSlug) {
    return NextResponse.json([])
  }

  // Find users who play this sport
  const usersSnap = await adminDb
    .collection('users')
    .where('sportIds', 'array-contains', filterSlug)
    .get()

  // Collect IDs already on the roster
  const rosterSnap = await adminDb
    .collection('gameSlots')
    .doc(slotId)
    .collection('rosters')
    .get()
  const rosterUserIds = new Set(rosterSnap.docs.map((d) => d.id))

  // Collect IDs with pending invites
  const pendingInviteSnap = await adminDb
    .collection('invites')
    .where('gameSlotId', '==', slotId)
    .where('status', '==', 'PENDING')
    .get()
  const pendingRecipientIds = new Set(
    pendingInviteSnap.docs
      .map((d) => d.data().recipientId as string | null)
      .filter((id): id is string => id !== null)
  )

  const excluded = new Set([session.user.id, ...Array.from(rosterUserIds), ...Array.from(pendingRecipientIds)])

  const users = usersSnap.docs
    .filter((doc) => !excluded.has(doc.id))
    .slice(0, 20)
    .map((doc) => ({
      id: doc.id,
      name: doc.data().name as string,
    }))

  return NextResponse.json(users)
}
