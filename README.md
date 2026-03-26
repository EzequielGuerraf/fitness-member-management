# Fitness Member Management

Full-stack app for managing gym members, memberships, and check-ins.

Tech stack:
- Frontend: React + Vite
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma

## Prerequisites

Before you start, make sure you have:

- Node.js 20+ installed
- npm installed
- Docker Desktop (or Docker Engine + Docker Compose) running
- These ports available locally: `5433`, `3001`, `5173`

## Run Locally

### 1. Start PostgreSQL with Docker

From the project root, run:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5433`.

### 2. Install dependencies

From the project root, run:

```bash
npm install
npm run install:all
```

This installs:
- the root dependencies
- backend dependencies
- frontend dependencies

### 3. Create the backend environment file

Create a file named `backend/.env` with this content:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fitness_app?schema=public"
PORT=3001
NODE_ENV=development
```

No frontend `.env` file is required for local development. The frontend already defaults to `http://localhost:3001` for the API.

### 4. Run migrations and seed the database

Open a terminal in `backend/` and run:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

The seed creates sample data for local testing:
- 10 members
- 3 membership plans
- 20 check-ins

### 5. Start the backend

In one terminal, run:

```bash
cd backend
npm run dev
```

Backend URL:
- API: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

### 6. Start the frontend

In a second terminal, run:

```bash
cd frontend
npm run dev
```

Frontend URL:
- App: `http://localhost:5173`

## Optional: Start both with one command

After finishing the setup above, you can also run both apps from the project root:

```bash
npm run dev
```

## Quick local check

If everything is working:

- `docker compose up -d` starts PostgreSQL without errors
- `http://localhost:3001/health` returns a healthy response
- `http://localhost:5173` loads the UI


## Stop the local database

When you are done, you can stop PostgreSQL with:

```bash
docker compose down
```
