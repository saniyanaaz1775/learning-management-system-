import { config } from './config';
import { authStore } from '@/store/authStore';

const BASE = config.API_BASE_URL;
const NETWORK_MSG_LOCAL = `Cannot reach server at ${BASE}. Start the backend: cd backend && npm run dev`;
const NETWORK_MSG_PRODUCTION = `Cannot reach the backend at ${BASE}. If the backend was sleeping (Render free tier), wait ~1 minute and try again. Otherwise set CORS_ORIGIN on Render to your Vercel URL (e.g. https://learning-management-system-sigma-khaki.vercel.app).`;

type RequestInitWithAuth = RequestInit & { skipAuth?: boolean };

function getNetworkErrorMsg(): string {
  return config.isProductionApi ? NETWORK_MSG_PRODUCTION : NETWORK_MSG_LOCAL;
}

async function doFetch(
  path: string,
  options: RequestInitWithAuth = {},
  retrying = false
): Promise<Response> {
  const { skipAuth, ...init } = options;
  const headers = new Headers(init.headers);
  if (!skipAuth && authStore.getState().accessToken) {
    headers.set('Authorization', `Bearer ${authStore.getState().accessToken}`);
  }
  if (!headers.has('Content-Type') && (init.body as string | undefined) && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (e) {
    const isFailedFetch = e instanceof TypeError && e.message === 'Failed to fetch';
    if (isFailedFetch && config.isProductionApi && !retrying) {
      await new Promise((r) => setTimeout(r, 8000));
      return doFetch(path, options, true);
    }
    const msg = isFailedFetch ? getNetworkErrorMsg() : (e instanceof Error ? e.message : 'Network error');
    throw new Error(msg);
  }
  if (res.status === 401 && !retrying && !skipAuth) {
    const refreshed = await refreshToken();
    if (refreshed) return doFetch(path, options, true);
    authStore.getState().logout();
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
    return res;
  }
  return res;
}

async function refreshToken(): Promise<boolean> {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.accessToken) {
    authStore.getState().setAccessToken(data.accessToken);
    return true;
  }
  return false;
}

export const apiClient = {
  async get<T = unknown>(path: string, options?: RequestInitWithAuth): Promise<T> {
    const res = await doFetch(path, { ...options, method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? 'Request failed');
    }
    return res.json();
  },
  async post<T = unknown>(path: string, body?: unknown, options?: RequestInitWithAuth): Promise<T> {
    const res = await doFetch(path, {
      ...options,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? 'Request failed');
    }
    return res.json();
  },
  async put<T = unknown>(path: string, body?: unknown, options?: RequestInitWithAuth): Promise<T> {
    const res = await doFetch(path, {
      ...options,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? 'Request failed');
    }
    return res.json();
  },
  async patch<T = unknown>(path: string, body?: unknown, options?: RequestInitWithAuth): Promise<T> {
    const res = await doFetch(path, {
      ...options,
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? 'Request failed');
    }
    return res.json();
  },
};
