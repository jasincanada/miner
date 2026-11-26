import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Db } from '../db/client.js';
import type { User } from '../db/schema.js';
import { getSessionUser } from './session.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

/**
 * preHandler for session-protected routes. Per DEPLOY.md the API's
 * user routes sit behind the session login; only /healthz and the
 * future /api/webhooks/* + /api/texml/* (Telnyx-signed, not
 * user-signed) are exempt — those routes simply never attach this
 * guard.
 */
export function requireAuth(db: Db) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = await getSessionUser(db, request);
    if (!user) {
      await reply.code(401).send({ error: 'unauthorized' });
      return;
    }
    request.user = user;
  };
}
