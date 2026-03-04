import { Request, Response } from 'express';
import { executeCode } from './execute.service';

const MAX_CODE_LENGTH = 100_000;
const MAX_STDIN_LENGTH = 10_000;

const ALLOWED_LANGUAGES: Record<string, string> = {
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
};

export async function runCode(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as { language?: string; code?: string; stdin?: string };
    const language = typeof body.language === 'string' ? body.language.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code : '';
    const stdin = typeof body.stdin === 'string' ? body.stdin : '';

    const normalizedLanguage = ALLOWED_LANGUAGES[language];
    if (!normalizedLanguage) {
      res.status(400).json({
        error: 'Invalid or unsupported language',
        allowed: ['python', 'c', 'cpp', 'java', 'javascript'],
      });
      return;
    }

    if (code.length > MAX_CODE_LENGTH) {
      res.status(400).json({ error: 'Code exceeds maximum length' });
      return;
    }
    if (stdin.length > MAX_STDIN_LENGTH) {
      res.status(400).json({ error: 'Input exceeds maximum length' });
      return;
    }

    const result = await executeCode({ language: normalizedLanguage, code, stdin });
    res.json(result);
  } catch (e) {
    console.error('Execute error:', e);
    const message = e instanceof Error ? e.message : 'Execution failed';
    res.status(500).json({
      error: message,
      stdout: '',
      stderr: message,
      exitCode: -1,
    });
  }
}
