# Interview Bank

Community-powered interview experience sharing with company pages, question clustering, and prediction hints.

This folder is self-contained and can be used as its own Git repo root.

Architecture walkthrough: [ARCHITECTURE.md](/home/chinu/interview-bank/ARCHITECTURE.md)

## Structure

```text
interview-bank/
├── service/              Spring Boot API on :8080
├── ui/                   React + Vite UI on :5173
├── docker-compose.yml    Local stack for this repo
└── .env.example
```

## Dependency On Token Generator

Interview submissions still use the standalone token-generator service.

- Interview Bank UI: `http://localhost:5173`
- Interview Bank API: `http://localhost:8080`
- Token Generator UI: `http://localhost:5174`
- Token Generator API: `http://localhost:8081`
- `JWT_SECRET` must be identical in both repos

Browsing and reading experiences works without token-generator. Submission flow needs token-generator running.

## Prerequisites

Docker path:

- Docker Desktop
- Docker Compose v2

Local dev path:

- Java 17+
- Maven 3.8+
- Node.js 20+
- npm

## First-Time Setup

Create the repo-level env file:

```bash
cd /home/chinu/interview-bank
cp .env.example .env
```

The repo-root `.env` is auto-loaded by the Spring Boot service for local runs.

## Run This Repo With Docker

From the repo root:

```bash
cd /home/chinu/interview-bank
docker compose up --build
```

Stop it later with:

```bash
cd /home/chinu/interview-bank
docker compose down
```

Services started by this repo:

- UI: `http://localhost:5173`
- API: `http://localhost:8080`
- Postgres: `localhost:5432`

Note: Docker runs the service in the `prod` profile, so H2 console is not available in this mode.

## Run This Repo Locally Without Docker

Terminal 1:

```bash
cd /home/chinu/interview-bank/service
mvn spring-boot:run
```

Terminal 2:

```bash
cd /home/chinu/interview-bank/ui
npm install
npm run dev
```

Local URLs:

- UI: `http://localhost:5173`
- API: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console`

## Full Submission Flow Locally

If you want token-based submission to work end-to-end, run both repos.

Terminal 1:

```bash
cd /home/chinu/token-generator
docker compose up redis -d
```

Terminal 2:

```bash
cd /home/chinu/token-generator/service
mvn spring-boot:run
```

Terminal 3:

```bash
cd /home/chinu/token-generator/ui
npm install
npm run dev
```

Terminal 4:

```bash
cd /home/chinu/interview-bank/service
mvn spring-boot:run
```

Terminal 5:

```bash
cd /home/chinu/interview-bank/ui
npm install
npm run dev
```

Then use:

1. `http://localhost:5174/?app=interview-bank` to generate a token
2. `http://localhost:5173/submit` to submit an experience

## Environment

Repo root `.env`:

```bash
JWT_SECRET=change-me-to-a-strong-random-secret-at-least-32-chars
DATABASE_URL=jdbc:postgresql://postgres:5432/interviewbank
DATABASE_USERNAME=ib_user
DATABASE_PASSWORD=ib_pass
```

Optional UI env file for custom API or hosted environments:

```bash
cd /home/chinu/interview-bank/ui
cp .env.example .env.local
```

`ui/.env.local` values:

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_TOKEN_GENERATOR_UI_URL=http://localhost:5174
```

In local `dev` mode the service uses H2 automatically. Database variables are mainly for Docker or the `prod` profile.

## Deploy On Vercel + Render + Supabase

Production setup for this repo is:

- `ui/` on Vercel
- `service/` on Render
- Postgres on Supabase
- Vercel rewrites `/api/v1/*` to the deployed backend service

### Supabase Postgres

Create a Supabase project first, then open `Connect` in the Supabase dashboard and copy a Postgres connection string.

For Spring Boot on a hosted platform, use a JDBC URL in this shape:

```bash
DATABASE_URL=jdbc:postgresql://HOST:PORT/postgres?sslmode=require
DATABASE_USERNAME=YOUR_SUPABASE_DB_USER
DATABASE_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
```

If your host cannot use Supabase direct IPv6 connections, use Supavisor session mode from the same `Connect` screen and convert that URL to `jdbc:postgresql://...`.

### Render Service

In Render, create a Web Service from this repo and set:

- Runtime: `Docker`
- Dockerfile Path: `service/Dockerfile`
- Health Check Path: `/actuator/health`

Recommended Render variables on the `interview-bank` service:

```bash
SPRING_PROFILES_ACTIVE=prod
PORT=8080
JWT_SECRET=your-shared-jwt-secret
APP_CORS_ALLOWED_ORIGINS=https://your-interview-bank.vercel.app
DATABASE_URL=jdbc:postgresql://HOST:PORT/postgres?sslmode=require
DATABASE_USERNAME=YOUR_SUPABASE_DB_USER
DATABASE_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
```

Notes:

- `DATABASE_URL` must use the `jdbc:postgresql://...` format for Spring Boot.
- `SPRING_PROFILES_ACTIVE=prod` is required for hosted Postgres.
- The service reads `PORT`, so it can run correctly on Render.
- Render free services can spin down after inactivity, so expect a cold start after idle time.

### Vercel UI

In Vercel, import this repo and set:

- Root Directory: `ui`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set Vercel environment variables:

```bash
VITE_API_BASE_URL=/api/v1
VITE_TOKEN_GENERATOR_UI_URL=https://your-token-generator.vercel.app
```

This repo's [vercel.json](/home/chinu/interview-bank/ui/vercel.json) proxies `/api/v1/:path*` to the deployed backend service. If the Render URL changes later, update only that destination URL. The UI code itself does not need to change.

### Post-Deploy Checks

Test in this order:

1. Render health:
   `https://YOUR-INTERVIEW-BANK.onrender.com/actuator/health`
2. Render API:
   `https://YOUR-INTERVIEW-BANK.onrender.com/api/v1/companies`
3. Vercel proxied API:
   `https://YOUR-INTERVIEW-BANK.vercel.app/api/v1/companies`
4. Vercel UI:
   `https://YOUR-INTERVIEW-BANK.vercel.app`

Expected health response:

```json
{"status":"UP"}
```

## API Summary

- `GET /api/v1/companies`
- `GET /api/v1/companies/trending`
- `GET /api/v1/companies/{slug}`
- `GET /api/v1/companies/{slug}/experiences`
- `GET /api/v1/experiences/{id}`
- `POST /api/v1/experiences`
- `GET /api/v1/companies/{slug}/predict?role=...`

`POST /api/v1/experiences` requires `X-Contributor-Token`, issued by the separate token-generator service.
