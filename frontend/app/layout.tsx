import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/Layout/AppShell';
import { ToastContainer } from '@/components/Toast/ToastContainer';

export const metadata: Metadata = {
  title: 'LMS',
  description: 'Learning Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AppShell>{children}</AppShell>
        <ToastContainer />
      </body>
    </html>
  );
}
