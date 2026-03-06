import { config } from './config';
import { authStore } from '@/store/authStore';
import type { User } from '@/store/authStore';

const BASE = config.API_BASE_URL;
const NETWORK_MSG_LOCAL = `Cannot reach server at ${BASE}. Start the backend: cd backend && npm run dev`;
const NETWORK_MSG_PRODUCTION = `Cannot reach the backend at ${BASE}. If the backend was sleeping (Render free tier), wait ~1 minute and try again. Otherwise set CORS_ORIGIN on Render to your Vercel URL (e.g. https://learning-management-system-sigma-khaki.vercel.app).`;

async function authFetch(
  path: string,
  body: Record<string, unknown>,
  retrying = false
): Promise<{ user: User; accessToken: string; isAdmin: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (e) {
    const isFailedFetch = e instanceof TypeError && e.message === 'Failed to fetch';
    if (isFailedFetch && config.isProductionApi && !retrying) {
      await new Promise((r) => setTimeout(r, 8000));
      return authFetch(path, body, true);
    }
    const msg = isFailedFetch
      ? (config.isProductionApi ? NETWORK_MSG_PRODUCTION : NETWORK_MSG_LOCAL)
      : (e instanceof Error ? e.message : 'Network error');
    throw new Error(msg);
  }
  let data: { error?: string; user?: User; accessToken?: string; isAdmin?: boolean } = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      const msg = res.status === 404
        ? `Backend not responding at ${BASE}. Start the backend in a separate terminal: cd backend && npm run dev. Then open the app at http://localhost:3000 (not ${BASE}).`
        : res.status === 500
          ? 'Server error. Try again.'
          : `Request failed (${res.status}). Ensure the backend is running: cd backend && npm run dev`;
      throw new Error(msg);
    }
  }
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}). Try again.`);
  if (!data.user || !data.accessToken) throw new Error('Invalid response from server');
  return { user: data.user, accessToken: data.accessToken, isAdmin: !!data.isAdmin };
}

export async function login(email: string, password: string): Promise<{ user: User; accessToken: string; isAdmin: boolean }> {
  const result = await authFetch('/api/auth/login', { email, password });
  authStore.getState().login(result.user, result.accessToken, result.isAdmin);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('lms_isAdmin', result.isAdmin ? '1' : '0');
    } catch {
      // ignore
    }
  }
  return result;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; accessToken: string; isAdmin: boolean }> {
  const result = await authFetch('/api/auth/register', { email, password, name });
  authStore.getState().login(result.user, result.accessToken, result.isAdmin);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('lms_isAdmin', result.isAdmin ? '1' : '0');
    } catch {
      // ignore
    }
  }
  return result;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('lms_isAdmin');
      } catch {
        // ignore
      }
    }
    authStore.getState().logout();
  }
}
