'use client';

import { useState } from 'react';
import { config } from '@/lib/config';
import { authStore } from '@/store/authStore';

export interface CertificateCardProps {
  courseId: string;
  courseTitle: string;
  completedAt: string | null;
  isUnlocked: boolean;
}

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function CertificateCard({
  courseId,
  courseTitle,
  completedAt,
  isUnlocked,
}: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false);
  const accessToken = authStore((s) => s.accessToken);

  const certUrl = `${API_BASE}/api/certificates/${courseId}`;
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

  async function handleDownload() {
    if (!isUnlocked) return;
    setDownloading(true);
    try {
      const res = await fetch(certUrl, { credentials: 'include', headers });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${courseTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }

  async function handleView() {
    if (!isUnlocked) return;
    try {
      const res = await fetch(certUrl, { credentials: 'include', headers });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-md transition-all dark:bg-neutral-900/50 ${
        isUnlocked
          ? 'border-neutral-200 hover:shadow-lg dark:border-neutral-700'
          : 'border-neutral-200 opacity-90 grayscale dark:border-neutral-700'
      }`}
    >
      {!isUnlocked && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-neutral-900/40 dark:bg-neutral-950/50" />
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900 dark:text-white">{courseTitle}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isUnlocked
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
            }`}
          >
            {isUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>

        {isUnlocked && completedAt ? (
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            Completed {formatDate(completedAt)}
          </p>
        ) : (
          <p className="mb-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="text-lg" aria-hidden>🔒</span>
            Complete this course to unlock your certificate
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {isUnlocked ? (
            <>
              <button
                type="button"
                onClick={handleView}
                className="h-10 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-500"
              >
                View Certificate
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="h-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                className="h-10 cursor-not-allowed rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              >
                View Certificate
              </button>
              <button
                type="button"
                disabled
                className="h-10 cursor-not-allowed rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              >
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {isUnlocked && (
        <div className="absolute right-4 top-4 text-emerald-500 dark:text-emerald-400" aria-hidden>
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute right-4 top-4 text-neutral-400 dark:text-neutral-500" aria-hidden>
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
