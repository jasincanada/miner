# Deploy: Call Recorder site on the EPYC

## Goal

Serve the Call Recorder dashboard at **https://callrecorder.cryptocomputer.ca**
from the EPYC, behind a login. The page contains operational details about
Jas's call-recording system, so it must NOT be reachable without
authentication.

## Stack (Jas's standing rules — do not substitute)

- **Front-end: Vue 3 + TypeScript, built with Vite.** State-of-the-art
  modern component design — this is a real app, not a plain HTML file.
- **Database: none needed for this dashboard.** If any persistence is
  ever added, it is **Postgres only** (his standing rule).
- The language is JavaScript/TypeScript running on **Node.js** (his
  call, Nov 25). No separate Java service — nothing here needs one.

## Content reference

`site/call-recorder.html` (in this folder) is the finished static version
of the page. Use it as the exact reference for the app's content, wording,
and design: same information, same sections, rebuilt as Vue components.

## Design requirements (Jas's words, Nov 25)

- **Responsive, one design that reshapes itself**: equally good on
  phone, tablet, and desktop. Very well designed, modern, state of
  the art.
- **Screen-space efficient**: the main elements own the screen. Nothing
  secondary may squat on space the main content needs.
- **Pop-in / pop-out elements**: every element that is not a main
  element lives in a collapsible panel, drawer, or expandable card —
  tucked away by default, popping in when summoned and out when
  dismissed. Settings, details, help text, and status extras are
  pop-in/pop-out, never permanent furniture.
- Large, readable type throughout (Jas reads best at large sizes).
- **The background is motion** (his words, Nov 25): the page background
  is a living motion layer — the waveform field flowing gently behind
  the content — never a flat static backdrop. Keep it slow, subtle,
  and low-contrast so text stays perfectly readable on top of it, and
  respect reduced-motion settings with a calm still mode. During a
  call or playback this same background goes live with his voice
  (see Roadmap item 5).
- **The scene (agreed Nov 25)**: the motion background is a cozy
  Christmas living room. Cosmo the tabby — in his Christmas outfit,
  the snug Santa hat and Christmas collar, the way Jas sees him on
  screen — and his kitten brothers play with their toys on the rug;
  at times Cosmo snuggles up to his Christmas plaid catnip kick toy,
  bunny-kicking it and rubbing his head against it, purring. A
  Christmas tree glows; gingerbread
  cookies and a glass of milk sit nearby; a coffee table holds a
  Bible; Jas rests on the couch under a big blanket with his favorite
  woman beside him, watching Christmas shows. Gifts are tucked
  under the tree, and a fireplace crackles, casting a warm flicker
  across the room. Through the windows,
  sliding doors, and balcony: snowy evergreens (pines and firs) and
  children tobogganing down a hill. The feeling to hit: warm
  colours, a nostalgic feeling — warm, happy, family — Christmas
  magic. The scene stays ambient and behind the
  content; the dashboard remains the main element.

## Why this exists (his words, Nov 25, 2026)

The recorder exists so Jas can: (1) hold people accountable for how
they treat him on calls — an accurate record that can be proven,
including for legal needs (the Fraser Health calls of Nov 24 are his
example); (2) coordinate exactly with his AI — calls become
transcripts the AI can work from, so his days run correctly;
(3) remember — he is forgetful, and transcripts feed his briefings
so life runs on what actually happened, not on memory; (4) state
accurately what happened on a call. Every feature in the roadmap
serves one of those four purposes.

## Roadmap — capabilities Jas approved (Nov 25, 2026)

