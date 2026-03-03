'use client';

import { AuthGuard } from '@/components/Auth/AuthGuard';
import { CoursesList } from '@/components/Courses/CoursesList';

export default function CoursesPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Courses
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Browse all available courses and enroll to start learning.
          </p>
        </header>
        <section className="min-w-0">
          <CoursesList />
        </section>
      </div>
    </AuthGuard>
  );
}
