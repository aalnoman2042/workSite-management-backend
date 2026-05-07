# WorkSite Manager – Backend

Backend for a construction WorkSite Management platform. It handles multi-role
users, workers, sites, attendance, payments, work assignments, and an AI
assistant that can answer natural-language questions about the database.

Built with **Node.js, Express 5, TypeScript, Prisma, PostgreSQL**, and deployed
on **Vercel**.

## Current State

Actively developed. The core flows below are implemented and live in the
deployed build:

- Multi-role authentication (Admin / Chief Engineer / Site Engineer / Worker)
- Worker, site, and work-assignment CRUD
- Attendance recording per site visit
- Stripe-based worker payments with attendance linkage
- AI assistant endpoint that searches workers, engineers, admins, and sites
- Vercel auto-deploy from `main`

## Features

### Authentication & Authorization
- JWT-based login with cookie + bearer support
- Role-based route guards
- bcrypt password hashing
- Zod request validation

### Users
- Admin, Chief Engineer, Site Engineer, and Worker profiles as separate models
- Soft-delete (`isDeleted`) across roles

### Worker Management
- Create / update / delete workers
- Track worker info (NID, contact, position, skills, assigned site)

### Site Management
- Create and manage construction sites
- Site status: `ACTIVE`, `UNDER_MAINTENANCE`, `INACTIVE`

### Work Assignments
- Assign workers and engineers to specific sites and tasks

### Attendance
- Site Engineers mark daily worker attendance during site visits
- Attendance records linked to worker, site, and date
- Chief Engineer / Admin can view all attendance

### Payments
- Stripe integration for worker payments
- `WorkerPayment` records link to the attendance days they cover
- `attendanceIds` defaults to `[]` so payments without linked days don’t break

### AI Assistant
- `POST /ai` accepts a natural-language `query`
- Pulls workers, site engineers, chief engineers, admins, sites, and attendance
- Uses an LLM (via OpenRouter) to return strict JSON matches
- Falls back to `{ "noMatch": true }` when nothing fits

### Error Handling
- Centralized `ApiError` + global error middleware
- Validation errors mapped to a frontend-friendly shape
- No silent failures — every route surfaces a structured response

## Tech Stack

| Category    | Technology                             |
|-------------|----------------------------------------|
| Runtime     | Node.js + TypeScript                   |
| Framework   | Express 5                              |
| Database    | PostgreSQL                             |
| ORM         | Prisma 6                               |
| Auth        | JWT, bcrypt, cookie-parser             |
| Validation  | Zod                                    |
| Payment     | Stripe                                 |
| AI          | OpenAI SDK via OpenRouter              |
| Deployment  | Vercel                                 |

## Project Structure

```
worksite-manager-backend/
├── prisma/
│   └── schema/              # multi-file Prisma schema + migrations
├── src/
│   ├── app/
│   │   ├── Error/           # ApiError class
│   │   ├── helper/          # OpenRouter client, etc.
│   │   ├── middlewares/     # auth, error handler, JSON extractor
│   │   ├── modules/
│   │   │   ├── AI/
│   │   │   ├── Admin/
│   │   │   ├── attendance/
│   │   │   ├── auth/
│   │   │   ├── construction site/
│   │   │   ├── payment/
│   │   │   ├── user/
│   │   │   ├── workAssignment/
│   │   │   └── worker/
│   │   └── shared/          # prisma client, utils
│   ├── app.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

## Getting Started

```bash
git clone https://github.com/aalnoman2042/workSite-management-backend.git
cd workSite-manager-backend
npm install
npx prisma generate --schema=./prisma/schema
npx prisma migrate deploy --schema=./prisma/schema
npm run dev
```

Required env vars (in `.env`):

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
STRIPE_SECRET_KEY=
OPENROUTER_API_KEY=
```

## Scripts

| Script          | Purpose                              |
|-----------------|--------------------------------------|
| `npm run dev`   | Start dev server (ts-node-dev)       |
| `npm run build` | Type-check the project               |
| `npm start`     | Run compiled output from `dist/`     |

## Deployment

Pushes to `main` trigger an automatic Vercel deployment.
