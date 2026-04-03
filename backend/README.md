# Lindamwananchi Backend

Production-style TypeScript/Express backend for a safety navigation system, designed to plug into an existing MySQL database.

## Stack
- Node.js + TypeScript
- Express
- MySQL (`mysql2`)
- JWT auth + role-based authorization
- Zod request validation

## Quick Start
1. Copy `.env.example` to `.env`.
2. Update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, and `PORT`.
3. Install dependencies:
   - `npm install`
4. Run in dev:
   - `npm run dev`

## API Base
- `/api`

## Health
- `GET /api/health`

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## Users
- `GET /api/users/me` (auth)
- `PATCH /api/users/me` (auth)
- `GET /api/users` (admin only)

## Incidents
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `POST /api/incidents` (auth)
- `PATCH /api/incidents/:id/verify` (admin/responder)
- `PATCH /api/incidents/:id/status` (admin/responder)

## Alerts
- `GET /api/alerts`
- `POST /api/alerts` (admin/responder)
- `PATCH /api/alerts/:id/toggle` (admin/responder)

## Routes
- `GET /api/routes`
- `GET /api/routes/recommend?startLat=-1.28&startLng=36.82&destination=CBD`
- `POST /api/routes` (admin/responder)

## Reports
- `GET /api/reports/dashboard` (admin/responder)

## Existing DB Integration
Run:
- `sql/mysql_sync.sql`

This script aligns your existing `lindamwananchi_safety` schema with backend expectations without dropping tables.

If your existing database uses different names, update only:
- `src/modules/*/*.service.ts` query strings

The rest of the backend (controllers/routes/validation/auth flow) will continue to work.
