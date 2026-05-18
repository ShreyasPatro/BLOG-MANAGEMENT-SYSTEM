<div align="center">

# 🚀 IQOL Blog & SEO Dashboard

### An internal operations dashboard built for the IQOL Technologies content team.
### Track articles, monitor GA4 analytics, assign tasks, and manage writers — all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://blog-management-system-ut7q.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-green?style=for-the-badge&logo=google-sheets)](https://sheets.google.com)
[![GA4](https://img.shields.io/badge/Analytics-GA4-orange?style=for-the-badge&logo=google-analytics)](https://analytics.google.com)
[![Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

![Dashboard Preview](https://via.placeholder.com/1200x600/0f172a/3b82f6?text=IQOL+Blog+%26+SEO+Dashboard)

</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Core Concepts Learned](#-core-concepts-learned)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Roles & Permissions](#-roles--permissions)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🔥 The Problem

The Blog & SEO team at IQOL Technologies publishes articles every single day. Before this dashboard, the team was:

- 📧 Tracking article status over **Slack messages**
- 📊 Managing assignments in **random spreadsheets**
- 🔍 Manually checking **Google Analytics** for each article one by one
- 🤷 Having **no single source of truth** for what was published, indexed, or still in draft
- ⏱️ Wasting hours every week on **status update meetings**

There was no way for the admin to assign tasks, no visibility into who was working on what, and zero integration with actual traffic data.

---

## ✅ The Solution

A purpose-built internal dashboard that gives the entire team **one screen to rule them all.**

- Every article lives in one place with real-time status tracking
- GA4 analytics auto-sync every 30 minutes — no manual checking
- Admins assign tasks directly to writers with due dates
- Writers see only what's assigned to them
- The entire "database" is a Google Sheet — transparent, exportable, zero hosting cost

---

## 🌐 Live Demo

> **URL:** https://blog-management-system-ut7q.vercel.app

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@iqol.com` | `Admin123456` |

---

## ✨ Features

### 📝 Article Management
- Add articles with URL, Run ID, Persona, Status, Publish Date, and Notes
- Full edit and delete with role-based permissions
- Search across title, URL, Run ID, and persona in real time
- Status workflow: `Draft → In Progress → Under Review → Published → Indexed`

### 📊 Live GA4 Analytics
- Per-article metrics: Pageviews, Sessions, Avg Engagement Time, Bounce Rate
- Manual sync button on every article detail page
- Auto-sync every 30 minutes via external cron job
- Analytics overview page with top 15 articles by traffic

### ✅ Task Management
- Admin assigns tasks to writers (tied to specific articles)
- Kanban board: Open / In Progress / Done
- Writers update their own task status
- Due dates and descriptions on every task

### 👥 Admin Panel
- Create and manage team members (writers + admins)
- View complete activity log — every login, create, update, and delete
- Assign tasks from a central interface
- Full visibility into all articles regardless of assignment

### 🎨 UI/UX
- Dark mode and Light mode with system preference detection
- Animated rows and transitions with Framer Motion
- Fully responsive (mobile + desktop)
- Gradient stat cards, area charts, and status pie charts
- Toast notifications for every action

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React with server-side rendering |
| **Language** | TypeScript | Type safety across the entire codebase |
| **UI Library** | shadcn/ui + Tailwind CSS | Pre-built accessible components |
| **Animations** | Framer Motion | Smooth row and card animations |
| **Charts** | Recharts | Bar charts, area charts, pie charts |
| **Icons** | Lucide React | 1000+ clean SVG icons |
| **Auth** | NextAuth.js v4 | JWT sessions with credentials provider |
| **Password** | bcryptjs | Secure password hashing (10 rounds) |
| **Database** | Google Sheets API v4 | Transparent, free, team-accessible database |
| **Analytics** | Google Analytics Data API (GA4) | Real traffic data per article URL |
| **Hosting** | Vercel (free tier) | Auto-deploy from GitHub, edge network |
| **Cron** | cron-job.org (free) | 30-minute GA4 auto-sync |
| **Validation** | Zod | Runtime schema validation on all API routes |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS                                     │
│         Writers (5-6)          Admin                        │
└──────────────┬─────────────────────┬────────────────────────┘
               │                     │
               ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 16 App on Vercel                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │ Articles │  │  Tasks   │  │  Admin   │   │
│  │  Page    │  │  CRUD    │  │  Board   │  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  NextAuth.js Sessions  •  API Routes  •  Server Components  │
└──────────────┬─────────────────────────────────────────────┘
               │ Service Account / OAuth2
               ▼
┌──────────────────────┐      ┌─────────────────────────────┐
│   Google Sheets API  │      │   Google Analytics Data API  │
│                      │      │                              │
│  • Users             │◄─────┤  Per-URL metrics every 30m  │
│  • Articles          │      │  Pageviews, Sessions,        │
│  • Tasks             │      │  Engagement, Bounce Rate     │
│  • ActivityLog       │      └──────────────────────────────┘
└──────────────────────┘                    ▲
                                            │ GET every 30 min
                                  ┌─────────┴──────────┐
                                  │   cron-job.org      │
                                  │   (free external    │
                                  │    cron service)    │
                                  └────────────────────┘
```

**Why Google Sheets as a database?**
The team already lives in Google Workspace. Using Sheets means the data is always visible, always exportable, and the team can open it directly when needed. Zero database hosting cost, zero migrations, zero vendor lock-in.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 LTS or higher
- A Google Cloud account
- A Google Analytics 4 property

### 1. Clone the repository
```bash
git clone https://github.com/ShreyasPatro/BLOG-MANAGEMENT-SYSTEM.git
cd BLOG-MANAGEMENT-SYSTEM
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in all values (see [Environment Variables](#-environment-variables) below)

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of the project:

```env
# ─── Google Service Account ───────────────────────────────
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here

# ─── Google Analytics 4 ───────────────────────────────────
GA4_PROPERTY_ID=your_9_digit_property_id
GA4_CLIENT_ID=your_oauth_client_id
GA4_CLIENT_SECRET=your_oauth_client_secret
GA4_ACCESS_TOKEN=ya29.your_access_token
GA4_REFRESH_TOKEN=your_refresh_token

# ─── NextAuth ─────────────────────────────────────────────
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# ─── Cron Protection ──────────────────────────────────────
CRON_SECRET=any_long_random_string
```

### How to get each value:

| Variable | Where to get it |
|----------|----------------|
| `GOOGLE_CLIENT_EMAIL` | Google Cloud → IAM & Admin → Service Accounts → your account → email |
| `GOOGLE_PRIVATE_KEY` | Google Cloud → Service Account → Keys → Add Key → JSON → `private_key` field |
| `GOOGLE_SHEET_ID` | From your Google Sheet URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit` |
| `GA4_PROPERTY_ID` | GA4 → Admin → Property Settings → Property ID (9 digits) |
| `GA4_CLIENT_ID` | Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client |
| `GA4_CLIENT_SECRET` | Same as above |
| `GA4_ACCESS_TOKEN` | OAuth Playground → authorize → exchange code → copy access token |
| `GA4_REFRESH_TOKEN` | Same as above |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `CRON_SECRET` | Any random string you choose |

---

## 🧠 Core Concepts Learned

Building this project involved learning and implementing several real-world engineering concepts:

### 1. 🗄️ Using Google Sheets as a Database
**Concept:** A spreadsheet can function as a lightweight database with a proper API wrapper.

**What was built:** A full CRUD abstraction layer (`lib/sheets.ts`) that reads rows as typed objects, appends new rows, updates rows by ID, and deletes rows by index — all via the Google Sheets API v4.

**The lesson:** You don't always need a traditional database. For internal tools with modest data volumes, Sheets is transparent, shareable, and free.

---

### 2. 🔐 Role-Based Access Control (RBAC)
**Concept:** Different users see different data and have different permissions.

**What was built:** A two-tier role system (Admin / Writer) enforced at both the API route level and the UI level. Writers see only their own articles; admins see everything. Every API route checks the session role before returning data.

**The lesson:** Security must be enforced server-side. Client-side hiding is UI polish, not security.

---

### 3. 🔑 Authentication with JWT Sessions
**Concept:** Stateless authentication using signed JSON Web Tokens stored in cookies.

**What was built:** NextAuth.js credentials provider that reads users from Google Sheets, verifies bcrypt-hashed passwords, and creates a JWT session containing the user's ID and role.

**The lesson:** Never store plaintext passwords. bcrypt's one-way hashing with salt rounds makes brute-force attacks computationally infeasible.

---

### 4. 📊 Third-Party API Integration (GA4)
**Concept:** Fetching data from external APIs on a schedule and storing results locally.

**What was built:** A GA4 Data API integration that pulls pageviews, sessions, engagement time, and bounce rate for any URL. Results are written back to the Sheets database so the UI always reads from one source.

**The lesson:** Never fetch external APIs on every page load. Cache results locally (in this case, the Sheet) and refresh on a schedule.

---

### 5. ⏰ Background Jobs (Cron)
**Concept:** Running automated tasks on a schedule without user interaction.

**What was built:** A protected API endpoint (`/api/cron/sync-analytics`) that bulk-syncs GA4 data for all published articles. An external free service (cron-job.org) hits this endpoint every 30 minutes with a bearer token.

**The lesson:** Serverless platforms don't run background processes — you need an external trigger. A free cron service calling a secured webhook is an elegant, cost-free solution.

---

### 6. 🏗️ Next.js App Router Architecture
**Concept:** File-system based routing with server and client components.

**What was built:** A full App Router application with server-side session checking in layouts, API routes for all data operations, and client components for interactive UI.

**The lesson:** Server Components reduce JavaScript sent to the browser. Client Components are only for interactivity. Mixing them correctly is key to performance.

---

### 7. 🎨 Dark Mode with CSS Variables
**Concept:** Theme switching using CSS custom properties and `next-themes`.

**What was built:** A complete dark/light mode system using Tailwind's `dark:` variant, shadcn/ui's CSS variable system, and `next-themes` for hydration-safe theme switching.

**The lesson:** CSS variables that adapt to a `dark` class on the html element is the most reliable, flash-free approach to theme switching.

---

## 📁 Project Structure

```
iqol-blog-dashboard/
├── app/
│   ├── api/
│   │   ├── articles/
│   │   │   ├── route.ts          # GET all, POST new
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET one, PATCH, DELETE
│   │   ├── analytics/
│   │   │   └── [id]/
│   │   │       └── route.ts      # POST - sync GA4 for one article
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth handler
│   │   ├── cron/
│   │   │   └── sync-analytics/
│   │   │       └── route.ts      # Bulk GA4 sync (cron endpoint)
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── users/route.ts
│   │   ├── activity/route.ts
│   │   └── stats/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx            # Protected layout with Sidebar
│   │   ├── page.tsx              # Overview with charts
│   │   ├── articles/
│   │   │   ├── page.tsx          # Articles list
│   │   │   ├── new/page.tsx      # Create article
│   │   │   └── [id]/page.tsx     # Article detail + GA4 metrics
│   │   ├── tasks/page.tsx        # Kanban task board
│   │   ├── analytics/page.tsx    # Analytics overview
│   │   └── admin/page.tsx        # Admin panel
│   ├── login/page.tsx
│   ├── layout.tsx                # Root layout with Providers
│   └── page.tsx                  # Redirects to /dashboard
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── sidebar.tsx
│   ├── theme-toggle.tsx
│   ├── providers.tsx
│   └── status-badge.tsx
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── sheets.ts                 # Google Sheets CRUD client
│   ├── ga4.ts                    # GA4 Data API client
│   └── utils.ts
├── types/
│   ├── index.ts                  # Domain types
│   └── next-auth.d.ts            # Session type extensions
├── proxy.ts                      # Route protection middleware
├── .env.local                    # Environment variables (never commit)
└── .env.example                  # Template for env vars
```

---

## 📡 API Reference

All routes require an authenticated session cookie. Responses are JSON.

### Articles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/articles` | Any | List articles (role-filtered) |
| `POST` | `/api/articles` | Any | Create new article |
| `GET` | `/api/articles/:id` | Owner/Admin | Get single article |
| `PATCH` | `/api/articles/:id` | Owner/Admin | Update article fields |
| `DELETE` | `/api/articles/:id` | Owner/Admin | Delete article |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/analytics/:id` | Any | Sync GA4 for one article |
| `GET` | `/api/cron/sync-analytics` | Bearer token | Bulk sync all published articles |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tasks` | Any | List tasks (role-filtered) |
| `POST` | `/api/tasks` | Admin | Create & assign task |
| `PATCH` | `/api/tasks/:id` | Assignee/Admin | Update task status |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task |

### Users & Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | Any | List users (no passwords) |
| `POST` | `/api/users` | Admin | Create new user |
| `GET` | `/api/activity` | Admin | Activity log |
| `GET` | `/api/stats` | Any | Dashboard overview stats |

---

## 👥 Roles & Permissions

| Action | Writer | Admin |
|--------|:------:|:-----:|
| View own articles | ✅ | ✅ |
| View all articles | ❌ | ✅ |
| Create article | ✅ | ✅ |
| Edit own article | ✅ | ✅ |
| Edit any article | ❌ | ✅ |
| Delete own article | ✅ | ✅ |
| Delete any article | ❌ | ✅ |
| View assigned tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| Assign tasks to writers | ❌ | ✅ |
| Sync GA4 (single article) | ✅ | ✅ |
| Manage users | ❌ | ✅ |
| View activity log | ❌ | ✅ |

---

## 🚀 Deployment

### Deploy to Vercel (recommended)

**Option 1: Via Vercel CLI**
```bash
# Install and login
npx vercel login

# Link to project
npx vercel link

# Add environment variables
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production
npx vercel env add GOOGLE_CLIENT_EMAIL production
npx vercel env add GOOGLE_PRIVATE_KEY production
npx vercel env add GOOGLE_SHEET_ID production
npx vercel env add GA4_PROPERTY_ID production
npx vercel env add GA4_CLIENT_ID production
npx vercel env add GA4_CLIENT_SECRET production
npx vercel env add GA4_ACCESS_TOKEN production
npx vercel env add GA4_REFRESH_TOKEN production
npx vercel env add CRON_SECRET production

# Deploy to production
npx vercel --prod
```

**Option 2: Via GitHub (auto-deploy)**
1. Push to GitHub
2. Import project on vercel.com
3. Add env variables in Settings → Environment Variables
4. Every push to `main` auto-deploys

### Set up the 30-minute GA4 cron

1. Go to https://cron-job.org and create a free account
2. Create a new cron job:
   - **URL:** `https://your-domain.vercel.app/api/cron/sync-analytics`
   - **Schedule:** Every 30 minutes
   - **Method:** GET
   - **Header:** `Authorization: Bearer YOUR_CRON_SECRET`
3. Save and test — you should get `{"ok":N,"failed":0}`

---

## 📤 How to Push to GitHub

```bash
# Check current status
git status

# Stage all changes
git add .

# Commit with a message
git commit -m "your commit message here"

# Push to GitHub
git push origin main
```

### If port 443 is blocked (corporate network):
```bash
# Switch to mobile hotspot first, then:
git push origin main

# OR deploy directly to Vercel without GitHub:
npx vercel --prod
```

### Useful Git commands:
```bash
# See all commits
git log --oneline

# See what changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Check which branch you're on
git branch
```

---

## 🗺 Roadmap

- [ ] Bulk CSV import of articles
- [ ] Slack notifications when tasks are assigned
- [ ] Per-writer performance leaderboard
- [ ] Email digest for admins (weekly summary)
- [ ] Mobile-optimized sidebar (hamburger menu)
- [ ] Two-factor authentication
- [ ] Article version history
- [ ] Keyword ranking tracker integration
- [ ] Export reports to PDF

---

## 🔒 Security

- Passwords are **bcrypt-hashed** (10 rounds) — never stored in plaintext
- All API routes check **authenticated sessions** server-side
- The cron endpoint is protected by a **Bearer token** — only your cron service can call it
- The Google service account has **Editor access to one Sheet only** — nothing else
- `passwordHash` is **stripped from all API responses** — never exposed to the client
- JWT sessions expire after **12 hours**
- Environment variables are **never committed** to git (`.env.local` is gitignored)

---

## 🐛 Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Login fails | Wrong password hash in Sheet | Re-run `npx -y bcryptjs-cli hash "password"` and update Sheet |
| Sidebar missing on production | Not logged in on live site | Go to `/login` on the live URL and sign in |
| GA4 sync returns 0 | URL not found in GA4 | Use exact page path that matches your GA4 property |
| `PERMISSION_DENIED` on GA4 | OAuth token expired | Re-run OAuth Playground flow to get new access token |
| Articles not loading | Sheets API quota | Wait 1 minute and retry |
| `No properties` error | Wrong Sheet ID | Copy ID from Sheet URL between `/d/` and `/edit` |

---

## 👨‍💻 Built By

**Shreyas Patro** — IQOL Technologies

Built from scratch in a weekend as an internal tool for the Blog & SEO team.

---

<div align="center">

**⭐ If this project helped you, give it a star on GitHub!**

Made with ❤️ for the IQOL Technologies team

</div>
 
