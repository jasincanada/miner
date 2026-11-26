import { eq } from 'drizzle-orm';
import { loadConfig } from '../config.js';
import { createDb } from '../db/client.js';
import { users } from '../db/schema.js';
import { hashPassword } from '../auth/password.js';

// One-time account setup, run on the EPYC against the api image:
//   SEED_USERNAME=jas SEED_PASSWORD='…' \
//     docker compose run --rm api npm run create-user
// Jas chooses the password himself (DEPLOY.md); it is passed through
// the environment for this single run and never written to any file
// in this repo. Re-running with an existing username resets that
// user's password and destroys their sessions on next login
// (rotation at login does the rest).
const username = process.env.SEED_USERNAME;
const password = process.env.SEED_PASSWORD;

if (!username || !password) {
  console.error('SEED_USERNAME and SEED_PASSWORD must both be set');
  process.exit(1);
}
if (password.length < 10) {
  console.error('password must be at least 10 characters');
  process.exit(1);
}

const config = loadConfig();
const { db, pool } = createDb(config.DATABASE_URL);

try {
  const passwordHash = await hashPassword(password);
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, existing[0].id));
    console.log(`password updated for user "${username}"`);
  } else {
    await db.insert(users).values({ username, passwordHash });
    console.log(`user "${username}" created`);
  }
} finally {
  await pool.end();
}
