# Viridis Media — Project Management Dashboard

Web-based project management dashboard for a small media team. Built with Next.js 15, TypeScript, Tailwind, shadcn/ui, Prisma, Supabase, and NextAuth.

## Local development

### Prerequisites
- Node.js 20+
- A Supabase project (free tier is fine)
- A Google Cloud OAuth client (Web app type)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template and fill in values (see comments inside the file for where to get each):
   ```bash
   cp .env.example .env.local
   ```
3. Run the first migration:
   ```bash
   npm run db:migrate -- --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Stage status
Currently at: **Stage 1 — Scaffold complete.**

See `/root/.claude/plans/i-want-to-create-bright-adleman.md` for the full build plan.
