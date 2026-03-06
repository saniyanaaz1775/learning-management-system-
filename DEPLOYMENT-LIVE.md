# SkillSphere – Live deployment checklist

Use this checklist so the **Vercel frontend** and **Render backend** work together.

## Your live URLs

| Role   | URL |
|--------|-----|
| Frontend (Vercel) | https://learning-management-system-sigma-khaki.vercel.app |
| Backend (Render) | https://learning-management-system-5w6m.onrender.com |
| Repo (GitHub)     | https://github.com/saniyanaaz1775/learning-management-system-.git |

---

## Fix “Cannot reach the backend” (Register / Login)

If the frontend shows **“Cannot reach the backend at https://learning-management-system-5w6m.onrender.com”**, do the following.

### 1. Set CORS on Render (required)

The backend must allow requests from your Vercel URL.

1. Open **Render** → your **backend service** (learning-management-system-5w6m).
2. Go to **Environment**.
3. Add or edit:
   - **Key:** `CORS_ORIGIN`
   - **Value:** `https://learning-management-system-sigma-khaki.vercel.app`  
     (no trailing slash, no spaces)
4. **Save** and **redeploy** the service (Manual Deploy → Deploy latest commit).

### 2. Vercel environment variable

1. Open **Vercel** → your project → **Settings** → **Environment Variables**.
2. Ensure:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://learning-management-system-5w6m.onrender.com`  
     (with `https://`, no trailing slash)
3. **Redeploy** the frontend so the value is applied (Deployments → ⋮ → Redeploy).

### 3. Render free tier cold start

On the free tier, the backend sleeps after inactivity. The first request can take **up to ~1 minute**. The app will retry once after 8 seconds. If it still fails:

- Wait about 1 minute and try again, or  
- Open the backend root in a new tab to wake it: https://learning-management-system-5w6m.onrender.com  

Then retry Register or Login on the Vercel site.

---

## Quick checklist

- [ ] **Render:** `CORS_ORIGIN` = `https://learning-management-system-sigma-khaki.vercel.app`
- [ ] **Render:** Backend redeployed after changing env.
- [ ] **Vercel:** `NEXT_PUBLIC_API_BASE_URL` = `https://learning-management-system-5w6m.onrender.com`
- [ ] **Vercel:** Frontend redeployed after changing env.
- [ ] If first request fails: wait ~1 min or open backend URL to wake it, then try again.

After this, Register and Login should work from the Vercel app.
