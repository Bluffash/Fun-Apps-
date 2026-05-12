# SportsPick — Project Summary

## Overview

SportsPick is a mobile-first, full-stack web app for organizing pick-up sports games. Users can browse and join weekly game slots, chat with teammates, invite friends, and follow live sports news and scores.

---

## Authentication

**Auth is required.** Every page except `/login` and `/register` redirects unauthenticated visitors to the login screen.

| Question | Answer |
|---|---|
| Method | Firebase Auth (email + password); user profile/role stored in Firestore `users/{uid}` |
| Session | Firebase Auth ID token exchanged for an HTTP-only `__session` cookie via `/api/auth/session` (14-day expiry); verified server-side with `adminAuth.verifySessionCookie` |
| Route protection | `middleware.ts` redirects unauthenticated visitors to `/login` for `/schedule`, `/feed`, `/admin`, `/onboarding`, `/invites`, `/profile` |
| After login | Redirected to `/schedule` (the main screen) |
| First-time user | After signup, redirected to `/onboarding` to pick sport interests before landing on `/schedule` |
| Blocked users | Flag on `users/{uid}.blocked` — session is rejected at the cookie-verify step |

---

## User Roles

| Role | Who | Capabilities |
|---|---|---|
| **USER** | Everyone who signs up | Create/join/leave games, chat (roster only), invite others, manage own profile |
| **ADMIN** | App creator + anyone the admin promotes | Everything a USER can do, plus full admin panel below |

**Day 1:** The app creator is the only ADMIN. Admins can promote any registered user to ADMIN via the admin panel.

### Admin-only capabilities
- View all registered users with join date, games joined, and slots created
- Promote any user to ADMIN or revoke their admin role
- Remove (delete) any user account (cannot delete own account)
- Edit or delete any game slot (not just their own)
- Review all flagged chat messages across every game
- Dismiss a flag (message reappears in chat) or permanently delete the message
- All three admin sections share a tab nav: Game Slots / Users / Flagged Chat

### Chat flagging (all logged-in roster members)
- Hover over any message you didn't write → a flag icon appears
- Flagged messages are hidden from all regular users at the API level
- Flagged messages remain visible to admins (shown with a warning border)
- Admins can unflag a message directly from the chat or from `/admin/flags`

---

## App Flow — Signup to All Pages

```
┌─────────────────────────────────────────────────────────────────┐
│  New visitor hits any protected URL                             │
│  → redirected to /login                                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │    /login             │
          │  (see mockup below)   │
          └───┬───────────────────┘
              │  No account?
              ▼
          ┌───────────────────────┐
          │    /register          │
          │  (see mockup below)   │
          └───────────┬───────────┘
                      │  Success
                      ▼
          ┌───────────────────────┐
          │    /onboarding        │  ← First-time only
          │  Pick sport interests │
          └───────────┬───────────┘
                      │  Save & continue
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     /schedule  (main screen)                    │
│  Weekly game grid — browse, join, create games                  │
└──┬────────────┬────────────┬────────────┬────────────┬──────────┘
   │            │            │            │            │
   ▼            ▼            ▼            ▼            ▼
/schedule    /schedule    /feed       /invites     /profile
  /new        /[id]
(create)   (game detail)
              │
              ├── Roster
              ├── Chat (roster members only)
              ├── Map embed
              └── Invite friends

ADMIN users also see:
   ▼
/admin/slots   — all slots, edit/delete any
/admin/users   — all users, promote/remove
/admin/flags   — flagged chat messages
```

---

## Screen Mockups

### Login Screen — `/login`

```
┌─────────────────────────────────────┐
│  🏆 SportsPick                      │
│                                     │
│         Welcome back                │
│    Sign in to your account          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Email address              │    │
│  │  you@example.com            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Password                   │    │
│  │  ••••••••                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │       Sign In               │    │  ← primary button
│  └─────────────────────────────┘    │
│                                     │
│  Don't have an account?             │
│  → Create one                       │  ← link to /register
│                                     │
└─────────────────────────────────────┘
```

**Behavior:**
- Wrong credentials → inline error "Invalid email or password"
- Success → redirect to `/schedule` (or the original URL the user was trying to visit)

---

### Sign Up Screen — `/register`

