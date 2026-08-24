# 🏃‍♂️ Pacemate — Run Club Management Platform

**Pacemate** is a full-stack platform built for run clubs to manage event registrations, capacity limits, live venue QR check-ins, and member rosters. It replaces clunky WhatsApp group chats with a community-first athletic tool.

---

## 🎨 Visual Motif & Aesthetics

- **Race Bib Motif**: Custom monospace badges (`#BIB-042`), pinhole dot corner accents, and subtle rotational tilts reminiscent of race day bibs.
- **Color Palette**:
  - **Background**: Warm stone off-white (`#EDEAE2`)
  - **Primary**: Deep athletic teal (`#276F6E`)
  - **Accent**: Punchy orange (`#E85D2C`)
  - **Text**: Dark charcoal (`#2C3333`)
- **Mobile-First**: Optimized down to 375px screens so runners and organizers can easily use it at run venues.

---

## ⚡ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS v4, Lucide Icons, `html5-qrcode` (camera scanner), `qrcode.react` (venue QR display), `canvas-confetti`.
- **Backend**: Node.js + Express REST API.
- **Database**: PostgreSQL / SQLite via Prisma ORM. Supports dual-mode (Cloud Postgres or Zero-Config local DB).
- **Notifications**: Resend Transactional Email Engine.

---

## 🚀 Quick Start (Running Locally)

### 1. Install Dependencies & Initialize Database
```bash
# Install dependencies
npm install

# Initialize database schema & seed sample data
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 2. Start Dev Server
Launch both Express backend (Port 5000) and Vite frontend (Port 5173) simultaneously:
```bash
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
# Database Connection (SQLite for zero-config local demo, or replace with PostgreSQL string)
DATABASE_URL="file:./dev.db"

# Server Port
PORT=5000

# Resend Email API Key (Optional: if omitted, sent emails are cleanly logged to audit console)
RESEND_API_KEY="re_123456789_your_key_here"
SENDER_EMAIL="Pacemate Run Club <onboarding@resend.dev>"
```

---

## ☁️ Deployment Instructions

### 1. Database Setup (Supabase / Render / Neon)
1. Create a PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy your connection URL e.g. `postgresql://postgres:password@db.supabase.co:5432/postgres`.
3. Set `DATABASE_URL` in your hosting dashboard environment variables.
4. Run `npx prisma db push` during build/deploy pipeline.

### 2. Backend Deployment (Railway / Render)
1. Link your repository to Railway or Render.
2. Set Build Command: `npm install && npx prisma generate && npx prisma db push`
3. Set Start Command: `node server/server.js`
4. Environment variables to set: `DATABASE_URL`, `RESEND_API_KEY`, `PORT`.

### 3. Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Framework Preset: **Vite**.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Rewrite rule in `vercel.json` for API proxying if deploying frontend separately.

---

## 📋 Pre-Seeded Sample Profiles for Live Demo

Use the **Quick Demo Profile Switcher** in the top navigation bar to test immediately:

| Role | Name | Details / Club |
| :--- | :--- | :--- |
| **Organizer** | Elena Rostova | Sunrise Strides NYC (Central Park Runs) |
| **Organizer** | Marcus Vance | Midnight Runners SF (Golden Gate Runs) |
| **Runner** | Alex Rivera | Registered for Central Park 5K & Tempo |
| **Runner** | Sarah Chen | Registered & Attended Past Runs |
| **Runner** | Jordan Blake | Waitlisted on Waterfront Tempo Run |

---

## 📝 Spec Notes & Judgment Calls

1. **Check-In Strategy**: Implemented camera-based **QR Code Check-in** (`html5-qrcode`) + 6-digit backup PIN code. Organizers can launch "Venue Display Mode" fullscreen on race day.
2. **Waitlist Auto-Promotion**: Built server-side trigger that automatically awards spots to the next waitlisted runner whenever a registered runner cancels.
3. **Notification Engine**: Selected **Resend** for email notifications. Includes automated fallback logging when no API key is provided for zero-friction local demos.
