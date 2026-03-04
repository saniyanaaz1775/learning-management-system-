import { Request, Response } from 'express';
import { getBotReply } from './execute.chat.service';

const MAX_QUESTION_LENGTH = 2000;
const CHAT_COOLDOWN_MS = 15_000;

const lastChatByUserId = new Map<string, number>();

export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (userId == null) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userIdStr = String(userId);
    const now = Date.now();
    const last = lastChatByUserId.get(userIdStr);
    if (last != null && now - last < CHAT_COOLDOWN_MS) {
      res.status(429).json({ error: 'Please wait before asking again.' });
      return;
    }

    const body = req.body as {
      code?: string;
      language?: string;
      errorOutput?: string;
      question?: string;
    };
    const code = typeof body.code === 'string' ? body.code : '';
    const language = typeof body.language === 'string' ? body.language.trim() : '';
    const errorOutput = typeof body.errorOutput === 'string' ? body.errorOutput : '';
    const question = typeof body.question === 'string' ? body.question.trim() : '';

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      res.status(400).json({ error: 'Question is too long' });
      return;
    }

    lastChatByUserId.set(userIdStr, now);

    const result = await getBotReply({
      code,
      language: language || 'unknown',
      errorOutput,
      question,
    });
    res.json(result);
  } catch (e) {
    console.error('CodeHelperBot error:', e);
    const message = e instanceof Error ? e.message : 'Failed to get help';
    res.status(500).json({ error: message });
  }
}