```
┌─────────────────────────────────────┐
│  🏆 SportsPick                      │
│                                     │
│          Create account             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Full name                  │    │
│  │  Jane Smith                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Email address              │    │
│  │  you@example.com            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Phone (optional)           │    │
│  │  +1 555 000 0000            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Password                   │    │
│  │  ••••••••                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │       Create Account        │    │  ← primary button
│  └─────────────────────────────┘    │
│                                     │
│  Already have an account?           │
│  → Sign in                          │  ← link to /login
│                                     │
└─────────────────────────────────────┘
```

**Behavior:**
- Email already taken → inline error
- Success → auto-login → redirect to `/onboarding`

---

### Onboarding — `/onboarding` (first-time only)

```
┌─────────────────────────────────────┐
│  🏆 SportsPick                      │
│                                     │
│  What sports do you play?           │
│  Pick at least one to get started   │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │  ⚽  │ │  🏀  │ │  🎾  │        │
│  │Soccer│ │Bball │ │Tennis│        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │  🏐  │ │  🏈  │ │  ⚾  │        │
│  │Vball │ │FootB │ │BasebL│        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │  🏒  │ │  ⛳  │ │  🏸  │        │
│  │Hockey│ │ Golf │ │Badmtn│        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Save & Go to Schedule     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### Main Screen — `/schedule`

```
┌─────────────────────────────────────────────────────────┐
│ 🏆 SportsPick  Schedule  News  Invites(2)  [avatar]     │  ← navbar
├─────────────────────────────────────────────────────────┤
│  ← May 5 – May 11, 2025 →          [+ Create Game]     │
│                                                         │
│  Filter: All ⚽ 🏀 🎾 🏐 🏈                             │
│                                                         │
│  MON 5    TUE 6    WED 7    THU 8    FRI 9    SAT 10   │
│  ┌──────┐ ┌──────┐          ┌──────┐          ┌──────┐ │
│  │ ⚽   │ │ 🏀   │          │ 🎾   │          │ ⚽   │ │
│  │Soccer│ │Bball │          │Tennis│          │Soccer│ │
│  │7pm   │ │6pm   │          │8am   │          │10am  │ │
│  │8/10  │ │5/8   │          │2/4   │          │3/10  │ │
│  │[Join]│ │[Join]│          │[Full]│          │[Join]│ │
│  └──────┘ └──────┘          └──────┘          └──────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### Game Detail — `/schedule/[id]`

```
┌─────────────────────────────────────────────────────────┐
│ 🏆 SportsPick  Schedule  News  Invites  [avatar]        │
├─────────────────────────────────────────────────────────┤
│  ⚽ Soccer                     [Invite] [Joined ✓] [✏]  │
│  Sunday Morning Soccer                                  │
│  "5-a-side, bring bibs"                                 │
│                                                         │
│  📅 Saturday, May 10, 2025                              │
│  🕙 10:00 AM – 12:00 PM                                 │
│  📍 Riverside Park, Pitch 3                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [OpenStreetMap embed]                          │   │
│  │          ·  Riverside Park                      │   │
│  │    Open in Maps ↗                               │   │
│  └─────────────────────────────────────────────────┘   │
│  ─────────────────────────────────────────────────────  │
│  Roster (3/10)     │  Game Chat                        │
│  ┌──────────────┐  │  ┌──────────────────────────────┐ │
│  │ 1. Jane S.   │  │  │ Jane: anyone bringing a ball?│ │
│  │ 2. Bob K.    │  │  │ Bob:  yes, got it  🚩(hover) │ │
│  │ 3. Mia L.    │  │  │ Mia:  see you there!         │ │
│  │ 4. —         │  │  │                              │ │
│  │ 5. —         │  │  │  [Type a message...]  [Send] │ │
│  └──────────────┘  │  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Chat flag behavior:**
- Hover any message you didn't write → flag icon appears on the right
- Click to flag → message is hidden from all other regular users immediately
- Flagged messages show with a red border for admins; regular users don't see them at all
- Admins can unflag from chat or from the Admin Flagged Chat panel

---

### My Invites — `/invites`

```
┌─────────────────────────────────────┐
│ 🏆 SportsPick                       │
├─────────────────────────────────────┤
│  My Invites                         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ⚽  Sunday Soccer           │    │
│  │     Sat May 10 · 10am       │    │
│  │     Invited by Jane S.      │    │
│  │  [Accept]  [Decline]        │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🏀  Tuesday Pickup Ball     │    │
│  │     Tue May 6 · 6pm         │    │
│  │     Invited by Bob K.       │    │
│  │  [Accept]  [Decline]        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### Profile — `/profile`

