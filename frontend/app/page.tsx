'use client';

import { AuthGuard } from '@/components/Auth/AuthGuard';
import { DashboardOverview } from '@/components/Dashboard/DashboardOverview';

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Your learning overview. Enrolled courses, progress, and continue learning.
          </p>
        </header>
        <section className="min-w-0">
          <DashboardOverview />
        </section>
      </div>
    </AuthGuard>
  );
}
