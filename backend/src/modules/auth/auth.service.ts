import crypto from 'crypto';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { cookieOptions } from '../../config/security';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

const COOKIE_NAME = env.COOKIE_NAME;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

export const authService = {
  async register(body: { email: string; password: string; name: string }) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
      },
    });
    const accessToken = signAccessToken({ userId: Number(user.id), email: user.email });
    const refreshToken = signRefreshToken({ userId: Number(user.id) });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = refreshExpiresAt();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
    const isAdmin = !!env.ADMIN_EMAIL && user.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    return {
      json: {
        user: { id: Number(user.id), email: user.email, name: user.name },
        accessToken,
        expiresIn: 900,
        isAdmin,
      },
      cookie: {
        name: COOKIE_NAME,
        value: refreshToken,
        options: cookieOptions,
      },
    };
  },

  async login(body: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await comparePassword(body.password, user.passwordHash)))
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    const accessToken = signAccessToken({ userId: Number(user.id), email: user.email });
    const refreshToken = signRefreshToken({ userId: Number(user.id) });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = refreshExpiresAt();
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    const isAdmin = !!env.ADMIN_EMAIL && user.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    return {
      json: {
        user: { id: Number(user.id), email: user.email, name: user.name },
        accessToken,
        expiresIn: 900,
        isAdmin,
      },
      cookie: {
        name: COOKIE_NAME,
        value: refreshToken,
        options: cookieOptions,
      },
    };
  },

  async refresh(cookieToken: string | undefined) {
    if (!cookieToken) throw Object.assign(new Error('No refresh token'), { statusCode: 401 });
    let payload;
    try {
      payload = verifyRefreshToken(cookieToken);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }
    const tokenHash = hashToken(cookieToken);
    const row = await prisma.refreshToken.findFirst({
      where: { userId: BigInt(payload.userId), tokenHash },
      include: { user: true },
    });
    if (!row || row.revokedAt || new Date() > row.expiresAt)
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: row.user.email,
    });
    return {
      json: { accessToken, expiresIn: 900 },
    };
  },

  async logout(cookieToken: string | undefined) {
    if (!cookieToken) return;
    const tokenHash = hashToken(cookieToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  },

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true, email: true, name: true },
    });
    if (!user) return null;
    const isAdmin = !!env.ADMIN_EMAIL && user.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    return {
      id: Number(user.id),
      email: user.email,
      name: user.name,
      isAdmin,
    };
  },
};
