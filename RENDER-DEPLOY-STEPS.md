# Exact steps to deploy LMS backend on Render (successful)

Follow these in order. Do not add quotes around values in the Render dashboard unless stated.

---

## Step 1: Push your code

1. Ensure all backend changes are committed and pushed to your GitHub repo (e.g. `main` branch).
2. Repo must contain the `backend` folder with `package.json`, `prisma/`, `src/`, and `scripts/with-normalized-env.js`.

---

## Step 2: Create the Web Service on Render

1. Go to **https://dashboard.render.com** and log in.
2. Click **New +** → **Web Service**.
3. Connect GitHub if needed, then select the repository that contains your LMS project.
4. Click **Connect** (or **Use this repository**).
5. Confirm the branch is **main** (or your default branch).

---

## Step 3: Configure the service (exact values)

Fill in these fields **exactly**:

| Field | Value |
|--------|--------|
| **Name** | `lms-api` (or any name you like) |
| **Region** | Choose one (e.g. Oregon, Frankfurt) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"` |
| **Start Command** | `node scripts/start-with-migrate.js` |
| **Instance Type** | Free (or Paid if you prefer) |

Do **not** add a trailing slash to Root Directory. Copy-paste the Build and Start commands as a single line each.

---

## Step 4: Set environment variables

1. In the same screen, open the **Environment** section (or **Environment Variables**).
2. Click **Add Environment Variable** and add each of these. **Paste values without surrounding quotes.**

| Key | Value | Required? |
|-----|--------|-----------|
| `NODE_ENV` | `production` | Yes |
| `DATABASE_URL` | Your MySQL URL, e.g. `mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED` | **Yes** |
| `JWT_ACCESS_SECRET` | Long random string (e.g. 32+ characters) | Yes |
| `JWT_REFRESH_SECRET` | Another long random string (different from above) | Yes |
| `CORS_ORIGIN` | Your frontend URL, e.g. `https://your-app.vercel.app` (set after Vercel deploy) | Yes for production |
| `COOKIE_DOMAIN` | Leave **empty** unless you use a custom domain | No |
| `ADMIN_EMAIL` | Email that should see “Add Course”, e.g. `admin@example.com` | Optional |

**DATABASE_URL rules (avoids P1013):**

- Format: `mysql://user:password@host:port/database`  
  Optional query: `?ssl-mode=REQUIRED` or `?ssl-mode=REQUIRED&sslaccept=strict`
- **Do not** put the value in quotes in Render (no `"` or `'`).
- Use **mysql://** only (not `jdbc:mysql://`).
- If the password has `@`, `#`, `:`, `/`, `?`, encode them (e.g. `@` → `%40`).

Example (replace with your real host, user, password, port, database):

```text
mysql://avnadmin:YourPassword@mysql-xxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
```

For **JWT_ACCESS_SECRET** and **JWT_REFRESH_SECRET**, you can use Render’s **Generate** button if available, or create your own and paste (no quotes).

---

## Step 5: Create the service and wait for deploy

1. Click **Create Web Service**.
2. Wait for the **Build** to finish (logs will show `npm install`, `prisma generate`, `tsc`). Build can take a few minutes.
3. If the build fails, open **Logs** and check the error:
   - **P1013 / invalid database string** → Fix **DATABASE_URL** (no quotes, `mysql://`, correct format), save, and **Manual Deploy** again.
   - **Module not found / TypeScript errors** → Ensure Root Directory is `backend` and Build Command is exactly as in Step 3.
4. After the build succeeds, Render runs the **Start** command. The service will show **Live** when it’s up.

---

## Step 6: Get the backend URL and test

1. At the top of the service page, copy the URL (e.g. `https://lms-api.onrender.com` or `https://learning-management-system-xxx.onrender.com`).
2. In the browser, open: `https://YOUR-RENDER-URL/api/health`  
   You should see a JSON response (e.g. `{"status":"ok"}`).
3. If you haven’t set **CORS_ORIGIN** yet, add it now (your Vercel frontend URL), then use **Manual Deploy** → **Deploy latest commit** so the new env is used.

---

## Step 7: (Optional) Run migrations only once

If you prefer to run migrations separately:

1. Open your service on Render → **Shell** tab (if available).
2. Run: `npx prisma migrate deploy`
3. Then you can change **Start Command** to:  
   `node scripts/with-normalized-env.js "node dist/server.js"`  
   so it only starts the server (no migrate on every start).

---

## Quick copy-paste

**Root Directory:**  
`backend`

**Build Command:**  
`npm install --include=dev && node scripts/with-normalized-env.js "npx prisma generate && npm run build"`

**Start Command:**  
`node scripts/start-with-migrate.js`

**Required env vars:**  
`NODE_ENV` = `production`  
`DATABASE_URL` = your `mysql://...` URL (no quotes)  
`JWT_ACCESS_SECRET` = long random string  
`JWT_REFRESH_SECRET` = long random string  
`CORS_ORIGIN` = your frontend URL (e.g. Vercel)  
`ADMIN_EMAIL` = admin user email (optional)

---

If a deploy fails, check **Logs** for the exact error and fix the step that matches it (usually Root Directory, Build/Start command, or **DATABASE_URL** format).
