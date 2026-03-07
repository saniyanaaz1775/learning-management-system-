'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { DashboardOverview } from '@/components/Dashboard/DashboardOverview';

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <section className="rounded-xl border border-neutral-200 bg-gradient-to-r from-purple-700 to-indigo-600 p-6 text-white shadow-sm dark:border-neutral-700 sm:p-8">
          <p className="text-white/80">Your Universe of Learning</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">SkillSphere</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
            A modern learning platform where students can watch courses, practice coding, track progress, and improve their skills.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/courses"
              className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow transition-colors hover:bg-white/95"
            >
              Start Learning
            </Link>
            <Link
              href="/courses#courses-grid"
              className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg border-2 border-white/80 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore Courses
            </Link>
          </div>
        </section>
        <section className="min-w-0">
          <DashboardOverview />
        </section>
      </div>
    </AuthGuard>
  );
}
