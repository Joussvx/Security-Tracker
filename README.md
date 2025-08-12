# Security Tracker

Security operations tracker built with React + Vite + Supabase.

## Structure

```
security-tracker/
  App.tsx
  src/
    main.tsx
  components/
  contexts/
  data/               # Supabase data access layer (guards, shifts, schedule, attendance)
  utils/
  lib/
  supabase/
    schema.sql        # Tables + dev RLS + realtime
    seed.sql          # Seeds for shifts (and optional guards)
```

## Run Locally

Prerequisite: Node.js 18+

1. Create `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
2. Install & run:
```
npm install
npm run dev
```

## Deploy (Vercel)

- Build: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

