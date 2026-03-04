'use client';

import { useStore } from 'zustand';
import { toastStore, type ToastItem } from '@/store/toastStore';

const variantStyles: Record<ToastItem['variant'], string> = {
  success:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700',
  error:
    'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
  info:
    'bg-neutral-50 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600',
};

export function ToastContainer() {
  const toasts = useStore(toastStore, (s) => s.toasts);
  const remove = useStore(toastStore, (s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${variantStyles[t.variant]}`}
          role="alert"
        >
          <p className="text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
