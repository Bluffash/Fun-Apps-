# SportsPick — Milestone To-Do List

---

## Milestone 1 — Core Infrastructure ✅ Complete

- [x] Initialize Next.js 14 project with TypeScript and Tailwind CSS
- [x] Install and configure shadcn/ui component library
- [x] Set up Prisma 7 with SQLite (libsql adapter)
- [x] Define full database schema (User, Sport, GameSlot, GameRoster, ChatMessage, Invite, FeedFollow, Session)
- [x] Write and run initial database migration
- [x] Create seed script (10 sports + admin user)
- [x] Configure NextAuth.js v5 with JWT strategy and credentials provider
- [x] Augment session type to include `user.id` and `user.role`
- [x] Set up route protection middleware (`/schedule`, `/feed`, `/admin`, `/onboarding`, `/invites`, `/profile`)
- [x] Generate `NEXTAUTH_SECRET`
- [x] Create `.env.local` with all required environment variables
- [x] Set up global app layout with `SessionProvider` and `Toaster`

---

## Milestone 2 — Authentication & Onboarding ✅ Complete

- [x] Build registration page (`/register`) with name, email, phone, password fields
- [x] Build login page (`/login`) with email and password
- [x] `POST /api/auth/register` — create user, hash password with bcryptjs
- [x] Auto-login after registration
- [x] Redirect new users (zero sport interests) to `/onboarding`
- [x] Build sport interest picker — 10 sports in a grid, toggle on/off
- [x] `PUT /api/users/me/sports` — save sport interests
- [x] Redirect to `/schedule` after onboarding

---

## Milestone 3 — Game Scheduling ✅ Complete

- [x] Build weekly schedule grid with day columns and week navigation
- [x] Sport filter tabs on schedule grid
- [x] `GET /api/slots` — list slots for a given week, filter by sport
- [x] `POST /api/slots` — create game slot (any authenticated user)
- [x] Build slot creation form (title, sport, location, date/time, capacity, description)
- [x] Recurring game support — "Repeat weekly" checkbox, 2–12 weeks slider
- [x] Build game slot detail page (`/schedule/[slotId]`)
  - [x] Header with sport, title, description, edit/delete for owner or admin
  - [x] Date, time, location info row
  - [x] OpenStreetMap iframe embed with "Open in Maps" Google Maps link
  - [x] Roster list with capacity indicator
  - [x] Join / Leave button with real-time state
- [x] `GET/POST/DELETE /api/slots/[slotId]/roster` — join, leave, list roster
- [x] `GET/PATCH/DELETE /api/slots/[slotId]` — slot detail, edit, delete
- [x] Creators can edit and delete their own slots
- [x] Admins can edit and delete any slot

---

## Milestone 4 — Chat ✅ Complete

- [x] `GET /api/slots/[slotId]/messages` — paginated, roster-gated; filters flagged messages for non-admins
- [x] `POST /api/slots/[slotId]/messages` — roster-gated send
- [x] Build `ChatPanel` component with SWR polling every 3 seconds
- [x] Optimistic message rendering (appears instantly before server confirms)
- [x] Auto-scroll to latest message
- [x] Non-roster users see "Join to chat" prompt instead of chat panel
- [x] Flag button on hover for any message you didn't write
- [x] Flagged messages hidden from regular users; admins see them with warning styling

---

## Milestone 5 — Invites & Notifications ✅ Complete

- [x] `POST /api/slots/[slotId]/invites` — invite by registered user or phone number
- [x] User invite — searches users sharing the game's sport who aren't on the roster
- [x] Phone invite — creates invite token, sends Twilio SMS deeplink
- [x] If phone matches existing user, fall back to user invite (skip SMS)
- [x] Build `InviteModal` with User and Phone tabs
- [x] SMS deeplink acceptance page (`/invite/accept/[token]`)
  - [x] Shows game info for unauthenticated visitors
  - [x] Prompts register (pre-fills phone) if not logged in
  - [x] Auto-joins roster on accept
- [x] `GET/PATCH /api/invites/[token]` — info lookup and accept/decline
- [x] `GET /api/invites/pending` — count of pending invites for navbar badge
- [x] Build My Invites page (`/invites`) — lists pending invites with Accept/Decline
- [x] "View Game →" link shown after accepting an invite
- [x] Email notification to invited user when invite is sent (Resend)
- [x] Email notification to game creator when a player joins (Resend)
- [x] Navbar invite badge with unread count

---

## Milestone 6 — News & Scores Feed ✅ Complete

- [x] Define 12 supported ESPN leagues (6 soccer, NBA, NFL, MLB, NHL, ATP, PGA)
- [x] `GET /api/espn/scores` — server-side ESPN proxy, 30s revalidation
- [x] `GET /api/espn/news` — server-side ESPN proxy, 60s revalidation
- [x] `GET/PUT /api/users/me/feed` — get and update followed leagues
- [x] Build `FeedPage` with split layout (news left, scores right)
- [x] Desktop: side-by-side columns; mobile: single column stack
- [x] View toggle: Split / Scores only / News only (persisted to localStorage)
- [x] `LeaguePicker` — manage followed leagues
- [x] `NewsCard` — article image, headline, source, relative timestamp
- [x] `ScoreCard` — home/away teams, score, game status (live clock, FT, scheduled)
- [x] Scores auto-refresh every 30 seconds via SWR

