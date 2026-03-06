# SkillSphere LMS – Deployment Guide

Deploy **Frontend → Vercel**, **Backend → Render**, **Database → MySQL**.

---

## 1. Project verification summary

| Item | Status |
|------|--------|
| **frontend/** | ✅ Next.js 14, `package.json`, `npm run build` |
| **backend/** | ✅ Express, `package.json`, `npm run build` (tsc), Prisma |
| **Prisma** | ✅ `provider = "mysql"`, `url = env("DATABASE_URL")` |
| **Env vars** | ✅ Backend: env.ts + .env.example; Frontend: `NEXT_PUBLIC_API_BASE_URL` |
| **Health** | ✅ `GET /api/health` returns `{ status: 'ok' }` |
| **CORS** | ✅ Uses `CORS_ORIGIN` (comma-separated); credentials: true |

---

## 2. Required environment variables

### Backend (Render)

Add these in **Render Dashboard → Your Web Service → Environment**.

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto on Render | Render sets this; optional locally (default 3001). |
| `DATABASE_URL` | Yes | See MySQL format below. |
| `JWT_ACCESS_SECRET` | Yes | Long random string (e.g. 32+ chars). |
| `JWT_REFRESH_SECRET` | Yes | Long random string (e.g. 32+ chars). |
| `CORS_ORIGIN` | Yes (after frontend deploy) | Your Vercel URL, e.g. `https://your-app.vercel.app` (no trailing slash). Multiple: comma-separated. |
| `COOKIE_DOMAIN` | Optional | Leave empty for same-origin. |
| `COOKIE_NAME` | Optional | Default `refreshToken`. |
| `ADMIN_EMAIL` | Optional | Email that can access Admin → Add Course. |

### MySQL `DATABASE_URL` format

- **Format:** `mysql://USER:PASSWORD@HOST:PORT/DATABASE?params`
- **No quotes** when pasting in Render.
- **Special characters in password** must be URL-encoded (e.g. `@` → `%40`, `#` → `%23`, `%` → `%25`).
- **SSL** (required for most cloud MySQL, e.g. PlanetScale, Railway, Render MySQL):

  ```
  mysql://user:password@host:3306/dbname?ssl-mode=REQUIRED
  ```

  Or:

  ```
  mysql://user:password@host:3306/dbname?ssl-mode=REQUIRED&sslaccept=strict
  ```

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://your-backend.onrender.com` (no trailing slash). |

---

## 3. Database (MySQL)

- Create a MySQL database (PlanetScale, Railway, Render MySQL, or any MySQL 8-compatible host).
- Run migrations **from your machine** once (or from Render in Start Command):

  ```bash
  cd backend
  export DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE?ssl-mode=REQUIRED"
  npx prisma migrate deploy
  ```

- Optional: seed data (if you have a seed script):

  ```bash
  npm run db:seed
  ```

---

## 4. Backend deployment (Render)

### 4.1 Create Web Service

1. **Render** → **New** → **Web Service**.
2. Connect your Git repo (e.g. GitHub).
3. Configure:

   | Setting | Value |
   |--------|--------|
   | **Name** | e.g. `skillsphere-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install --include=dev && npx prisma generate && npm run build` |
   | **Start Command** | `npx prisma migrate deploy && node dist/server.js` |

### 4.2 Environment variables (Render)

In the same service, **Environment** tab, add all backend variables from the table above (including `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`). Leave `CORS_ORIGIN` for step 7.

### 4.3 Deploy

- **Deploy** the service. Wait until the build succeeds and the service is **Live**.
- Copy the **backend URL** (e.g. `https://skillsphere-api.onrender.com`). No trailing slash.

### 4.4 Verify backend

- Open: `https://YOUR-BACKEND-URL.onrender.com/api/health`  
- Expected: `{ "status": "ok" }`.

---

## 5. Frontend deployment (Vercel)

### 5.1 Create project

1. **Vercel** → **Add New** → **Project**.
2. Import the same Git repo.
3. Configure:

   | Setting | Value |
   |--------|--------|
   | **Root Directory** | `frontend` (or set and override if needed). |
   | **Framework Preset** | Next.js (auto-detected). |
   | **Build Command** | `npm run build` (default). |
   | **Output Directory** | leave default. |

### 5.2 Environment variable (Vercel)

- **Environment Variables** → add:
  - **Name:** `NEXT_PUBLIC_API_BASE_URL`
  - **Value:** `https://YOUR-BACKEND-URL.onrender.com` (the URL from step 4.3, no trailing slash).
- Apply to **Production** (and Preview if you want).

### 5.3 Deploy

- **Deploy**. After build, note the **frontend URL** (e.g. `https://your-app.vercel.app`).

### 5.4 No localhost in production

- The app uses `NEXT_PUBLIC_API_BASE_URL` for all API calls. As long as this is set in Vercel to your Render backend URL, no localhost URLs are used in production.

---

## 6. CORS configuration

- Backend reads **one or more** origins from `CORS_ORIGIN` (comma-separated).
- After the frontend is deployed, set on **Render** (Environment):
  - `CORS_ORIGIN` = `https://your-app.vercel.app`
  - For multiple (e.g. preview + production): `https://your-app.vercel.app,https://preview.vercel.app`
- **Redeploy** the backend on Render after changing `CORS_ORIGIN` so the new value is applied.

---

## 7. Deployment order (exact steps)

1. **Step 1:** Deploy **backend** on Render (Root: `backend`, Build/Start commands as above). Set all env vars **except** `CORS_ORIGIN` (or set it to your Vercel URL if you already know it).
2. **Step 2:** Get the **backend URL** (e.g. `https://skillsphere-api.onrender.com`). Verify `GET /api/health` returns `{ "status": "ok" }`.
3. **Step 3:** In **Vercel**, add env: `NEXT_PUBLIC_API_BASE_URL` = backend URL (no trailing slash).
4. **Step 4:** Deploy **frontend** on Vercel (Root: `frontend`, Build: `npm run build`).
5. **Step 5:** In **Render**, set `CORS_ORIGIN` = your Vercel frontend URL (e.g. `https://your-app.vercel.app`). Redeploy backend if needed.

---

## 8. Final verification checklist

After both deployments:

- [ ] **Backend health:** `https://YOUR-BACKEND-URL/api/health` → `{ "status": "ok" }`.
- [ ] **Frontend loads:** Open Vercel URL; page loads without errors.
- [ ] **API calls work:** e.g. Courses or Dashboard load data.
- [ ] **Login / Register:** Auth works; no CORS errors in browser DevTools → Network / Console.
- [ ] **Courses load:** Enroll and view course content.
- [ ] **No CORS errors:** Console and Network show no blocked requests; cookies/credentials work if you use cookie-based auth.

---

## 9. Quick reference

### Render (backend)

- **Root Directory:** `backend`
- **Build Command:** `npm install --include=dev && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && node dist/server.js`

### Vercel (frontend)

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Env:** `NEXT_PUBLIC_API_BASE_URL` = Render backend URL (no trailing slash)

### MySQL URL

- Valid format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED`
- Encode special characters in the password.
