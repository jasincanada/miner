import { z } from 'zod';

const boolFromEnv = z
  .string()
  .transform((v) => v.toLowerCase() === 'true')
  .pipe(z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.string().default('production'),
  LOG_LEVEL: z.string().default('info'),
  // Cookies carry the Secure flag in production (HTTPS via the EPYC
  // nginx / Cloudflare). Set COOKIE_SECURE=false only for local
  // plain-HTTP development.
  COOKIE_SECURE: boolFromEnv.default('true'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    // Fail fast and loud: a misconfigured API must never start half-alive.
    console.error('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}
