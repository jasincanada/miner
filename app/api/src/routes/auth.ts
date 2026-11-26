import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import type { Db } from '../db/client.js';
import { users } from '../db/schema.js';
import { requireAuth } from '../auth/guard.js';
import { verifyPassword } from '../auth/password.js';
import { createSession, destroySession } from '../auth/session.js';

const loginBody = z.object({
  username: z.string().min(1).max(128),
  password: z.string().min(1).max(1024),
});

const errorResponse = z.object({ error: z.string() });
const meResponse = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

export async function registerAuthRoutes(
  app: FastifyInstance,
  db: Db,
  config: AppConfig,
): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  // Login is rate limited per-route (5 attempts / minute / IP) on top
  // of the global limit registered in app.ts — see DEPLOY.md,
  // Architecture: "login rate limited".
  typed.route({
    method: 'POST',
    url: '/api/auth/login',
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' },
    },
    schema: {
      body: loginBody,
      response: {
        200: meResponse,
        401: errorResponse,
      },
    },
    handler: async (request, reply) => {
      const { username, password } = request.body;

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      const user = rows[0];

      // Same answer for "no such user" and "wrong password" — never
      // reveal which half failed.
      if (!user || !(await verifyPassword(user.passwordHash, password))) {
        return reply.code(401).send({ error: 'invalid credentials' });
      }

      await createSession(db, config, reply, user.id);
      return { id: user.id, username: user.username };
    },
  });

  typed.route({
    method: 'POST',
    url: '/api/auth/logout',
    schema: { response: { 200: z.object({ ok: z.literal(true) }) } },
    handler: async (request, reply) => {
      await destroySession(db, config, request, reply);
      return { ok: true as const };
    },
  });

  typed.route({
    method: 'GET',
    url: '/api/auth/me',
    preHandler: requireAuth(db),
    schema: {
      response: { 200: meResponse, 401: errorResponse },
    },
    handler: async (request) => {
      const user = request.user!;
      return { id: user.id, username: user.username };
    },
  });
}
