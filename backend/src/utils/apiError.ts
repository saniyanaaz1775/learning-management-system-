/**
 * Map thrown errors to safe API response (statusCode + message).
 * Hides Prisma/DB connection details from clients.
 */
const DB_CONNECTION_MESSAGE =
  'Service temporarily unavailable. Please try again later.';

export function toApiError(e: unknown): { statusCode: number; message: string } {
  const err = e && typeof e === 'object' ? e as {
    message?: string;
    statusCode?: number;
    code?: string;
    meta?: { target?: string[] };
  } : {};
  const statusCode = err.statusCode ?? 500;
  const rawMessage = (err.message && String(err.message)) || 'Internal server error';

  if (statusCode >= 400 && statusCode < 500) {
    return { statusCode, message: rawMessage };
  }

  if (
    err.code === 'P1001' ||
    rawMessage.includes("Can't reach database server") ||
    rawMessage.includes('Connection refused') ||
    rawMessage.includes('ETIMEDOUT') ||
    rawMessage.includes('ENOTFOUND')
  ) {
    console.error('Database connection error:', rawMessage);
    return { statusCode: 503, message: DB_CONNECTION_MESSAGE };
  }

  if (err.code === 'P1011' || rawMessage.includes('TLS') || rawMessage.includes('certificate')) {
    console.error('Database TLS error:', rawMessage);
    return { statusCode: 503, message: DB_CONNECTION_MESSAGE };
  }

  if (err.code === 'P2002') {
    const target = err.meta?.target as string[] | undefined;
    const field = target?.[0] ?? 'field';
    const msg = field === 'email' ? 'Email already registered.' : `A record with this ${field} already exists.`;
    return { statusCode: 400, message: msg };
  }

  if (err.code === 'P2003') {
    return { statusCode: 400, message: 'Invalid reference.' };
  }

  console.error('Server error:', rawMessage);
  return {
    statusCode,
    message: statusCode === 500 ? 'An unexpected error occurred.' : rawMessage,
  };
}
