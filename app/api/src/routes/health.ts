import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { Db } from '../db/client.js';

/**
 * GET /healthz — public (no session). Used by the compose healthcheck
 * and by the auto-updater's post-update check (DEPLOY.md, Release
 * channels): 200 only when the API is up AND Postgres answers.
 */
export async function registerHealthRoutes(
  app: FastifyInstance,
  db: Db,
): Promise<void> {
  app.get('/healthz', async (_request, reply) => {
    try {
      await db.execute(sql`select 1`);
      return { status: 'ok', db: 'ok' };
    } catch {
      return reply.code(503).send({ status: 'error', db: 'down' });
    }
  });
}
