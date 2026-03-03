'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { SubjectSidebar } from '@/components/Sidebar/SubjectSidebar';
import { apiClient } from '@/lib/apiClient';
import { sidebarStore, type SubjectTree } from '@/store/sidebarStore';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';
import { Button } from '@/lib/common/Button';

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const subjectId = String(params.subjectId);
  const tree = sidebarStore((s) => s.tree);
  const loading = sidebarStore((s) => s.loading);
  const error = sidebarStore((s) => s.error);
  const notEnrolled = sidebarStore((s) => s.notEnrolled);
  const setTree = sidebarStore((s) => s.setTree);
  const setLoading = sidebarStore((s) => s.setLoading);
  const setError = sidebarStore((s) => s.setError);
  const setNotEnrolled = sidebarStore((s) => s.setNotEnrolled);
  const clear = sidebarStore((s) => s.clear);
  const [enrolling, setEnrolling] = useState(false);

  function fetchTree() {
    if (!subjectId) return;
    setLoading(true);
    setError(null);
    setNotEnrolled(false);
    apiClient
      .get(`/api/subjects/${subjectId}/tree`)
      .then((data: unknown) => setTree(data as SubjectTree))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load';
        if (msg.includes('Enroll')) setNotEnrolled(true);
        else setError(msg);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTree();
    return () => clear();
  }, [subjectId]);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      await apiClient.post(`/api/subjects/${subjectId}/enroll`);
      fetchTree();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enroll failed');
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="flex shrink-0 w-64">
          {loading && !tree && !notEnrolled && (
            <div className="p-4 flex items-center gap-2">
              <Spinner />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          {notEnrolled && !tree && (
            <div className="p-4 space-y-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Enroll in this course to view content.</p>
              <Button onClick={handleEnroll} loading={enrolling}>Enroll in course</Button>
            </div>
          )}
          {error && !tree && !notEnrolled && (
            <div className="p-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          {tree && <SubjectSidebar tree={tree} subjectId={subjectId} />}
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AuthGuard>
  );
}
