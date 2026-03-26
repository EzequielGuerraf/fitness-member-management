# fitness-member-management

Full-stack coding challenge workspace using React, Vite, Express, TypeScript, PostgreSQL, and Prisma.

## Backend foundation

### Folder structure

```text
backend/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    app.ts
    server.ts
    config/
    lib/
    middleware/
    modules/
      members/
      plans/
      memberships/
      checkins/
```

### Backend features in this step

- Prisma schema with PostgreSQL tables for members, membership plans, memberships, and check-ins
- Seed data for at least one active membership plan
- Express + TypeScript API with Zod request validation
- Thin controllers, service-layer business rules, and centralized error handling
- Transaction-safe membership assignment with a DB-level partial unique index for active memberships
- Minimal backend test covering the one-active-membership rule

### Backend setup

1. Start PostgreSQL.

```bash
docker compose up -d
```

2. Install backend dependencies.

```bash
cd backend
npm install
```

3. Create the backend environment file.

```bash
copy .env.example .env
```

If you are not on Windows, create `backend/.env` with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fitness_app?schema=public"
PORT=3001
NODE_ENV=development
```

4. Generate Prisma client and apply the checked-in migration.

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

5. Seed the database.

```bash
npm run prisma:seed
```

6. Start the backend.

```bash
npm run dev
```

The API will be available at `http://localhost:3001`, and the health check is `GET /health`.

### Backend scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm test`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:migrate:deploy`
- `npm run prisma:migrate:status`
- `npm run prisma:seed`

Use `npm run prisma:migrate` when you are actively creating a new migration during development.

### Root scripts

- `npm run dev`
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`
- `npm run build:backend`
- `npm run build:frontend`

### API endpoints

- `GET /health`
- `POST /members`
- `GET /members?q=`
- `GET /members/:id`
- `GET /plans`
- `POST /plans`
- `POST /members/:id/memberships`
- `POST /members/:id/memberships/:membershipId/cancel`
- `POST /members/:id/check-ins`

### Example request bodies

Create member:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com"
}
```

Assign membership:

```json
{
  "planId": "9f6ef6eb-8f4a-4f7c-b50c-090e7d93c9f1",
  "startDate": "2026-03-25"
}
```

Cancel membership:

```json
{
  "effectiveDate": "2026-03-25"
}
```

### Error response shape

```json
{
  "error": {
    "code": "ACTIVE_MEMBERSHIP_ALREADY_EXISTS",
    "message": "Member already has an active membership."
  }
}
```

### Member summary shape

`GET /members/:id` returns the member record plus:

- current active membership and plan, if one exists
- last check-in timestamp, if any
- check-in count in the last 30 days

## Frontend

The frontend scaffold is still present in `frontend/`, but this step focuses only on backend domain, persistence, business rules, and API endpoints.
