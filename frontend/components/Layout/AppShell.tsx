'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authStore } from '@/store/authStore';
import { logout as apiLogout } from '@/lib/auth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function logout() {
    await apiLogout();
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          LMS
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className={pathname === '/' ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}
              >
                Dashboard
              </Link>
              <Link
                href="/courses"
                className={pathname === '/courses' ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}
              >
                Courses
              </Link>
              <Link
                href="/my-learning"
                className={pathname === '/my-learning' ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}
              >
                My Learning
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${pathname === '/profile' ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  Profile
                  <span className="text-xs" aria-hidden>▼</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile details
                    </Link>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                Login
              </Link>
              <Link href="/auth/register" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
