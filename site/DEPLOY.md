# Deploy: Call Recorder page on the EPYC

## Goal

Serve `call-recorder.html` (in this same `site/` folder) at
**https://callrecorder.cryptocomputer.ca** from the EPYC, behind a login.
The page contains operational details about Jas's call-recording system,
so it must NOT be reachable without authentication.

## What to do

1. Pull this branch (`telnyx-recorder` of `jasincanada/miner`) and take
   `site/call-recorder.html` as the page file. It is one self-contained
   HTML file; it needs no build step and no other assets.
2. On the EPYC, stand up a small static container for it, following the
   house pattern used for the other stacks (e.g. `nginx:alpine` serving
   the single file, with a docker-compose entry alongside the existing
   stacks). Bind it to a localhost/internal port only; nginx in front
   is the public face.
3. In Nginx UI, create the site `callrecorder.cryptocomputer.ca`
   proxying to that container, with authentication in front of it
   (basic auth is acceptable; if the box already has an auth setup,
   use that). Jas sets/chooses the password — ask him; do not leave a
   password you invented in a place he cannot find. HTTPS the way the
   other sites on this box are done (they sit behind Cloudflare).
4. Constraints:
   - Use system-vg paths only. The data NVMe (data-vg, /srv/data) is
     dead and offline by design; do not try to use it.
   - /var/log was at about 81% (35 GB free) on Nov 25 — keep this
     container's logging small.
   - Do not disturb any existing containers or services.
   - Do not touch Nextcloud (that lives on the 5900X, and someone else
     is working on it).
5. Verify before reporting done: from a browser, the address loads,
   access is blocked without the login, and the page renders after
   login.

## Report back to Jas

- The final URL.
- The container name and the port it listens on.
- Where the page file and the compose entry live on the EPYC.
- How to update the page later (expected: replace the one HTML file
  from this repo path and restart the one container).
