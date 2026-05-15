import { adminDb } from '@/lib/firebase-admin'
import { webpush } from '@/lib/web-push'

interface PushPayload {
  title: string
  body: string
  url: string
}

// Send a push notification to every device registered for a single user.
// Cleans up dead subscriptions (404/410) so they don't keep failing forever.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const subsSnap = await adminDb
      .collection('users').doc(userId)
      .collection('pushSubscriptions').get()
    const json = JSON.stringify(payload)
    await Promise.allSettled(
      subsSnap.docs.map(async (subDoc) => {
        const { subscription } = subDoc.data()
        try {
          await webpush.sendNotification(subscription, json)
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await subDoc.ref.delete().catch(() => {})
          }
        }
      })
    )
  } catch {
    // Non-critical — never let push failures break the calling request.
  }
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  await Promise.allSettled(userIds.map((id) => sendPushToUser(id, payload)))
}

// Push to every user who follows a given sport. Used when a new game is created.
export async function notifySportInterested(
  sportSlug: string,
  payload: PushPayload
) {
  try {
    const usersSnap = await adminDb
      .collection('users')
      .where('sportIds', 'array-contains', sportSlug)
      .get()
    await sendPushToUsers(usersSnap.docs.map((d) => d.id), payload)
  } catch {
    // Non-critical
  }
}

export async function getRosterUserIds(slotId: string): Promise<string[]> {
  const snap = await adminDb
    .collection('gameSlots').doc(slotId)
    .collection('rosters').get()
  return snap.docs.map((d) => d.id)
}
