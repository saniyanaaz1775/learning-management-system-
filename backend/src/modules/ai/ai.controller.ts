import { Request, Response } from 'express';
import { askAI } from '../../services/aiService';
import { env } from '../../config/env';

const MAX_QUESTION_LENGTH = 2000;
const MAX_CODE_LENGTH = 8000;
const MAX_COURSE_LENGTH = 200;
const MAX_LESSON_LENGTH = 300;

export async function postHelp(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as { question?: string; course?: string; lesson?: string; code?: string };
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const course = typeof body.course === 'string' ? body.course.trim().slice(0, MAX_COURSE_LENGTH) : undefined;
    const lesson = typeof body.lesson === 'string' ? body.lesson.trim().slice(0, MAX_LESSON_LENGTH) : undefined;
    const code = typeof body.code === 'string' ? body.code.trim().slice(0, MAX_CODE_LENGTH) : undefined;

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      res.status(400).json({ error: 'Question is too long' });
      return;
    }

    const apiKey = env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'AI assistant is not configured. Please try again later.',
      });
      return;
    }

    const result = await askAI({ question, course, lesson, code }, apiKey);
    res.json({ answer: result.answer });
  } catch (e) {
    console.error('[AI] postHelp error:', e);
    const fallback = 'AI assistant is temporarily unavailable. Please try again later.';
    const message = e instanceof Error ? e.message : fallback;
    res.status(503).json({
      error: message,
      answer: fallback,
    });
  }
}
