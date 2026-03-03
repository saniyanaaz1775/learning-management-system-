'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = authStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-neutral-500">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
