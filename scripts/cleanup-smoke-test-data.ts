/**
 * One-shot cleanup of data created by smoke testing.
 *
 * Removes:
 *   - Any Firebase Auth user whose email matches a smoke-test pattern
 *     (smoke-*@example.com, fullflow-*@example.com, etc.)
 *   - Their Firestore /users/{uid} doc (and pushSubscriptions subcollection)
 *   - Every gameSlot whose creatorId matched one of those users
 *     (and its rosters/messages/invites subcollections)
 *
 * Run with: npx tsx scripts/cleanup-smoke-test-data.ts
 *   add --dry-run to preview without deleting.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const adminAuth = getAuth()
const db = getFirestore()

const DRY_RUN = process.argv.includes('--dry-run')

// Smoke-test users are recognizable by their email patterns.
const EMAIL_PATTERNS = [
  /^smoke-\d+@example\.com$/i,
  /^fullflow-\d+@example\.com$/i,
  /^test-\d+@example\.com$/i,
]

function looksLikeSmokeTestEmail(email: string | undefined) {
  if (!email) return false
  return EMAIL_PATTERNS.some((re) => re.test(email))
}

async function deleteSubcollections(slotId: string) {
  for (const sub of ['rosters', 'messages', 'invites']) {
    const snap = await db.collection('gameSlots').doc(slotId).collection(sub).get()
    if (snap.empty) continue
    const batch = db.batch()
    snap.docs.forEach((d) => batch.delete(d.ref))
    if (!DRY_RUN) await batch.commit()
    console.log(`  └─ ${sub}: ${snap.size} doc(s) ${DRY_RUN ? '(would delete)' : 'deleted'}`)
  }
}

async function main() {
  console.log(DRY_RUN ? '== DRY RUN — nothing will be deleted ==' : '== LIVE RUN ==')
  console.log()

  // 1. Find smoke-test Auth users
  const matchedUids = new Set<string>()
  let pageToken: string | undefined
  do {
    const page = await adminAuth.listUsers(1000, pageToken)
    for (const u of page.users) {
      if (looksLikeSmokeTestEmail(u.email)) {
        matchedUids.add(u.uid)
        console.log(`User: ${u.email} (uid=${u.uid})`)
      }
    }
    pageToken = page.pageToken
  } while (pageToken)

  if (matchedUids.size === 0) {
    console.log('No smoke-test users found. Nothing to clean up.')
    return
  }
  console.log()

  // 2. Find slots created by those users (also catch invite docs they sent)
  const slotsSnap = await db.collection('gameSlots').get()
  const slotsToDelete = slotsSnap.docs.filter((d) => matchedUids.has(d.data().creatorId))

  console.log(`Game slots created by smoke users: ${slotsToDelete.length}`)
  for (const slotDoc of slotsToDelete) {
    const data = slotDoc.data()
    console.log(`  • ${slotDoc.id}  "${data.title}"  (${data.sportSlug})`)
    await deleteSubcollections(slotDoc.id)
    if (!DRY_RUN) await slotDoc.ref.delete()
  }
  console.log()

  // 3. Invites sent by or to smoke users
  const invitesSnap = await db.collection('invites').get()
  const invitesToDelete = invitesSnap.docs.filter((d) => {
    const data = d.data()
    return matchedUids.has(data.senderId) || matchedUids.has(data.recipientId)
  })
  console.log(`Invites involving smoke users: ${invitesToDelete.length}`)
  if (!DRY_RUN) {
    for (const inv of invitesToDelete) await inv.ref.delete()
  }
  console.log()

  // 4. Delete user docs (with pushSubscriptions subcollection) and Auth users
  for (const uid of Array.from(matchedUids)) {
    const userRef = db.collection('users').doc(uid)
    const subsSnap = await userRef.collection('pushSubscriptions').get()
    if (!subsSnap.empty && !DRY_RUN) {
      const batch = db.batch()
      subsSnap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
    if (!DRY_RUN) {
      await userRef.delete().catch(() => {})
      await adminAuth.deleteUser(uid).catch(() => {})
    }
    console.log(`User cleaned: ${uid}`)
  }

  console.log()
  console.log(DRY_RUN ? 'Dry run complete. Re-run without --dry-run to actually delete.' : 'Cleanup complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
