# LMS Deployment Checklist

## Backend (Render)

- **PORT**: Set automatically by Render; app uses `process.env.PORT` (default 3001 locally).
- **CORS**: Set `CORS_ORIGIN` in Render to your frontend URL (e.g. `https://your-app.vercel.app`). For multiple origins use comma-separated values.
- **Env vars** (in Render dashboard):
  - `DATABASE_URL` (required)
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (Render can generate)
  - `CORS_ORIGIN` = frontend production URL
  - `COOKIE_DOMAIN` = your domain for cookies (optional; leave blank for same-origin)
  - `ADMIN_EMAIL` = email of the user who can use Add Course (optional but required for admin feature)
- **Build**: `npm install && npx prisma generate && npm run build`
- **Start**: `node dist/server.js`
- **Database**: Run `npx prisma migrate deploy` (e.g. in a one-off job or pre-start script) if migrations exist.

## Frontend (Vercel)

- **Build command**: `next build` (default)
- **Env var**: `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL (e.g. `https://lms-api.onrender.com`). Required for API calls in production.
- **Output**: Next.js default; no custom `vercel.json` required.

## After deployment

1. **Login** – Register or log in; expect success toast and redirect.
2. **Course loading** – Open Courses; list should load (spinner then cards).
3. **Admin Add Course** – Log in with the `ADMIN_EMAIL` user; "Add Course" should appear in the nav; create a course with at least one lesson (YouTube URL); expect success toast and course on Courses page.
4. **Progress** – Enroll in a course, open a video, play and complete; expect "Lesson completed" toast and progress to persist.

If any step fails, check browser Network tab and backend logs (Render/Vercel); fix CORS, env, or API base URL as needed.
