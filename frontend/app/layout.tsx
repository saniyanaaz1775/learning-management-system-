import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/Layout/AppShell';
import { ToastContainer } from '@/components/Toast/ToastContainer';

export const metadata: Metadata = {
  title: 'SkillSphere – Your Universe of Learning',
  description:
    'SkillSphere is a modern learning platform where students can watch courses, practice coding, track progress, and improve their skills.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lms_theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.remove('dark');else if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
        <AppShell>{children}</AppShell>
        <ToastContainer />
      </body>
    </html>
  );
}
