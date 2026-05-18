# 🚀 IQOL Blog & SEO Dashboard

> An internal operations dashboard for the IQOL Technologies Blog & SEO team.
> Track articles, monitor live GA4 analytics, assign tasks, and manage writers — all in one place.

**Live Demo:** https://blog-management-system-ut7q.vercel.app

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@iqol.com` | `Admin123456` |

---

## 🔥 The Problem

The Blog & SEO team at IQOL Technologies publishes articles every single day. Before this dashboard, the team was:

- 📧 Tracking article status over **Slack messages**
- 📊 Managing assignments in **random spreadsheets**
- 🔍 Manually checking **Google Analytics** for each article one by one
- 🤷 Having **no single source of truth** for what was published, indexed, or in draft
- ⏱️ Wasting hours every week on **status update meetings**

---

## ✅ The Solution

A purpose-built internal dashboard that gives the entire team **one screen to rule them all.**

- Every article lives in one place with real-time status tracking
- GA4 analytics auto-sync every 30 minutes — no manual checking
- Admins assign tasks directly to writers with due dates
- Writers see only what's assigned to them
- The entire database is a Google Sheet — transparent, exportable, zero hosting cost

---

## ✨ Features

### 📝 Article Management
- Add articles with URL, Run ID, Persona, Status, Publish Date, Notes
- Full edit and delete with role-based permissions
- Real-time search across title, URL, Run ID, persona
- Status workflow: `Draft → In Progress → Under Review → Published → Indexed`

### 📊 Live GA4 Analytics
- Per-article metrics: Pageviews, Sessions, Avg Engagement Time, Bounce Rate
- Manual sync button on every article detail page
- Auto-sync every 30 minutes via external cron job
- Analytics overview page with top 15 articles by traffic

### ✅ Task Management
- Admin assigns tasks to writers tied to specific articles
- Kanban board: Open / In Progress / Done
- Writers update their own task status
- Due dates and descriptions on every task

### 👥 Admin Panel
- Create and manage team members (writers + admins)
- Complete activity log — every login, create, update, delete
- Assign tasks from a central interface
- Full visibility into all articles

### 🎨 UI/UX
- Dark mode and Light mode with system preference detection
- Animated rows and transitions with Framer Motion
- Fully responsive (mobile + desktop)
- Gradient stat cards, area charts, status pie charts
- Toast notifications for every action

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React with SSR |
| Language | TypeScript | Type safety across the codebase |
| UI Library | shadcn/ui + Tailwind CSS | Accessible component library |
| Animations | Framer Motion | Smooth row and card animations |
| Charts | Recharts | Bar, area, and pie charts |
| Auth | NextAuth.js v4 | JWT sessions with credentials |
| Password | bcryptjs | Secure password hashing |
| Database | Google Sheets API v4 | Transparent, free database |
| Analytics | Google Analytics Data API | Real traffic data per URL |
| Hosting | Vercel (free tier) | Auto-deploy, edge network |
| Cron | cron-job.org (free) | 30-minute GA4 auto-sync |

---

## 🏗 Architecture
Users (Writers + Admin)
│
▼
Next.js 16 App on Vercel
│  Login  │  Articles  │  Tasks  │  Admin Panel  │
│         NextAuth Sessions + API Routes          │
│
├──────────────────────────────┐
▼                              ▼
Google Sheets API              Google Analytics Data API

Users                        Per-URL: Pageviews,
Articles                     Sessions, Engagement,
Tasks                        Bounce Rate
ActivityLog                         ▲
│ Every 30 min
cron-job.org (free)


**Why Google Sheets as a database?**
The team already lives in Google Workspace. Sheets means data is always visible, always exportable, and the team can open it directly. Zero database hosting cost, zero migrations, zero vendor lock-in.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 LTS or higher
- Google Cloud account
- Google Analytics 4 property

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
# Fill in all values
```

### 4. Run the development server
```bash
npm run dev
```

Open http://localhost:3000

---

## 🔐 Environment Variables

```env
# Google Service Account
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id

# Google Analytics 4
GA4_PROPERTY_ID=your_9_digit_property_id
GA4_CLIENT_ID=your_oauth_client_id
GA4_CLIENT_SECRET=your_oauth_client_secret
GA4_ACCESS_TOKEN=ya29.your_access_token
GA4_REFRESH_TOKEN=your_refresh_token

# NextAuth
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Cron Protection
CRON_SECRET=any_long_random_string
```

