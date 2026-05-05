/**
 * Seeds Firestore with an admin user.
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/seed-firestore.ts
 *
 * Prerequisites:
 *   - FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY set in .env.local
 *   - Firebase Auth: Email/Password provider enabled
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

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

const ADMIN_EMAIL = 'admin@sportsapp.com'
const ADMIN_PASSWORD = 'Admin1234!'
const ADMIN_NAME = 'App Admin'

async function seed() {
  console.log('Seeding Firestore...')

  // Create or get admin Firebase Auth user
  let uid: string
  try {
    const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL)
    uid = existing.uid
    console.log(`Admin user already exists: ${uid}`)
  } catch {
    const created = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
    })
    uid = created.uid
    console.log(`Created admin Firebase Auth user: ${uid}`)
  }

  // Upsert admin Firestore doc
  await db.collection('users').doc(uid).set(
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: null,
      role: 'ADMIN',
      sportIds: [],
      followedLeagues: [],
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  console.log(`Admin user doc written to Firestore.`)

  console.log('\nDone! Admin credentials:')
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
