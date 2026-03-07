'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Spinner } from '@/lib/common/Spinner';
import { CodeEditor } from './CodeEditor';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
] as const;

type LanguageValue = (typeof LANGUAGES)[number]['value'];

const DEFAULT_SNIPPETS: Record<LanguageValue, string> = {
  python: 'print("Hello, World!")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  javascript: 'console.log("Hello, World!");',
};

/** Detect language from code using simple heuristics. Returns null if not confident. */
function detectLanguage(code: string): LanguageValue | null {
  const t = code.trim();
  if (!t) return null;
  if (/#include\s*<\s*iostream\s*>/.test(t) || /using\s+namespace\s+std\s*;/.test(t)) return 'cpp';
  if (/#include\s*<\s*stdio\.h\s*>/.test(t) || /#include\s*<\s*stdlib\.h\s*>/.test(t) || /#include\s*<\s*string\.h\s*>/.test(t)) return 'c';
  if (/\bpublic\s+class\s+\w+/.test(t)) return 'java';
  if (/\bdef\s+\w+\s*\(/.test(t) || /^import\s+\w+/m.test(t) || /^from\s+\w+\s+import/m.test(t)) return 'python';
  if (/console\.log\s*\(/.test(t) || /\bfunction\s*\w*\s*\(/.test(t) || /=>\s*\{/.test(t) || /\b(const|let|var)\s+\w+\s*=/.test(t)) return 'javascript';
  return null;
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

interface OnlineCompilerProps {
  /** Optional: sync current code to AI helper context for better answers */
  onCodeChangeForAssistant?: (code: string) => void;
}

export function OnlineCompiler({ onCodeChangeForAssistant }: OnlineCompilerProps = {}) {
  const [code, setCode] = useState(DEFAULT_SNIPPETS.python);
  const [stdin, setStdin] = useState('');
  const [language, setLanguage] = useState<LanguageValue>('python');
  const [output, setOutput] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    const detected = detectLanguage(value);
    if (detected) setLanguage(detected);
    onCodeChangeForAssistant?.(value);
  }, [onCodeChangeForAssistant]);

  useEffect(() => {
    onCodeChangeForAssistant?.(code);
  }, [code, onCodeChangeForAssistant]);

  const handleRun = useCallback(async () => {
    setRunError(null);
    setOutput(null);
    setLoading(true);
    try {
      const result = await apiClient.post<RunResult>('/api/execute/run', {
        language,
        code,
        stdin: stdin || undefined,
      });
      setOutput(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to run code';
      setRunError(msg);
      setOutput({
        stdout: '',
        stderr: msg,
        exitCode: -1,
        error: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [language, code, stdin]);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_SNIPPETS[language]);
    setOutput(null);
    setRunError(null);
  }, [language]);

  const handleClearOutput = useCallback(() => {
    setOutput(null);
    setRunError(null);
  }, []);

  const hasError = output && (output.exitCode !== 0 || output.stderr || output.error);
  const hasSuccess = output && output.exitCode === 0 && !output.stderr && !output.error;

  return (
    <div className="space-y-5">
      {/* Toolbar: Language | Run | Reset | Clear Output — single row, wraps on small screens */}
      <div className="mb-3 flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
        {/* Language selector — same height as buttons, neutral background */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageValue)}
          className="h-9 min-w-[120px] rounded-lg border border-neutral-300 bg-neutral-50 pl-3 pr-8 text-sm font-medium text-neutral-900 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-500"
        >
          {LANGUAGES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Buttons: 36px height, 8px 14px padding, 8px radius, font-weight 500 */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleRun}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#22C55E] px-[14px] py-2 text-sm font-medium text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-neutral-900"
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4 shrink-0" />
                <span>Running…</span>
              </>
            ) : (
              <>
                <span aria-hidden className="text-xs leading-none">▶</span>
                <span>Run</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-[14px] py-2 text-sm font-medium text-white transition-colors hover:bg-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleClearOutput}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6B7280] px-[14px] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear Output</span>
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Code
        </label>
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={language}
          placeholder="Enter your code..."
          minHeight={340}
        />
      </div>

      {/* Standard input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Standard input (optional)
        </label>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Input for your program (e.g. test data)"
          rows={3}
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-mono text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          spellCheck={false}
        />
      </div>

      {/* Output console */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Output
        </label>
        <div className="min-h-[140px] rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <Spinner className="h-4 w-4 shrink-0" />
              <span>Running your code…</span>
            </div>
          ) : output ? (
            <div className="space-y-2 font-mono text-sm">
              {output.stdout && (
                <pre
                  className={`whitespace-pre-wrap break-words ${
                    hasSuccess
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre className="whitespace-pre-wrap break-words text-red-600 dark:text-red-400">
                  {output.stderr}
                </pre>
              )}
              {output.exitCode !== undefined && output.exitCode !== 0 && (
                <p className="text-red-600 dark:text-red-400">Exit code: {output.exitCode}</p>
              )}
              {!output.stdout && !output.stderr && output.error && (
                <p className="text-red-600 dark:text-red-400">{output.error}</p>
              )}
              {!output.stdout && !output.stderr && !output.error && (
                <p className="text-neutral-500 dark:text-neutral-400">(No output)</p>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              Click &quot;Run&quot; to see output here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
