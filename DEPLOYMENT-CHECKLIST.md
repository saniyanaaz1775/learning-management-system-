# SkillSphere LMS — Production Deployment Checklist

**Stack:** Frontend (Next.js) → Vercel | Backend (Node/Express) → Render | Database → MySQL (e.g. Aiven)

---

## 1. Backend (Render)

- **Root Directory:** `backend`
- **Build Command:** `npm install --include=dev && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && node dist/server.js`

### Environment variables (Render)

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | Set by Render | — |
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | `mysql://USER:PASS@HOST:3306/DB?ssl-mode=REQUIRED&sslaccept=strict` |
| `JWT_ACCESS_SECRET` | Yes | Min 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Min 32 characters |
| `CORS_ORIGIN` | Yes | `https://learning-management-system-sigma-khaki.vercel.app` |
| `HUGGINGFACE_API_KEY` | Optional (AI) | Hugging Face token with Inference Providers permission |
| `COOKIE_DOMAIN` | Optional | Leave empty for same-origin |
| `COOKIE_NAME` | Optional | `refreshToken` |
| `ADMIN_EMAIL` | Optional | For admin add-course |

**MySQL URL:** No surrounding quotes. Encode special characters in password (`@` → `%40`, `#` → `%23`).

---

## 2. Frontend (Vercel)

- **Root Directory:** `frontend`
- **Framework:** Next.js 14 (detected automatically)
- **Build Command:** `npm run build` (default)
- **Output:** Next.js default

### Environment variable (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://learning-management-system-5w6m.onrender.com` |

**Note:** This project uses **Next.js**, not Vite. Use `NEXT_PUBLIC_API_BASE_URL` (not `VITE_API_BASE_URL`). No trailing slash.

---

## 3. CORS

On Render, set:

```bash
CORS_ORIGIN=https://learning-management-system-sigma-khaki.vercel.app
```

Multiple origins: comma-separated, no spaces after commas.

---

## 4. Deployment order

1. Deploy **backend** on Render first. Wait until the service is live and health returns OK: `GET https://your-render-url.onrender.com/api/health`
2. Set **frontend** env on Vercel: `NEXT_PUBLIC_API_BASE_URL=https://your-render-url.onrender.com`
3. Deploy **frontend** on Vercel.

---

## 5. Post-deploy verification

- [ ] Homepage loads
- [ ] Login / Register works
- [ ] Courses load
- [ ] Dashboard statistics display
- [ ] Code compiler runs
- [ ] AI assistant responds (if `HUGGINGFACE_API_KEY` is set)
- [ ] Certificates system works
- [ ] No CORS errors in browser console
- [ ] No console errors on critical flows

---

## 6. AI assistant (Hugging Face)

The backend uses the **Hugging Face Router** chat completions API (`https://router.huggingface.co/v1/chat/completions`) with multiple fallback models. The API key is only read on the backend and is never exposed to the frontend. Set `HUGGINGFACE_API_KEY` in Render for the AI chatbot to work.

---

## 7. Database (e.g. Aiven MySQL)

- Allow Render egress IPs (or “allow from anywhere” for development) in Aiven → MySQL → Allowed IP addresses.
- Use `ssl-mode=REQUIRED` and `sslaccept=strict` (or `accept_invalid_certs` only for local dev if needed).

---

*Last updated for production deployment.*
