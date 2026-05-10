/**
 * Promote a registered user to ADMIN by email.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts <email>
 *
 * Example:
 *   npx tsx scripts/promote-admin.ts you@example.com
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

const auth = getAuth()
const db = getFirestore()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx scripts/promote-admin.ts <email>')
    process.exit(1)
  }

  const user = await auth.getUserByEmail(email).catch(() => null)
  if (!user) {
    console.error(`No Firebase Auth user found for ${email}.`)
    console.error('Make sure you have registered an account with this email first at the live URL.')
    process.exit(1)
  }

  const userRef = db.collection('users').doc(user.uid)
  const snap = await userRef.get()
  if (!snap.exists) {
    console.error(`Auth user exists (uid=${user.uid}) but Firestore user doc is missing.`)
    console.error('Sign out + sign back in once at the app, then re-run this script.')
    process.exit(1)
  }

  const before = snap.data()?.role
  await userRef.update({ role: 'ADMIN' })
  // Revoke any existing sessions so the new role takes effect on next sign-in.
  await auth.revokeRefreshTokens(user.uid).catch(() => {})

  console.log(`✓ ${email} promoted: role ${before ?? '(unset)'} → ADMIN`)
  console.log(`  Sessions revoked — sign out and sign back in for the change to apply.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
