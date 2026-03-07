'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { apiClient } from '@/lib/apiClient';
import { authStore } from '@/store/authStore';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';

export default function ProfileEditPage() {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const setUser = authStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setName(user.name ?? '');
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.patch<{ id: number; email: string; name: string }>(
        '/api/auth/me',
        { name: name.trim() }
      );
      setUser({ id: data.id, email: data.email, name: data.name });
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            ← Back to profile
          </Link>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50">
          <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
            Edit profile
          </h1>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="edit-name"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-email"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400"
                aria-readonly
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Email cannot be changed here.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-neutral-900"
              >
                {loading ? <Spinner className="h-4 w-4 shrink-0" /> : 'Save changes'}
              </button>
              <Link
                href="/profile"
                className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:focus:ring-offset-neutral-900"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </AuthGuard>
  );
}
