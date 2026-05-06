import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// On Firebase App Hosting, Application Default Credentials are injected
// automatically. Locally, fall back to explicit service account env vars.
function createAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  }

  // App Hosting / Cloud Run: use ADC (no credentials needed)
  return initializeApp({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? 'my-claude-build' })
}

const adminApp = createAdminApp()
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