---

## Milestone 7 — User Profile ✅ Complete

- [x] Build profile page (`/profile`)
- [x] Update name and phone number
- [x] `GET/PATCH /api/users/me/profile` — read and update profile
- [x] Sport interest editor on profile page (same picker as onboarding)
- [x] Avatar in navbar links to `/profile`
- [x] Mobile navbar includes Profile link

---

## Milestone 8 — Admin Panel ✅ Complete

- [x] Admin-only layout with shared tab nav (Game Slots / Users / Flagged Chat)
- [x] `/admin/slots` — list all game slots with edit/delete for any slot
- [x] `/admin/users` — list all registered users
  - [x] Show name, email, phone, role, join date, games joined, slots created
  - [x] "Make Admin" / "Revoke Admin" role toggle
  - [x] "Remove" user with confirmation (cannot remove own account)
- [x] `/admin/flags` — list all flagged chat messages
  - [x] Shows message author, game, timestamp, and message body
  - [x] "Dismiss Flag" — clears flag, message reappears in chat
  - [x] "Delete Message" — permanently removes with confirmation
- [x] `GET /api/admin/users` — list all users (admin only)
- [x] `PATCH/DELETE /api/admin/users/[id]` — promote/demote or remove user
- [x] `PATCH/DELETE /api/admin/messages/[id]` — flag/unflag or delete message

---

## Milestone 9 — Production Deployment 🔲 Not Started

### Database
- [ ] Create a free Turso (LibSQL) database at turso.tech
- [ ] Update `DATABASE_URL` in production environment to Turso connection string
- [ ] Run `npx prisma migrate deploy` against the production database
- [ ] Run seed script against production database (creates sports + admin user)

### Environment & Secrets
- [ ] Generate a strong `NEXTAUTH_SECRET` for production (`openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to the live domain (e.g. `https://sportspick.app`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to the live domain
- [ ] Add `RESEND_API_KEY` (get from resend.com — 100 emails/day free)
- [ ] Set `EMAIL_FROM` to a verified sender domain in Resend
- [ ] Add Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)

### Hosting
- [ ] Import repository into Vercel
- [ ] Add all environment variables in the Vercel dashboard
- [ ] Assign a custom domain
- [ ] Verify deployment builds successfully
- [ ] Test the full signup → onboarding → schedule flow on the live URL
- [ ] Confirm email delivery works on live URL
- [ ] Confirm SMS invite works on live URL

---

## Milestone 10 — Quality Assurance 🔲 Not Started

### Manual test checklist
- [ ] Register a new account → redirected to onboarding
- [ ] Pick sports on onboarding → redirected to schedule
- [ ] Create a game slot (regular user) → appears in schedule grid
- [ ] Join a game → appears on roster
- [ ] Send a chat message → appears within 3 seconds for a second logged-in user
- [ ] Flag a chat message → disappears for regular users, visible to admin
- [ ] Admin dismisses flag → message reappears in chat
- [ ] Invite a registered user → they receive email, see it on `/invites`, accept → on roster
- [ ] Invite by phone number → Twilio SMS sent with deeplink
- [ ] Follow leagues on `/feed` → news and scores appear
- [ ] Scores refresh automatically within 30 seconds
- [ ] Admin promotes a user → that user can access `/admin`
- [ ] Admin removes a user → account deleted, cannot log in
- [ ] Update profile name/phone → saved and reflected in navbar
- [ ] Create a recurring game (4 weeks) → 4 slots appear in correct weeks
- [ ] Test on mobile screen (375px) — schedule grid, chat, forms all usable

### Edge cases to verify
- [ ] Join a full game → "Full" badge shown, join button disabled
- [ ] Non-roster user visits game detail → sees roster but not chat
- [ ] Invite same user twice → "Already invited" error shown
- [ ] Visit `/admin` as a regular user → redirected to `/schedule`
- [ ] SMS deeplink visited when not logged in → shown register prompt
- [ ] Game creator cannot be removed from the admin panel (self-deletion blocked)

---

## Milestone 11 — Future Enhancements 💡 Backlog

### Notifications
- [ ] Push notifications (web push / PWA) for game reminders
- [ ] "Game starting soon" email reminder (1 hour before)
- [ ] Notify all roster members when someone leaves a game
- [ ] In-app notification bell (not just invite badge)

### Scheduling
- [ ] Waitlist for full games — auto-join when a spot opens
- [ ] Cancel a game (creator/admin) — notify all roster members
- [ ] Game location autocomplete using a mapping API
- [ ] iCal / Google Calendar export for game slots

### Social
- [ ] User public profile page (games played, sports)
- [ ] Friends / following system
- [ ] Share game link (public preview for non-logged-in visitors)
- [ ] Player ratings after a game

### Admin
- [ ] Dashboard with key stats (total users, games this week, active leagues)
- [ ] Bulk-delete old past game slots
- [ ] Audit log (who promoted whom, who deleted what)
- [ ] Ban user (block login without deleting account)

### Technical
- [ ] Switch chat from polling to WebSockets (Socket.io or Pusher) for instant delivery
- [ ] Add rate limiting on API routes (especially invite and register)
- [ ] Add unit tests for API route business logic
- [ ] Add E2E tests with Playwright for the critical user flows
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] PWA manifest for "Add to Home Screen" on mobile