```
┌─────────────────────────────────────┐
│ 🏆 SportsPick                       │
├─────────────────────────────────────┤
│  Profile & Settings                 │
│                                     │
│  ┌─ Personal Info ───────────────┐  │
│  │  Name   [Jane Smith        ]  │  │
│  │  Email  jane@example.com      │  │  ← read-only
│  │  Phone  [+1 555 000 0000   ]  │  │
│  │                   [Save]      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─ Sport Interests ─────────────┐  │
│  │  ⚽ ✓  🏀 ✓  🎾    🏐    🏈  │  │
│  │  ⚾    🏒    ⛳    🏸    🏓  │  │
│  │                   [Save]      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

### Admin Panel — `/admin/slots` (ADMIN only)

```
┌─────────────────────────────────────────────────────────┐
│ 🏆 SportsPick  Schedule  News  Invites  Admin  [avatar] │
├─────────────────────────────────────────────────────────┤
│  Admin Panel                                            │
│  [Slots]  [Users]  [Flagged Chat]                       │
│                                                         │
│  All Game Slots                    [+ New Slot]         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Title           Sport  Date      Spots  Creator │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  Sunday Soccer   ⚽     May 10    3/10   Jane   │   │
│  │  [Edit] [Delete]                                │   │
│  │  Tuesday Bball   🏀     May 6     5/8    Bob    │   │
│  │  [Edit] [Delete]                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Admin Users — `/admin/users` (ADMIN only)

```
┌─────────────────────────────────────────────────────────┐
│  Users                                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Name        Email             Role    Actions   │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  Jane Smith  jane@example.com  USER             │   │
│  │  [Make Admin]  [Remove User]                    │   │
│  │  Bob K.      bob@example.com   ADMIN            │   │
│  │  [Revoke Admin]  [Remove User]                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Admin Flagged Chat — `/admin/flags` (ADMIN only)

```
┌─────────────────────────────────────────────────────────┐
│  Admin Panel                                            │
│  [Game Slots]  [Users]  [Flagged Chat]  ← shared tabs  │
├─────────────────────────────────────────────────────────┤
│  3 flagged messages                                     │
│                                                         │
│  ┌─ red border ────────────────────────────────────┐   │
│  │  🚩 Bob K.  ·  2h ago  ·  Sunday Soccer ↗       │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │  "This message was flagged for review"    │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  │  [Dismiss Flag]  [Delete Message]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ red border ────────────────────────────────────┐   │
│  │  🚩 Mia L.  ·  5h ago  ·  Tuesday Bball ↗       │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │  "Another flagged message"                │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  │  [Dismiss Flag]  [Delete Message]               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- **Dismiss Flag** — clears the flag; message reappears in chat for all users
- **Delete Message** — permanently removes the message from the database (with confirmation prompt)

---

## News & Scores Feed — `/feed`