---

## 🧠 Core Concepts Learned

### 1. Google Sheets as a Database
A spreadsheet can function as a lightweight database with a proper API wrapper. Built a full CRUD abstraction layer that reads rows as typed objects, appends, updates by ID, and deletes by index.

**Lesson:** You don't always need a traditional database. For internal tools with modest data volumes, Sheets is transparent, shareable, and free.

### 2. Role-Based Access Control (RBAC)
Two-tier role system (Admin / Writer) enforced at both API route level and UI level. Writers see only their own articles; admins see everything.

**Lesson:** Security must be enforced server-side. Client-side hiding is UI polish, not security.

### 3. Authentication with JWT Sessions
NextAuth.js credentials provider reads users from Google Sheets, verifies bcrypt-hashed passwords, and creates a JWT session containing the user's ID and role.

**Lesson:** Never store plaintext passwords. bcrypt's one-way hashing makes brute-force attacks computationally infeasible.

### 4. Third-Party API Integration (GA4)
GA4 Data API integration that pulls pageviews, sessions, engagement time, and bounce rate for any URL. Results are written back to the Sheets database.

**Lesson:** Never fetch external APIs on every page load. Cache results locally and refresh on a schedule.

### 5. Background Jobs via Cron
A protected API endpoint that bulk-syncs GA4 data for all published articles. An external free service hits it every 30 minutes with a bearer token.

**Lesson:** Serverless platforms don't run background processes — you need an external trigger. A free cron service calling a secured webhook is elegant and cost-free.

### 6. Next.js App Router
File-system routing with server and client components, server-side session checking in layouts, and API routes for all data operations.

**Lesson:** Server Components reduce JavaScript sent to the browser. Only use Client Components for interactivity.

### 7. Dark Mode with CSS Variables
Complete dark/light mode using Tailwind's `dark:` variant, shadcn/ui's CSS variable system, and `next-themes` for hydration-safe switching.

**Lesson:** CSS variables that adapt to a `dark` class on the html element is the most reliable, flash-free approach.

---

## 👥 Roles & Permissions

| Action | Writer | Admin |
|--------|:------:|:-----:|
| View own articles | ✅ | ✅ |
| View all articles | ❌ | ✅ |
| Create article | ✅ | ✅ |
| Edit own article | ✅ | ✅ |
| Edit any article | ❌ | ✅ |
| Delete article | ✅ own | ✅ any |
| View assigned tasks | ✅ | ✅ |
| Assign tasks | ❌ | ✅ |
| Sync GA4 | ✅ | ✅ |
| Manage users | ❌ | ✅ |
| View activity log | ❌ | ✅ |

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Login to Vercel
npx vercel login

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

# Deploy
npx vercel --prod
```

### Set up GA4 Auto-Sync Cron

1. Go to https://cron-job.org → create free account
2. New cron job:
   - URL: `https://your-domain.vercel.app/api/cron/sync-analytics`
   - Schedule: Every 30 minutes
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 📤 Git Commands

```bash
# Stage all changes
git add .

# Commit
git commit -m "your commit message"

# Push to GitHub
git push origin main

# If port 443 is blocked (corporate network), use mobile hotspot
# OR deploy directly without GitHub:
npx vercel --prod
```

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| Login fails | Re-generate bcrypt hash and update Users sheet |
| Sidebar missing | Go to `/login` on live site and sign in fresh |
| GA4 returns 0 | Use exact page path matching your GA4 property |
| `PERMISSION_DENIED` on GA4 | Re-run OAuth Playground to get new access token |
| Articles not loading | Check Sheets API quota, wait 1 min and retry |

---

## 🔒 Security

- Passwords are **bcrypt-hashed** (10 rounds) — never stored in plaintext
- All API routes check **authenticated sessions** server-side
- Cron endpoint protected by **Bearer token**
- Service account has **Editor access to one Sheet only**
- `passwordHash` **never returned** from any API endpoint
- JWT sessions expire after **12 hours**
- `.env.local` is **gitignored** — secrets never committed

---

## 🗺 Roadmap

- [ ] Bulk CSV import of articles
- [ ] Slack notifications when tasks are assigned
- [ ] Per-writer performance leaderboard
- [ ] Mobile sidebar (hamburger menu)
- [ ] Two-factor authentication
- [ ] Export reports to PDF
- [ ] Keyword ranking tracker integration

---

Built with ❤️ by **Shreyas Patro** for IQOL Technologies
