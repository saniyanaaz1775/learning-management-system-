# LMS (Learning Management System)

Full-stack LMS with Next.js 14 frontend (Vercel), Express backend (Render), and MySQL (Aiven).

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN
npm install
npx prisma generate
npx prisma migrate deploy   # or migrate dev for local dev
npm run dev
```

Runs at `http://localhost:3001` by default.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 (or your backend URL)
npm install
npm run dev
```

Runs at `http://localhost:3000`.

### "Backend not found" or port conflict

If you see **"Backend not found"** on Register/Login, the frontend is often running on port **3001** (because 3000 was in use) and is calling itself instead of the API. Fix it in one of two ways:

**Option A – Recommended:** Use separate ports so both can run:

1. **Backend on 3002:** In a terminal: `cd backend` then run `$env:PORT="3002"; npm run dev` (PowerShell) or `PORT=3002 npm run dev` (Git Bash).
2. **Frontend points to 3002:** In `frontend/.env.local` set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002`.
3. **CORS:** In `backend/.env` set `CORS_ORIGIN=http://localhost:3000,http://localhost:3001` so the app works whether the frontend is on 3000 or 3001.
4. **Restart the frontend** (Ctrl+C then `npm run dev`) so it picks up the new API URL.
5. Open the app at the URL Next.js shows (e.g. `http://localhost:3001`).

**Option B:** Free port 3001 for the backend:

1. Stop the frontend (Ctrl+C in the terminal where it’s running).
2. Start the backend: `cd backend` then `npm run dev` (uses 3001).
3. Start the frontend: `cd frontend` then `npm run dev`. If port 3000 is free, the app will be at `http://localhost:3000`; set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` in `frontend/.env.local`.

### Database (Aiven MySQL)

Aiven MySQL requires SSL. Use this URL shape in `backend/.env` (Prisma datasource uses `env("DATABASE_URL")`):

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED&sslaccept=strict"
```

Replace `USER`, `PASSWORD`, `HOST`, and `PORT` with values from the Aiven console. Use both `ssl-mode=REQUIRED` and `sslaccept=strict` for production.

- **Windows local (P1011 TLS / cert not trusted):** If you see `P1011: certificate chain terminated in a root certificate not trusted`, use `sslaccept=accept_invalid_certs` instead of `strict` for local development only (SSL stays on; only cert verification is relaxed):  
  `?ssl-mode=REQUIRED&sslaccept=accept_invalid_certs`
- **Local:** If you see "Can't reach database server", add your machine’s public IP in Aiven → MySQL service → "Allowed IP addresses" (or "Allow access from anywhere").
- **Render:** Set `DATABASE_URL` in the service Environment to the same Aiven URL (use `sslaccept=strict` in production). Add Render’s egress IPs to Aiven’s allowed list if needed.

### "Service temporarily unavailable" or "Can't reach database server"

If Register or Login shows this, the backend cannot reach Aiven MySQL (often due to firewall / allowed IPs):

1. Open **Aiven Console** → your **MySQL** service.
2. Go to **Allowed IP addresses** (or "Networking" / "Access control").
3. Add your **current public IP** (e.g. from [whatismyip.com](https://www.whatismyip.com)), or enable **Allow access from anywhere** (`0.0.0.0/0`) for development.
4. Wait a minute, then run from `backend/`: `npx prisma migrate deploy` (if not done yet), and restart the backend server.

## Deployment

See **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** for the full production checklist.

- **Backend (Render):** Root `backend`. Build: `npm install --include=dev && npx prisma generate && npm run build`. Start: `npx prisma migrate deploy && node dist/server.js`. Health: `/api/health`. Set `DATABASE_URL`, `JWT_*`, `CORS_ORIGIN`, optional `HUGGINGFACE_API_KEY`.
- **Frontend (Vercel):** Root `frontend`. Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL (no trailing slash).
- **CORS:** Set `CORS_ORIGIN` on Render to your Vercel URL (e.g. `https://learning-management-system-sigma-khaki.vercel.app`).
- **Cookies:** Set `COOKIE_DOMAIN` only if using a shared subdomain.

## API

- `POST /api/auth/register` – register
- `POST /api/auth/login` – login
- `POST /api/auth/refresh` – refresh access token (cookie)
- `POST /api/auth/logout` – logout
- `GET /api/subjects` – list published subjects
- `GET /api/subjects/:id` – subject detail
- `GET /api/subjects/:id/tree` – subject tree (auth)
- `GET /api/subjects/:id/first-video` – first unlocked video (auth)
- `GET /api/videos/:id` – video meta + prev/next + locked (auth)
- `GET /api/progress/subjects/:id` – subject progress (auth)
- `GET /api/progress/videos/:id` – video progress (auth)
- `POST /api/progress/videos/:id` – upsert video progress (auth)
- `GET /api/health` – health check