```
┌─────────────────────────────────────────────────────────┐
│ 🏆 SportsPick  Schedule  News  Invites  [avatar]        │
├─────────────────────────────────────────────────────────┤
│  News & Scores          [Split | Scores | News]         │
│  Following: EPL  NBA  NFL  [+ Add League]               │
│                                                         │
│  Latest News            │  Live Scores                  │
│  ┌───────────────────┐  │  ┌───────────────────────┐   │
│  │ [img]             │  │  │ EPL · FT               │   │
│  │ "Liverpool sign…" │  │  │  Arsenal  2–1  Chelsea │   │
│  │ ESPN · 2h ago     │  │  ├───────────────────────┤   │
│  ├───────────────────┤  │  │ NBA · Q3 7:42         │   │
│  │ [img]             │  │  │  Lakers  88–92  Celtics│   │
│  │ "LeBron returns…" │  │  ├───────────────────────┤   │
│  │ ESPN · 4h ago     │  │  │ NFL · Final            │   │
│  └───────────────────┘  │  │  Chiefs 24–17  Bills   │   │
│                         │  └───────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Database | Cloud Firestore (via `firebase-admin`) |
| Auth | Firebase Auth + server-side session cookies (`__session`) |
| Hosting | Firebase App Hosting (Cloud Run, us-central1) |
| Data fetching | SWR (chat polling, live scores) |
| Email | Resend |
| SMS | Twilio |
| Push | Web Push (VAPID) via `web-push` |
| Sports data | ESPN public API + Cricket API (both proxied server-side) |
| Validation | Zod |
| Dates | date-fns |

## Supported Sports

Soccer, Basketball, Pickleball, Tennis, Volleyball, American Football, Baseball, Hockey, Golf, Badminton

## Key Routes

| Route | Description |
|---|---|
| `/login` | Login screen |
| `/register` | Sign up screen |
| `/onboarding` | First-run sport picker (new users only) |
| `/schedule` | Weekly game grid (main screen) |
| `/schedule/[slotId]` | Game detail, roster, chat, map |
| `/schedule/new` | Create a new game slot |
| `/feed` | News & scores feed |
| `/invites` | Pending invites with accept/decline |
| `/profile` | User settings and sport interests |
| `/admin/slots` | Admin — all game slots |
| `/admin/users` | Admin — all users, promote/remove |
| `/admin/flags` | Admin — flagged chat messages |
| `/invite/accept/[token]` | SMS deeplink acceptance |

## API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create account |
| `/api/slots` | GET, POST | List / create game slots |
| `/api/slots/[slotId]` | GET, PATCH, DELETE | Slot CRUD |
| `/api/slots/[slotId]/roster` | GET, POST, DELETE | Join / leave |
| `/api/slots/[slotId]/messages` | GET, POST | Game chat |
| `/api/slots/[slotId]/invites` | POST | Send invite |
| `/api/invites/[token]` | GET, PATCH | SMS deeplink accept/decline |
| `/api/invites/pending` | GET | Pending invite count |
| `/api/users/me/sports` | PUT | Update sport interests |
| `/api/users/me/profile` | GET, PATCH | Read / update profile |
| `/api/users/me/feed` | GET, PUT | Followed leagues |
| `/api/users/search` | GET | Search users by sport |
| `/api/admin/users` | GET | List all users (admin only) |
| `/api/admin/users/[id]` | PATCH, DELETE | Promote / remove user (admin only) |
| `/api/admin/messages/[id]` | PATCH, DELETE | Flag/unflag or delete chat message (admin only) |
| `/api/auth/session` | POST | Exchange Firebase ID token for `__session` cookie |
| `/api/push/subscribe` | POST | Register a Web Push subscription |
| `/api/espn/scores` | GET | Proxied ESPN scoreboard |
| `/api/espn/news` | GET | Proxied ESPN news |
| `/api/cricket/scores` | GET | Proxied Cricket API scores |
| `/api/cricket/news` | GET | Proxied Cricket API news |

## Environment Variables

Production values live in `apphosting.yaml` (plain values) and Google Secret Manager (secrets). Local dev uses `.env.local`.

```bash
# Public Firebase client config (safe in client bundle)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-claude-build.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-claude-build
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-claude-build.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_APP_URL=https://sportsnextup.com

# Firebase Admin (server)
# On App Hosting, ADC is auto-injected — only project ID is needed.
# Locally, set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON.
FIREBASE_ADMIN_PROJECT_ID=my-claude-build

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=        # secret in prod
VAPID_PRIVATE_KEY=                   # secret in prod
VAPID_EMAIL=                         # secret in prod

# Third-party APIs (server only)
CRICKET_API_KEY=                     # secret in prod
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Deployment

| Item | Value |
|---|---|
| Production URL | https://sportsnextup.com (also https://www.sportsnextup.com) |
| Default backend URL | https://fun-apps--my-claude-build.us-central1.hosted.app |
| Firebase project | `my-claude-build` |
| App Hosting backend | `fun-apps` (region: `us-central1`) |
| DNS provider | Cloudflare (records: A, TXT, CNAME for both apex and `www`, all DNS-only / gray cloud) |
| SSL | Google Trust Services, auto-renewed |
| Rollouts | Auto-deploy from `main` via Firebase App Hosting GitHub integration |

## Getting Started

```bash
npm install
# Place .env.local with the variables above; for Firebase Admin locally,
# export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
npm run dev
```

Seed Firestore (one-time, dev only):

```bash
npx tsx scripts/seed-firestore.ts
```

Promote a registered user to ADMIN (one-shot):

```bash
npx tsx scripts/promote-admin.ts <email>
```

## Branch

`main` (App Hosting auto-deploys on push)
