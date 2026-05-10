import webpush from 'web-push'

// VAPID secrets are RUNTIME-only on App Hosting, so they're undefined during
// the static build. Skip configuration when any are missing — sendNotification
// will throw at runtime if called without configuration, which the slots route
// already swallows in its try/catch.
const email = process.env.VAPID_EMAIL
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

if (email && publicKey && privateKey) {
  webpush.setVapidDetails(email, publicKey, privateKey)
}

export { webpush }