Build the dashboard first; these bolt on in this order. All were
pitched to Jas and approved by him ("All of those things get me
excited").

1. **Live status tiles** — recorder health, last recording, Telnyx
   balance, transcriber status, updating live instead of frozen text.
2. **Recordings library** — every recording appears as it lands:
   in-browser playback, the transcript beside it, and full-text
   search across every transcript. Needs a small back-end service;
   if the library is stored, it is stored in **Postgres** (his rule).
3. **A phone inside the page** — a WebRTC dialer (Telnyx WebRTC) in
   the site itself, so recorded calls happen in the browser with no
   separate softphone app or SIP password to manage.
4. **One-tap call actions** — buttons (e.g. "Call Fo") that place a
   call through the proven Telnyx outbound route, with the transcript
   delivered automatically afterward.
5. **Voice-live motion** — motion is part of the design, and it is
   LIVE WITH THE SOUND OF HIS VOICE (his words, Nov 25): during a
   call or playback, the waveform animates in real time with the
   actual audio. Panels slide in and out like drawers. Motion stays
   gentle and calm — alive, never busy or distracting.

## What to do

1. Pull this branch (`telnyx-recorder` of `jasincanada/miner`).
2. Scaffold the Vue 3 + TypeScript project at `site/app/` (e.g.
   `npm create vue@latest` with TypeScript on) and build the dashboard
   into it from the reference file.
3. Containerize it with a multi-stage Dockerfile: a **Node.js** build
   stage (current LTS, e.g. `node:22-alpine`; `npm ci && npm run build`)
   and a small serve stage (nginx:alpine serving the built files). Add
   the compose entry alongside the existing stacks on the EPYC,
   following the house pattern. Bind to a localhost/internal port
   only; nginx in front is the public face.
4. In Nginx UI, create the site `callrecorder.cryptocomputer.ca`
   proxying to that container, with authentication in front of it
   (basic auth is acceptable; if the box already has an auth setup,
   use that). Jas sets/chooses the password — ask him; do not leave a
   password you invented in a place he cannot find. HTTPS the way the
   other sites on this box are done (they sit behind Cloudflare).
5. Constraints:
   - Use system-vg paths only. The data NVMe (data-vg, /srv/data) is
     dead and offline by design; do not try to use it.
   - /var/log was at about 81% (35 GB free) on Nov 25 — keep this
     container's logging small.
   - Do not disturb any existing containers or services.
   - Do not touch Nextcloud (that lives on the 5900X, and someone else
     is working on it).
6. Verify before reporting done: from a browser, the address loads,
   access is blocked without the login, and the app renders after
   login.

## Report back to Jas

- The final URL.
- The container name and the port it listens on.
- Where the app source, the built files, and the compose entry live
  on the EPYC.
- How to update the site later (expected: edit the Vue source,
  rebuild, restart the one container).

## Engineering (researched Nov 25, 2026 — build it this way)

- **Hybrid, not one library.** Static layered SVG/PNG for the room,
  the tree, and the window view (the outside scene clipped to the
  window panes — that clip is the parallax hinge). ONE dynamic canvas
  for snow, glow, and the tobogganing silhouettes: **PixiJS v8**
  preferred for headroom; hand-rolled Canvas 2D is an acceptable
  simpler v1. **Rive for the kittens**: a state machine (idle / bat /
  pounce / sleep) with inputs `energy` (number), `isSleeping`
  (boolean), `pounce` (trigger), fed by the audio level. Lottie is
  the worst fit here (linear timelines, no state machine) — do not
  use it for the kittens.
- **Audio**: Web Audio `AnalyserNode` (fftSize 512–1024, smoothing
  0.8) → a smoothed level value in a plain mutable object (never
  per-frame reactive state) drives glow and motion. Create/resume
  the AudioContext inside a user gesture. The scene must be complete
  and beautiful WITHOUT audio — audio only wakes it up.
- **Performance**: one requestAnimationFrame loop, transform/opacity
  only, devicePixelRatio capped (2 desktop / 1.5 mobile), pause when
  the tab is hidden or the scene is off-screen, pre-rendered sprites
  (no live blur/filters), background JS budget ~4 ms/frame (a 30 fps
  background tick is acceptable).
- **Comfort**: honour `prefers-reduced-motion` in CSS *and* JS;
  in-app Living / Calm / Still toggle, persisted; brightness flashes
  no more than 3 per second; scene is aria-hidden and
  pointer-events: none, with a scrim behind the dashboard so text
  contrast never suffers.
- **Assets**: scene assets live in `public/scene/` in git, with their
  sources. Verify `.riv` / `.wasm` MIME types and CSP in the
  production container image, not just in vite dev. HTTPS is
  required (microphone / WebRTC).
- **The honest risk**: the kitten artwork and rigging are the
  critical path — the code is the easy part. If a quality Rive rig
  cannot be produced, simplify the art style rather than shipping
  janky animation.

### Second-opinion review (DeepSeek-R1 via DeepInfra, Nov 25)

Adopted from the review:
- **Cleanup is a requirement**: on unmount / tab-hide, release the
  Web Audio nodes, PixiJS textures, and Rive instances — leaks are
  the top production failure mode for this stack.
- **Serving checks for `.riv` / `.wasm` in the nginx container**:
  MIME types (`application/wasm` for .wasm, `application/octet-stream`
  for .riv), long immutable cache headers on versioned assets,
  gzip/brotli enabled for them, CSP that permits WASM execution,
  and a curl check (`200` + correct Content-Type) as part of deploy
  verification. Ad-blockers and CORS can also break these assets —
  test in a real browser, not only vite dev.
- **Kitten Plan B**: if the Rive rig is not ready, ship PixiJS sprite
  clips (sleep / bat / pounce loops) switched by energy thresholds
  in the same canvas, and upgrade to Rive later. Rive remains the
  target — sprites are the fallback, not the destination.

Considered and NOT adopted (Cosmo's call, Nov 25):
- Simulating the "energy" with sine-wave math instead of the real
  AnalyserNode. Rejected: the scene responding to Jas's actual voice
  is the point of the feature. Audio must degrade gracefully when
  unavailable, but it is never faked.
- Hardcoding devicePixelRatio = 1. Rejected in favour of the caps
  above plus an FPS-probe auto quality tier.
- Dropping the in-app Living / Calm / Still toggle. Kept: the toggle
  is Jas's own control, separate from the OS reduced-motion setting.

## Feature set — ACR-shaped (his direction, Nov 25, 2026)

Jas uses **ACR call recorder on Android** and likes it. This app is
a **fully featured call recorder in ACR's shape**, not a bare list
of files:

- **Auto-record**: everything records by default. No per-call
  action, no remembering to press anything.
- **Excluded callers**: a per-number exclusion list — calls from
  those numbers are never recorded.
- **Exclude unknown numbers**: a separate checkbox, exactly as in
  ACR — when it is on, calls from unknown numbers (no caller ID /
  not a known contact) are not recorded.
- Enforcement point: the recorder's TeXML is served **dynamically
  by our own back end** (the TeXML app's URL points at our API), so
  the exclusion list and the unknown-number rule are checked per
  call, before recording starts — an excluded call is bridged
  without the `<Record>` verb, never recorded-then-deleted.
- **Library** (roadmap item 2, in ACR's shape): star / mark
  important, a note on each recording, full-text transcript search,
  export or share the recording file (this is the accountability
  and legal use), rename, delete.

## Architecture (researched Nov 25, 2026 — build it this way)

- **Back end**: Fastify 5 with the Zod type-provider. **Drizzle**
  ORM/Kit over `pg`. **Postgres, major version pinned** (never
  tag-bump: Postgres 18 changed the volume path). Front end:
  create-vue scaffold (Vue 3 `<script setup>`, Pinia, Vue Router,
  Vitest).
- **Login**: app-native session login — argon2id password hash,
  opaque session row in Postgres, HttpOnly + Secure +
  SameSite=Lax cookie, session rotated at login, login rate
  limited. (nginx basic auth rejected: worst phone UX. Authelia is
  the later add-on if passkey/MFA is ever wanted.) Only the web
  (nginx) service is published; api and db live on the internal
  Docker network only. `/api/webhooks/*` and `/api/texml/*` are
  exempt from user auth — the Telnyx signature is their auth.
- **Recordings — mirror immediately**: Telnyx recording download
  URLs live only **~10 minutes** (Telnyx retains recordings 1
  year). On the recording webhook: verify the Ed25519 signature
  (headers `telnyx-signature-ed25519` + `telnyx-timestamp`, raw
  body, ±300 s tolerance; test the Node SDK's `unwrap()` against a
  captured real payload — a manual Ed25519 check over
  `${timestamp}|${rawBody}` is the fallback), insert idempotently
  (unique `telnyx_recording_id`), then a background job downloads
  the mp3 to a local volume, stores sha256 + size in Postgres,
  fetches the transcript, and fires an SSE event. A nightly
  `GET /v2/recordings` reconciliation catches anything missed.
- **Playback**: stream the mirrored local file through the
  session-checked API with full HTTP Range support (206 +
  Content-Range; Safari probes `bytes=0-1` and refuses without
  206). Never redirect the browser to Telnyx presigned URLs.
- **Live updates**: Server-Sent Events (nginx location with
  `proxy_buffering off`, keepalive comments every 15–25 s), 30 s
  polling as fallback. Keep the SSE location separate from any
  WebSocket location (different `Connection` handling).
- **In-page phone (WebRTC)**: JWT auth — a per-user Telephony
  Credential on the SIP Credential Connection, token from
  `POST /v2/telephony_credentials/{id}/token` (24 h, handle
  TOKEN_EXPIRING_SOON). HTTPS is mandatory; media flows
  browser↔Telnyx directly, never through our proxy.
- **⚠️ SPIKE BEFORE BUILDING THE DIALER**: recording a WebRTC /
  credential-connection call server-side is **not automatic** and
  was **not verified end-to-end** by the research. First spike:
  prove `record_start` via Call Control (or the TeXML `<Record>`
  route) on a real browser call against Jas's actual account.
  Only then build dialer UI.
- **Outbound one-tap calls**: `POST /v2/texml/Accounts/{account_sid}/Calls`
  (To / From in E.164 / ApplicationSid) — already proven live on
  this account on Nov 25 (the Fo test call).
- **Docker**: compose services — web (nginx serving the built SPA
  + proxying), api, a one-shot migrate service (Drizzle migrations;
  api starts only after db is healthy AND migrate completed —
  never initdb scripts), db (healthcheck, **no published port**).
  Backups: nightly `pg_dump -Fc` + a copy of the recordings
  volume, stored off-box, with a tested restore; `.env` backed up
  separately. SPA `try_files` must never swallow `/api/*`.
  Cloudflare TLS mode: Full (Strict).

### Second-opinion review — platform (DeepSeek-R1 via DeepInfra, Nov 25)

Adopted:
- **The spike checklist** (for the WebRTC recording spike above):
  prove (1) `record_start` via Call Control fires reliably during
  an active WebRTC call; (2) BOTH audio streams are captured with
  usable quality; (3) start/stop timing does not truncate the call;
  (4) API errors (e.g. 429) are handled without breaking the call.
- **Mirror hardening**: the download job retries with backoff
  inside the 10-minute URL window and alerts on failure; the
  nightly reconciliation stays from v1 (it is the safety net, not
  an optional extra).
- **WebRTC exclusion gap (a real catch)**: exclusion rules are
  enforced in TeXML only for PSTN calls. Browser (WebRTC) calls
  must check the same rules in the dialer path, before
  `record_start` — one rule set, enforced in both paths.
- **"Unknown number" defined**: caller ID withheld/absent, OR the
  number is not in Jas's contacts/known numbers. The checkbox
  covers both.
- **Exclusion housekeeping**: adding a number to the exclusion list
  offers, in the same step, to delete that number's existing
  recordings. Exclusions are a convenience based on caller ID
  (which can be spoofed) — never treat them as a security boundary.
- **Retention**: a retention setting exists, default **keep
  forever** — the record is the purpose of this app. Nothing is
  ever auto-deleted silently.

Considered and NOT adopted (Cosmo's call, Nov 25):
- Replacing SSE with polling as the primary live-update path
  (polling stays as the fallback; SSE's auto-reconnect with
  Last-Event-ID covers restarts).
- Deferring the nightly reconciliation (see mirror hardening).
- Precomputing TeXML rules on a cron instead of serving them
  dynamically per call — an exclusion made a minute ago must apply
  to the very next call.
- Skipping HTTP Range support in v1 — browsers (Safari especially)
  refuse or cripple playback without it.
