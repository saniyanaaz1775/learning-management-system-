'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { CoursesList } from '@/components/Courses/CoursesList';

/** Simple learning illustration for hero (books / growth). */
function HeroIllustration() {
  return (
    <div className="relative hidden h-64 w-64 shrink-0 lg:block" aria-hidden>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="h-full w-full opacity-90"
      >
        <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1" />
        <circle cx="100" cy="100" r="60" fill="white" fillOpacity="0.08" />
        <path
          d="M70 85 L70 135 L85 128 L100 135 L115 128 L130 135 L130 85 L115 92 L100 85 L85 92 Z"
          fill="white"
          fillOpacity="0.25"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
        <path
          d="M75 90 L75 125 L90 118 L105 125 L120 118 L125 125 L125 90 L110 97 L95 90 L80 97 Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M100 70 L120 82 L120 115 L100 125 L80 115 L80 82 Z"
          fill="white"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero banner */}
        <section
          className="flex min-h-[320px] items-center justify-between gap-8 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 p-10 text-white"
          style={{ minHeight: '320px' }}
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Build in-demand skills
            </h1>
            <p className="mt-3 max-w-md text-lg text-white/90">
              Learn programming and technology with curated courses.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#courses-grid"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 font-medium text-purple-700 shadow transition-colors hover:bg-white/95"
              >
                Start Learning
              </Link>
              <Link
                href="#courses-grid"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 bg-transparent px-5 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
              >
                Explore Courses
              </Link>
            </div>
          </div>
          <HeroIllustration />
        </section>

        {/* Courses grid */}
        <section id="courses-grid" className="mt-12">
          <CoursesList />
        </section>
      </div>
    </AuthGuard>
  );
}
