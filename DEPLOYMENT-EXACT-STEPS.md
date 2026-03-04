# Exact deployment steps: Render (backend) + Vercel (frontend)

Deploy **backend first**, then frontend, then set CORS. No business logic changes—configuration only.

---

## 1. Backend verification (already done in repo)

- **TypeScript**: `npm run build` in `backend` produces `dist/server.js` (tsconfig `outDir: "./dist"`, `rootDir: "./src"`).
- **Start script**: `node dist/server.js` matches `package.json` `main` and start script.
- **Prisma**: `npx prisma generate` and `npx prisma migrate deploy` run via Render build/start (see below).
- **DATABASE_URL**: Must be MySQL format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE` (optional `?ssl-mode=REQUIRED`). No quotes in Render; special chars in password URL-encoded (e.g. `@` → `%40`). The repo’s `scripts/with-normalized-env.js` strips quotes and converts `jdbc:mysql://` to `mysql://`.

---

## 2. Render (backend) — exact settings

| Setting | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Node version** | 18 or 20 (set in Render **Environment** if needed: `NODE_VERSION` = `18` or use **Build Command** below) |
| **Build Command** | `npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"` |
| **Start Command** | `node scripts/start-with-migrate.js` (resolves P3009 then migrate deploy then start) |
| **Instance Type** | Free (or Paid) |

### Required environment variables (Render → Environment)

Add these; **do not wrap values in quotes** in the Render UI.

| Key | Value | Required |
|-----|--------|----------|
| `NODE_ENV` | `production` | Yes |
| `DATABASE_URL` | `mysql://USER:PASSWORD@HOST:PORT/DATABASE` (optional `?ssl-mode=REQUIRED&sslaccept=strict`) | Yes |
| `JWT_ACCESS_SECRET` | Long random string (e.g. 32+ chars) | Yes |
| `JWT_REFRESH_SECRET` | Different long random string | Yes |
| `CORS_ORIGIN` | Your Vercel frontend URL (set after Vercel deploy), e.g. `https://your-app.vercel.app` | Yes for production |
| `COOKIE_DOMAIN` | Leave empty unless using a custom domain | No |
| `ADMIN_EMAIL` | Email of user who can add courses | Optional |

**DATABASE_URL format (MySQL):**

- `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
- No surrounding quotes in Render.
- Use `mysql://` only (not `jdbc:mysql://`); the build script normalizes it if needed.
- URL-encode special characters in password (e.g. `@` → `%40`, `#` → `%23`).

After deploy, backend must start with no errors. Test: `https://YOUR-RENDER-URL/api/health` → `{"status":"ok"}`.

---

## 3. Frontend verification

- **API base URL**: `frontend/lib/config.ts` uses `process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'`. In production, set `NEXT_PUBLIC_API_BASE_URL` in Vercel to your Render backend URL so no localhost is used.
- **No localhost in production**: Only the fallback is localhost; once Vercel env is set, production uses the Render URL.

---

## 4. Vercel (frontend) — exact settings

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (or `next build`) |
| **Output Directory** | *(leave default; Next.js uses `.next` and does not use a custom output dir)* |
| **Install Command** | `npm install` (default) |

### Required environment variable (Vercel → Environment Variables)

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Your Render backend URL, e.g. `https://lms-api.onrender.com` (no trailing slash) |

Redeploy after changing this so the client bundle picks up the new URL.

---

## 5. Connect backend and frontend

1. In **Render** → your backend service → **Environment**, set **CORS_ORIGIN** to your Vercel frontend URL (e.g. `https://your-app.vercel.app`). Multiple origins: comma-separated.
2. Save; Render will redeploy with the new env.
3. Open the Vercel frontend URL and test: login, courses, progress. Ensure requests go to the Render URL (check Network tab), not localhost.

---

## 6. Git — stage, commit, push

Stage only deployment-related files. Do **not** add `backend/.env`, `frontend/.env.local`, `node_modules`, `dist`, or `.next`.

**Exact steps:**

```bash
git add backend/package.json backend/src/app.ts backend/.env.example
git add frontend/.env.local.example
git add DEPLOYMENT-EXACT-STEPS.md DEPLOYMENT.md RENDER-DEPLOY-STEPS.md
git add backend/package-lock.json backend/src/server.ts
git status
```

If you prefer a single commit for only the changes from this deployment pass:

```bash
git add backend/package.json backend/src/app.ts frontend/.env.local.example DEPLOYMENT-EXACT-STEPS.md
git status
```

Then commit and push:

```bash
git commit -m "chore: deployment config for Render and Vercel"
git push origin main
```

---

## Quick copy-paste

**Render**

- Root: `backend`
- Build: `npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"`
- Start: `node scripts/start-with-migrate.js`
- Env: `NODE_ENV`, `DATABASE_URL` (mysql://…), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, optional `ADMIN_EMAIL`, `COOKIE_DOMAIN`
- Node: 18 or 20

**Vercel**

- Root: `frontend`
- Build: `npm run build`
- Output directory: default (do not set)
- Env: `NEXT_PUBLIC_API_BASE_URL` = Render backend URL (HTTPS, no trailing slash)

**Goal:** Backend runs on Render without errors; frontend runs on Vercel and talks to the Render backend; no localhost in production.
