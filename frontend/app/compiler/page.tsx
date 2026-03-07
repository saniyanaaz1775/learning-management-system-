'use client';

import { useEffect } from 'react';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { OnlineCompiler } from '@/components/Compiler/OnlineCompiler';
import { aiHelperStore } from '@/store/aiHelperStore';

export default function CompilerPage() {
  useEffect(() => {
    aiHelperStore.getState().setCourse(null);
    aiHelperStore.getState().setLesson(null);
    aiHelperStore.getState().setCode(null);
    return () => {
      aiHelperStore.getState().setCode(null);
    };
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Online Code Compiler
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Write and run code in Python, C, C++, Java, or JavaScript. Use the optional input box for stdin.
          </p>
        </header>
        <section className="min-w-0">
          <OnlineCompiler
            onCodeChangeForAssistant={(code) => aiHelperStore.getState().setCode(code)}
          />
        </section>
      </div>
    </AuthGuard>
  );
}
