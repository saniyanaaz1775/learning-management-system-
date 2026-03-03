import { config } from './config';
import { authStore } from '@/store/authStore';
import type { User } from '@/store/authStore';

const BASE = config.API_BASE_URL;
const NETWORK_ERROR_MSG = `Cannot reach server at ${BASE}. Start the backend: cd backend && npm run dev`;

async function authFetch(
  path: string,
  body: Record<string, unknown>
): Promise<{ user: User; accessToken: string }> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof TypeError && e.message === 'Failed to fetch'
      ? NETWORK_ERROR_MSG
      : (e instanceof Error ? e.message : 'Network error');
    throw new Error(msg);
  }
  let data: { error?: string; user?: User; accessToken?: string } = {};
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
  return { user: data.user, accessToken: data.accessToken };
}

export async function login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
  const result = await authFetch('/api/auth/login', { email, password });
  authStore.getState().login(result.user, result.accessToken);
  return result;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{ user: User; accessToken: string }> {
  const result = await authFetch('/api/auth/register', { email, password, name });
  authStore.getState().login(result.user, result.accessToken);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    authStore.getState().logout();
  }
}
