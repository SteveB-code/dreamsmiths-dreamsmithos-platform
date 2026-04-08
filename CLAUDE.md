# DreamsmithsOS Platform

## What this is
Internal web application for DreamSmiths (~30 users). Operationalises the DreamSmiths Operating System — contractor onboarding, compliance tracking, people/platform registries, document management.

## Tech stack
- **Framework**: Next.js 16 (App Router, full-stack)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Database**: PostgreSQL on Neon
- **ORM**: Drizzle
- **Auth**: BetterAuth + Microsoft 365 OAuth (all users authenticate via MS SSO)
- **File storage**: Cloudflare R2
- **Email**: Resend
- **Hosting**: Vercel
- **Scheduling**: Inngest

## Project structure
```
src/
  app/              # Next.js App Router pages and API routes
    (auth)/         # Auth-related pages (login, etc.)
    (dashboard)/    # Authenticated app pages
    api/            # API routes
  components/       # React components
    ui/             # shadcn/ui components
    layout/         # Layout components (sidebar, header, etc.)
  db/               # Database schema and connection
    schema.ts       # Drizzle schema (single source of truth)
    index.ts        # DB connection
  lib/              # Shared utilities
drizzle/            # Migration files (generated)
```

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run db:generate` — generate Drizzle migrations from schema
- `npm run db:migrate` — run migrations against database
- `npm run db:push` — push schema directly (dev only)
- `npm run db:studio` — open Drizzle Studio (DB browser)

## Conventions
- Schema is defined in `src/db/schema.ts` — single file, all tables
- Use Drizzle's query builder, not raw SQL
- Server components by default; add `"use client"` only when needed
- API routes go in `src/app/api/` following REST conventions
- Sensitive data (ID numbers, addresses) encrypted at application level before storage
- All file access via presigned R2 URLs — never expose raw storage paths
- Role-based access: Admin, Product Lead, Contractor — enforced via middleware

## Auth model
All users (admins, product leads, contractors) authenticate via Microsoft 365 SSO.
Contractors receive a DreamSmiths Microsoft account on engagement.
Roles are stored in the `user` table and checked in middleware/server components.
No magic links, no local passwords.
