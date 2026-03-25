# fitness-member-management

Full-stack project skeleton for a coding challenge using React, Vite, Express, TypeScript, PostgreSQL, and Prisma.

## Project structure

```text
fitness-member-management/
  backend/
  frontend/
  docker-compose.yml
  README.md
```

## Prerequisites

- Node.js 22+
- npm 11+
- Docker Desktop or Docker Engine with Docker Compose

## Setup

### 1. Start PostgreSQL with Docker Compose

```bash
docker compose up -d
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Generate the Prisma client

```bash
npm run prisma:generate
```

### 4. Run Prisma migrations

```bash
npm run prisma:migrate -- --name init
```

Note: the Prisma schema currently contains only datasource and generator configuration. Add models before creating the first real migration.

### 5. Run the seed script

```bash
npm run prisma:seed
```

The seed is currently a placeholder and is ready to be expanded once models exist.

### 6. Start the backend

```bash
npm run dev
```

The API health check will be available at `http://localhost:3001/health`.

### 7. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 8. Start the frontend

```bash
npm run dev
```

The frontend will run on the Vite default port, usually `http://localhost:5173`.

## Environment files

Backend: `backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fitness_app?schema=public"
PORT=3001
```

Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:3001
```

## Available scripts

### Backend

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
