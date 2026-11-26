import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppConfig } from '../config.js';
import type { Db } from '../db/client.js';
import { sessions, users, type User } from '../db/schema.js';

export const SESSION_COOKIE = 'cr_session';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function sessionCookieOptions(config: AppConfig, maxAgeSeconds: number) {
  return {
    path: '/',
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
  };
}

/**
 * Issue a fresh session for a user. Rotation at login (DEPLOY.md,
 * Architecture): every previous session for this user is destroyed
 * first, so a new sign-in invalidates any older cookie anywhere.
 */
export async function createSession(
  db: Db,
  config: AppConfig,
  reply: FastifyReply,
  userId: string,
): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));

  const token = randomBytes(32).toString('base64url');
  const ttlMs = config.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  reply.setCookie(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(config, Math.floor(ttlMs / 1000)),
  );
}

/** Resolve the session cookie to a user, or null. Expired rows are reaped lazily. */
export async function getSessionUser(
  db: Db,
  request: FastifyRequest,
): Promise<User | null> {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;

  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, row.session.id));
    return null;
  }

  await db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, row.session.id));

  return row.user;
}

export async function destroySession(
  db: Db,
  config: AppConfig,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[SESSION_COOKIE];
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  reply.clearCookie(SESSION_COOKIE, sessionCookieOptions(config, 0));
}
