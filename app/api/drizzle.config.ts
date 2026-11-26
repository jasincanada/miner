import { defineConfig } from 'drizzle-kit';

// Used by `drizzle-kit generate` (offline — no live DB needed) and
// `drizzle-kit check`. The one-shot migrate service runs the generated
// SQL through src/migrate.ts, never through drizzle-kit at runtime.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/callrecorder',
  },
});
