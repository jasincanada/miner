import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Slice 1 schema: users + sessions ONLY (per DEPLOY.md "Build order —
// Slice 1"). Recordings, transcripts, exclusions etc. arrive in later
// slices as their own migrations.

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  // argon2id hash (see src/auth/password.ts). Never a plaintext password.
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // SHA-256 hex of the opaque cookie token. The raw token exists only
  // in the browser cookie and in this process's memory at login time,
  // so a database leak does not leak usable sessions.
  tokenHash: text('token_hash').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
