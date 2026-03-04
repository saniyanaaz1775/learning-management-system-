# Deploy LMS to Render (Backend) and Vercel (Frontend)

Deploy the **backend first** so you have the API URL for the frontend.

---

## Part 1: Deploy backend on Render

### 1. Create a Render account and connect GitHub

1. Go to [render.com](https://render.com) and sign up (or log in).
2. Click **Dashboard** → **New** → **Web Service**.
3. Connect your GitHub account if needed, then select the repo: **learning-management-system-** (or your repo name).
4. Choose the **main** branch.

### 2. Configure the service

1. **Name**: e.g. `lms-api` (or leave default).
2. **Region**: Pick the one closest to your users.
3. **Root Directory**: set to **`backend`** (so Render runs commands inside the backend folder).
4. **Runtime**: **Node**.
5. **Build Command** (must run from `backend`):
   ```bash
   npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"
   ```
   (The script normalizes `DATABASE_URL` so Prisma accepts it; avoids P1013 from quotes or `jdbc:` scheme.)
6. **Start Command**:
   ```bash
   node scripts/start-with-migrate.js
   ```
   (Resolves any P3009 failed migration, runs migrations, then starts the server.)
7. **Instance type**: Free (or paid if you prefer).

### 3. Set environment variables

In the same Web Service screen, open **Environment** and add:

| Key | Value | Notes |
|-----|--------|--------|
| `NODE_ENV` | `production` | Often set by default. |
| `DATABASE_URL` | Your MySQL URL | Format: `mysql://user:password@host:port/database` (optional `?ssl-mode=REQUIRED` etc.). **No quotes** in Render. Use `mysql://` not `jdbc:mysql://`. URL-encode special characters in the password. |
| `JWT_ACCESS_SECRET` | Long random string | Generate a strong secret (e.g. 32+ chars). |
| `JWT_REFRESH_SECRET` | Another long random string | Different from access secret. |
| `CORS_ORIGIN` | *(leave empty for now)* | You’ll set this after deploying the frontend (Step 6). |
| `COOKIE_DOMAIN` | *(leave empty)* | Optional; leave blank unless you use a custom domain. |
| `ADMIN_EMAIL` | Your admin user email | e.g. `admin@example.com` — this user will see “Add Course”. |

- For **JWT_ACCESS_SECRET** and **JWT_REFRESH_SECRET**, Render can generate values: use **Generate** next to the field if available, or create your own and paste.

### 4. Deploy

1. Click **Create Web Service**.
2. Wait for the first deploy to finish (Build → Deploy).
3. If the build fails, check the logs (often `DATABASE_URL` or Prisma). Fix and redeploy.
4. When it’s live, copy your service URL, e.g. **`https://lms-api.onrender.com`**. You’ll use this as the API URL for Vercel.

### 5. (Optional) Run migrations separately

If you prefer not to run migrations in the start command:

1. In Render, open your service → **Shell** tab (if available).
2. Run: `npx prisma migrate deploy`.
3. Then use **Start Command**: `node dist/server.js` only.

---

## Part 2: Deploy frontend on Vercel

### 1. Create a Vercel account and import the repo

1. Go to [vercel.com](https://vercel.com) and sign up (or log in) with GitHub.
2. Click **Add New** → **Project**.
3. Import your GitHub repo (**learning-management-system-** or your repo name).
4. Leave branch as **main**.

### 2. Configure the project

1. **Root Directory**: Click **Edit** and set to **`frontend`** (so Vercel builds the Next.js app).
2. **Framework Preset**: Vercel should detect **Next.js**.
3. **Build Command**: leave default **`next build`** (or `npm run build`).
4. **Output Directory**: leave default (no need to set for Next.js).
5. **Install Command**: leave default **`npm install`**.

### 3. Set environment variable

Before deploying, add:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | Your Render backend URL, e.g. `https://lms-api.onrender.com` |

- No trailing slash.
- Must be the **HTTPS** URL of the backend you deployed in Part 1.

### 4. Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. When it’s done, copy your frontend URL, e.g. **`https://learning-management-system-xxx.vercel.app`**.

---

## Part 3: Connect backend and frontend

### 6. Set CORS on Render

1. In **Render** → your **lms-api** service → **Environment**.
2. Set **CORS_ORIGIN** to your Vercel frontend URL, e.g.:
   ```text
   https://learning-management-system-xxx.vercel.app
   ```
3. If you have multiple frontend URLs (e.g. preview deployments), use a comma-separated list:
   ```text
   https://your-app.vercel.app,https://your-app-xxx.vercel.app
   ```
4. Save. Render will redeploy with the new env.

### 7. Test the live app

1. Open your **Vercel** frontend URL in the browser.
2. **Register** or **Log in** — you should get a success toast and redirect.
3. Open **Courses** — the list should load (with a short loading state).
4. Log in with the email you set as **ADMIN_EMAIL** — you should see **Add Course** in the header. Create a test course with one lesson (YouTube URL) and confirm it appears on the Courses page.
5. Enroll in a course, open a video, and complete it — you should see “Lesson completed” and progress should persist.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Frontend can’t reach API (CORS / network errors) | Backend **CORS_ORIGIN** must exactly match the frontend origin (Vercel URL). No trailing slash. |
| API requests go to localhost | Frontend **NEXT_PUBLIC_API_BASE_URL** must be your Render URL. Redeploy frontend after changing env. |
| 503 / “Admin not configured” | Set **ADMIN_EMAIL** in Render if you use the Add Course feature. |
| Database errors on Render | Check **DATABASE_URL** (correct host, user, password, DB name, SSL params if required). Run `npx prisma migrate deploy` if needed. |
| **P1013: database string invalid** | **DATABASE_URL** must be `mysql://user:password@host:port/db` with **no surrounding quotes** in Render. Use `mysql://` not `jdbc:mysql://`. Encode special characters in password (e.g. `@` → `%40`). The repo’s build/start use a normalizer script to strip quotes and fix `jdbc:` automatically. |
| Build fails on Render | Check **Root Directory** is `backend`. Use the build command from this doc (includes `with-normalized-env.js`). |
| Build fails on Vercel | Check **Root Directory** is `frontend`. Ensure **Build Command** is `next build` (or `npm run build`). |

---

## Quick reference

**Render (backend)**  
- Root: `backend`  
- Build: `npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"`  
- Start: `node scripts/start-with-migrate.js`  
- Env: `DATABASE_URL` (no quotes), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `ADMIN_EMAIL`

**Vercel (frontend)**  
- Root: `frontend`  
- Build: `next build`  
- Env: `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL
