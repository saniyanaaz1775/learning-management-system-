const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export const config = {
  API_BASE_URL,
  /** True when talking to a production backend (used for retry and error messages). */
  isProductionApi: typeof window !== 'undefined' && API_BASE_URL.startsWith('https://') && !API_BASE_URL.includes('localhost'),
} as const;
