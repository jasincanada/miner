import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadConfig } from './config.js';
import { createDb } from './db/client.js';

// Entrypoint of the one-shot `migrate` compose service (DEPLOY.md,
// Architecture): the api service starts only after db is healthy AND
// this process has completed successfully. Never initdb scripts.
const config = loadConfig();
const { db, pool } = createDb(config.DATABASE_URL);

// dist/migrate.js -> ../drizzle (the folder drizzle-kit generated into
// the image at build time; in dev, src/migrate.ts -> ../drizzle too).
const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '..', 'drizzle');

try {
  await migrate(db, { migrationsFolder });
  console.log('migrations applied');
} catch (err) {
  console.error('migration failed', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
