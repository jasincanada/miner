# Call Recorder — Slice 1 (walking skeleton)

The smallest real build that proves the whole machine end to end:
the dashboard as a proper app, behind a real login, delivered by the
build-ahead → release → pull pipeline. Spec of record:
`../spec-work/site/DEPLOY.md` (Stack, Architecture, Delivery model,
Release channels, "Build order — Slice 1").

Later slices plug into this skeleton — recordings library, in-page
phone, AI layer, flagging, Nextcloud save, the living Christmas
scene. None of them are in Slice 1.

## Layout

```
app/
  web/                  Vue 3 + TypeScript (Vite) front end
    src/components/     Dashboard sections as components; the static
                        reference page's sections and wording, rebuilt
    src/components/ChristmasScene.vue
                        PLACEHOLDER — static CSS treatment only. The
                        living scene (Rive kittens + canvas snow,
                        voice-live) is a later slice; see DEPLOY.md
    src/views/          DashboardView (behind login), LoginView
    src/stores/auth.ts  Pinia mirror of the session state
    src/router/         Route guard: no session → /login
    nginx.conf          Serves the SPA, proxies /api → api service
    Dockerfile          node:22-alpine build → nginx:alpine serve
  api/                  Fastify 5 + TypeScript back end
    src/routes/health.ts  GET /healthz (public; checks Postgres)
    src/routes/auth.ts    POST /api/auth/login (rate-limited),
                          POST /api/auth/logout, GET /api/auth/me
    src/auth/             argon2id hashing; opaque session tokens
                          (SHA-256 of the token is what's stored);
                          rotation at login; session guard
    src/db/schema.ts      Drizzle schema — users + sessions ONLY
    src/migrate.ts        Entrypoint of the one-shot migrate service
    src/scripts/create-user.ts  One-time account creation
    drizzle/              Generated migrations, committed
    Dockerfile            One image: server / migrate / create-user
  docker-compose.yml    web + api + migrate (one-shot) + db + updater
  .env.example          Every variable the stack needs (no secrets)
  .github/workflows/release.yml   Channel builds → GHCR
```

## How a release flows

1. Code is written here, ahead of time — nothing is built on the
   EPYC (DEPLOY.md, Delivery model).
2. GitHub Actions builds the web and api images and pushes them to
   GHCR with channel tags:
   - merges to `develop` → `alpha`
   - tag `v1.2.0-beta.1` → `beta` + `1.2.0-beta.1`
   - tag `v1.2.0` → `main` + `1.2.0`
   Promotion moves the same digest up the channels; it never
   rebuilds. (The workflow must sit at the repository root's
   `.github/workflows` — see the note at the top of release.yml.)
3. On the EPYC, Grokbot's reduced job: fetch `docker-compose.yml`
   and `.env.example`, create `.env` **on the machine** (secrets are
   generated and stored there only), then:
   `docker compose pull && docker compose up -d`
4. Create the login account once:
   `SEED_USERNAME=… SEED_PASSWORD=… docker compose run --rm api npm run create-user`
   (Jas chooses the password himself — DEPLOY.md.)
5. The EPYC's front nginx (Nginx UI) proxies
   `callrecorder.cryptocomputer.ca` to `127.0.0.1:${WEB_PORT}`
   (default 8080). HTTPS is terminated there, the way the other
   sites on the box are done (Cloudflare, TLS Full (Strict)).

**Done means** (spec): Jas opens the address, is stopped by the
login, signs in, and sees the dashboard — and one dummy
main-channel update delivers itself and passes its health check.

## Auto-update (main channel)

The `updater` service is Watchtower in `--label-enable` mode: it
can only touch containers carrying
`com.centurylinklabs.watchtower.enable=true` — in this stack, `web`
and `api` only. Postgres is never auto-updated; the migrate service
never auto-runs.

Guardrails from the spec that this covers: app-only scope, pinned
database, pull-only delivery. Guardrails **not yet closed** (honest
gap, flagged for a later slice): Watchtower restarts on a new image
but does not itself record a last-known-good digest, health-check
the login page, roll back on failure, or report to Jas's inbox; and
an auto-updated api image whose release carries new migrations
still needs the migrate service re-run
(`docker compose up -d migrate` or a full `docker compose pull && up -d`)
before the api restarts clean against the new schema. A small
updater wrapper script is the planned fix.

If the GHCR packages are private, run `docker login ghcr.io` on the
EPYC once and uncomment the config mount on the updater service so
it can pull too.

## Local development

```sh
# API (needs a Postgres it can reach):
cd api && npm install
DATABASE_URL=postgres://… COOKIE_SECURE=false npm run dev

# Web (proxies /api to localhost:3000):
cd web && npm install && npm run dev

# Checks:
cd api && npm run typecheck && npm run build
cd web && npm run typecheck && npm test && npm run build
npx drizzle-kit generate   # after any schema change (in api/)
```

## Notes & decisions made in this slice

- **Postgres pinned at major 17** (`postgres:17-alpine`): the spec
  pins the major version and warns PG18 changed the volume path.
- **argon2 via `@node-rs/argon2`**: prebuilt musl binaries, so the
  alpine production image needs no compiler toolchain.
- **Session tokens are opaque and hashed at rest** (SHA-256); the
  cookie is HttpOnly + Secure + SameSite=Lax, rotated at login,
  30-day TTL (`SESSION_TTL_DAYS`).
- **Design standard**: main content (hero, pipeline, proof, routes)
  owns the screen; secondary content — sign-in details, status list,
  step-by-step instructions — lives in collapsible pop-in/pop-out
  panels and expanders, tucked away by default.
- **`/api/webhooks/*` and `/api/texml/*`** are reserved for later
  slices; they will be registered without the session guard (the
  Telnyx signature is their auth), per the spec.
