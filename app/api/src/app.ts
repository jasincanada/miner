import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import type { AppConfig } from './config.js';
import { createDb } from './db/client.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerHealthRoutes } from './routes/health.js';

export interface BuiltApp {
  app: FastifyInstance;
  close: () => Promise<void>;
}

export async function buildApp(config: AppConfig): Promise<BuiltApp> {
  const { db, pool } = createDb(config.DATABASE_URL);

  const app = Fastify({
    logger: { level: config.LOG_LEVEL },
    // The API only ever sits behind the web (nginx) container on the
    // internal Docker network; proxy headers are trusted from there.
    trustProxy: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cookie);
  // Global safety net; /api/auth/login carries a stricter per-route
  // limit (see routes/auth.ts).
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  await registerHealthRoutes(app, db);
  await registerAuthRoutes(app, db, config);

  // Future routes (later slices, per DEPLOY.md Architecture):
  //   /api/webhooks/* and /api/texml/* — exempt from session auth;
  //   the Telnyx Ed25519 signature is their auth. They are simply
  //   registered without the requireAuth guard.

  return {
    app,
    close: async () => {
      await app.close();
      await pool.end();
    },
  };
}
