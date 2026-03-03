'use client';

import { AuthGuard } from '@/components/Auth/AuthGuard';
import { EnrolledCoursesList } from '@/components/Courses/EnrolledCoursesList';

export default function MyLearningPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            My Learning
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Courses you&apos;re enrolled in. Continue where you left off.
          </p>
        </header>
        <section className="min-w-0">
          <EnrolledCoursesList />
        </section>
      </div>
    </AuthGuard>
  );
}
