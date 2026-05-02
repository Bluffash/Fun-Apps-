# SportsPick — Project Summary

## Overview

SportsPick is a mobile-first, full-stack web app for organizing pick-up sports games. Users can browse and join weekly game slots, chat with teammates, invite friends, and follow live sports news and scores.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Database | Prisma 7 + SQLite (libsql adapter) |
| Auth | NextAuth.js v5 beta + `@auth/prisma-adapter` |
| Data fetching | SWR (chat polling, live scores) |
| Email | Resend |
| SMS | Twilio |
| Sports data | ESPN public API (proxied server-side) |
| Passwords | bcryptjs |
| Validation | Zod |
| Dates | date-fns |

## Features

### Game Scheduling
- Weekly calendar grid — browse pick-up game slots by week and sport
- Any authenticated user can create a game slot (they become the owner)
- Admins can edit or delete any slot; creators can edit or delete their own
- Recurring games — create up to 12 weekly repeating slots at once
- Join/leave a game with live roster updates
- Game detail page with date, time, location, capacity, and OpenStreetMap embed

### Chat
- Per-game chat restricted to players on the roster
- SWR polling every 3 seconds with optimistic message rendering
- Unauthenticated or non-roster users see a "Join to chat" prompt

### Invite System
- Invite registered users filtered by shared sport interest
- Invite by phone number — sends a Twilio SMS with a deeplink token
- SMS deeplink (`/invite/accept/[token]`) handles register + accept in one flow
- My Invites page (`/invites`) with Accept/Decline buttons and badge count in the navbar

### News & Scores Feed
- 12 leagues: Premier League, La Liga, Serie A, Ligue 1, Bundesliga, Champions League, NBA, NFL, MLB, NHL, ATP, PGA Tour
- ESPN public API proxied through Next.js routes (no API key required, avoids CORS)
- Scores refresh every 30 seconds; news every 60 seconds
- Side-by-side desktop layout (news + scores); stacks on mobile
- Users follow their preferred leagues; preferences saved to the database

### Email Notifications
- Invite sent — email delivered to the invited user
- Player joined — email delivered to the game creator when someone joins

### User Profiles
- Sport interest picker at onboarding and on the profile page
- Profile page (`/profile`) to update name and phone number
- Avatar in the navbar links to the profile page

## Supported Sports

Soccer, Basketball, Pickleball, Tennis, Volleyball, American Football, Baseball, Hockey, Golf, Badminton

## Key Routes

| Route | Description |
|---|---|
| `/schedule` | Weekly game grid |
| `/schedule/[slotId]` | Game detail, roster, chat, map |
| `/schedule/new` | Create a new game slot |
| `/feed` | News & scores feed |
| `/invites` | Pending invites with accept/decline |
| `/profile` | User settings and sport interests |
| `/onboarding` | First-run sport picker |
| `/admin/slots` | Admin moderation panel |
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
| `/api/espn/scores` | GET | Proxied ESPN scoreboard |
| `/api/espn/news` | GET | Proxied ESPN news |

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generated>"
RESEND_API_KEY=""
EMAIL_FROM="SportsPick <noreply@yourdomain.com>"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Default admin account: `admin@sportsapp.com` / `Admin1234!`

## Branch

`claude/sports-scheduling-app-4Y7nT`
