# Pacemate — Tech Stack

## Overview
Full-stack web application, mobile-responsive, built for rapid iteration and low hosting cost during the pilot phase, with a clear upgrade path as usage grows.

## Frontend
- **React + Vite** — component-based UI, fast dev/build cycle
- **Tailwind CSS** — utility-first styling, used for the custom design system (warm stone background, teal primary, orange accent, bib-tag motif)
- Mobile-responsive down to 375px width (check-in happens on runners' phones at events)

## Backend
- **Node.js + Express** — REST API server
- Handles auth, event/registration logic, payment verification, notifications

## Database
- **PostgreSQL** — primary production database (hosted via Supabase, Railway, or Neon)
- **Prisma ORM** — schema management and type-safe queries
- **Local fallback**: SQLite auto-initializes with seed data when no `DATABASE_URL` is set, for instant local demos without cloud setup

## Auth
- OTP-based login/signup (phone and/or email)
- OTP delivery via Twilio Verify / MSG91 (phone) and/or Resend (email) — provider TBD based on cost/reliability for Indian numbers
- Two roles: Organizer, Runner

## Payments
- **Razorpay** — Indian payment gateway supporting UPI, cards, netbanking
- Payment required at time of registration for paid events (no pay-later)
- Server-side signature verification on every payment before a registration is confirmed
- Refund support via Razorpay's refund API for cancelled events

## Check-in
- QR code generation per event (`qrcode.react` or similar)
- Camera-based QR scanning in-browser (`html5-qrcode`)
- 6-digit backup code as a fallback for scan failures
- Unique runner code per registration (bib-style ID)

## Notifications
- Resend (email) for event reminders, waitlist promotion alerts, payment confirmations
- Falls back to console/audit-log output in local dev when no API key is set

## File Storage
- Event cover images: Supabase Storage or S3-compatible bucket (or base64-in-DB for early MVP simplicity)

## Hosting / Deployment
| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Railway or Render |
| Database | Supabase / Neon (PostgreSQL) |
| Version control | GitHub (private repo) |

## Data Export
- Member roster export as CSV/XLSX (organizer-facing)

## Planned Additions (Phase 2)
- GPS tracking: browser Geolocation API (or native wrapper if a mobile app becomes necessary) for start/end/checkpoint capture during live runs
- Map rendering: Mapbox or Google Maps API for route visualization
- Push notifications (would require moving toward a PWA or native shell)

## Why this stack
- Every layer has a generous free tier (Vercel, Railway, Supabase, Resend) — near-zero hosting cost during pilot phase with 3-5 clubs
- Prisma + Postgres gives a clean upgrade path from "demo with seed data" to "production with real clubs" without a rewrite
- React/Node is widely known — easy to hand off to a hired developer later if needed, not a niche/exotic stack
