# Pearl miner — desktop Docker container

Mine Pearl (PRL) on the unMineable PearlPow pool, with payouts in SOL.
Intended for a desktop Nvidia GPU, specifically an RTX 3070 Ti:
about 76 TH/s and $1.42/day revenue per WhatToMine's Pearl page at one
point in time (not measured on this container), before pool/miner fees. Pearl price and difficulty move,
so that is a snapshot, not a guarantee.

## What is in this image

- Nvidia CUDA 12.4.1 runtime, Ubuntu 22.04
- SRBMiner-MULTI 3.8.1, PearlHash, MD5-verified at build time
- `start.sh`, which refuses to start if `PAYOUT_WALLET` is empty (the image
  defaults it to the baked-in address and `WORKER` to `desktop3070ti`)
- Automatic GPU intensity (no fixed `--gpu-intensity`), requested 100% fan
  (`--gpu-fan0 100`) and 290 W power cap (`--gpu-plimit0 290`)
- TLS by default to `pearlpow.unmineable.com:4444`, with login
  `SOL:<Solana-address>.<worker>`
- A supervising shell that waits for the miner and forwards TERM/INT,
  including in detached Docker runs

Your public Solana payout address is baked in as the default, at your
explicit request (2026-10-31). That address is public, it is the
unMineable login, and it cannot spend funds. No private key, seed
phrase, or credential is in the image. Override it at run time if
you ever want payouts to a different address.

## Run it

You need Docker with GPU support and an Nvidia GPU.

### Windows 11 + Docker Desktop (RTX 3070 Ti)

- Install the current Nvidia Windows driver (Game Ready or Studio).
  Do NOT install a Linux driver inside WSL.
- Docker Desktop: Settings > General > "Use the WSL 2 based engine".
  The Nvidia Container Toolkit is not needed on Windows.
- Check GPU access first:
  `docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi`
- Run the commands below in PowerShell. In PowerShell use a backtick
  (`` ` ``) instead of `\` for line continuation, or put it on one line.
- Keep the PC awake and plugged in while mining. The 3070 Ti has 8 GB
  VRAM, which is fine for PearlHash. The miner autotunes on startup, so
  expect a lower hashrate for the first few minutes.
- Line endings: `.gitattributes` forces LF on `start.sh`, so a Windows
  checkout does not break the build.

On Linux you need the Nvidia Container Toolkit instead.

```sh
docker run -d --name pearl-miner --gpus all ghcr.io/jasincanada/miner:current
docker logs -f pearl-miner
```

`start.sh` supervises the miner in detached runs and forwards shutdown
signals. Use `docker stop pearl-miner` to stop it.

Or, to override the baked-in payout address:

```sh
docker run -d --name pearl-miner --gpus all \
  -e PAYOUT_WALLET=ANOTHER_SOLANA_ADDRESS \
  -e WORKER=desktop3070ti \
  ghcr.io/jasincanada/miner:current
```

Optional:

- `PAYOUT_WALLET` — bare Solana address; do not include `SOL:` or the worker
- `WORKER` — image default `desktop3070ti` (standalone script: `worker1`)
- `POOL` — default `pearlpow.unmineable.com:4444` (TLS)
- `USE_TLS` — default `true`; adds `--tls true`. The standard unMineable
  TCP endpoint is switched to port 4444 when TLS is enabled.
- For plain TCP, set both `-e POOL=pearlpow.unmineable.com:3333`
  and `-e USE_TLS=false`.

Supply only the Solana address in `PAYOUT_WALLET`; the script adds `SOL:`
and the worker suffix. Stop with `docker stop pearl-miner`, then remove
with `docker rm pearl-miner` before reusing that container name.

### Compose with scoped automatic updates

From this repository, run:

```sh
docker compose up -d
docker compose logs -f miner watchtower
```

If migrating from the old, unscoped configuration, first run
`docker compose stop watchtower`, then `docker compose up -d` to recreate
the updater with the new settings. Remove a standalone `pearl-miner`
container before switching to Compose.

The pinned Watchtower release checks `:current` every 900 seconds. Updates
require all three: the name `pearl-miner`, the enable label, and the
`pearl-miner` scope label. The updater itself has the same scope label
but no enable label, so it is not automatically updated. Update its pinned
image deliberately in Compose.

**Keep `--scope` and the matching scope labels on both services.**
`--label-enable` alone does not isolate Watchtower's startup cleanup of
other Watchtower instances. The scope excludes unrelated Watchtower
containers from that cleanup, including an unlabelled
`containrrr/watchtower` in another Compose project. Do not reuse this scope
for another updater. See the upstream
[multiple-instance configuration](https://watchtower.nickfedor.com/advanced-features/running-multiple-instances/).

**Image cleanup is disabled intentionally.** Old miner images remain
available for rollback. Docker image IDs and tags are shared across
projects; scope labels do not isolate image deletion. Do not add
`--cleanup` or schedule daemon-wide image pruning as part of this stack.
Only remove specific old images after checking all projects, including
stopped containers, for dependencies.

Scope is selection, not a Docker access-control boundary: the mounted
socket gives Watchtower control of the daemon. Configure other Watchtower
instances with their own distinct scope and matching labels (including
on the updater), and disable their image cleanup too. An existing
**unscoped** updater can still affect miner when it restarts or polls.

To check coexistence on Docker Desktop, record the unrelated container
and image before starting/recreating the miner stack (substitute its
actual name and image tag):

```sh
docker inspect nextcloud-watchtower-1 --format '{{.Id}} {{.State.Status}} {{.State.StartedAt}} {{.RestartCount}} {{.Image}}'
docker image inspect containrrr/watchtower:latest --format '{{.Id}} {{json .RepoTags}}'
docker compose up -d
docker compose logs watchtower
```

Repeat both inspect commands after startup and after an update. Their
values must remain unchanged. For an immediate update check, run:

```sh
docker compose run --rm --no-deps watchtower --label-enable --scope pearl-miner --run-once pearl-miner
```

When `:current` changes, confirm Watchtower reports recreating only
`pearl-miner`, the miner uses the new image, the old image is still
inspectable by ID, and the unrelated container and image are unchanged.
A check with no available update verifies selection, not recreation.

Shared-daemon startup and recreation were tested on Linux Docker using a
BusyBox stand-in for the miner and an unscoped `containrrr/watchtower:latest`.
The unrelated container and image were unchanged, and the old miner image
was retained. Repeat the checks above on your Windows/WSL2 host.

## Verify on Docker Desktop before unattended mining

The flags request hardware settings; they do not prove the driver applies
them. Docker Desktop/WSL2 may not expose fan or power management even when
`--gpus all` enables mining. This repository update has **not** been
validated on the target RTX 3070 Ti: no target GPU telemetry, pool jobs,
or accepted shares were available in the development environment.

Build this source with `docker build -t miner:3.8.3 .` if the updated
image is not yet available from the registry. Already-downloaded images
do not change until rebuilt or updated from the registry.

1. Use `docker logs -f pearl-miner` to check SRBMiner 3.8.1 detects the
   RTX 3070 Ti, tunes intensity without a fixed override, connects via TLS
   to `pearlpow.unmineable.com:4444` with `SOL:<address>.<worker>`, receives
   pool jobs, and reports accepted (not merely submitted) shares. The
   startup `TLS: true` line alone does not prove a connection or accepted
   share.
2. On the **Windows host**, run this in a second PowerShell window during
   startup and sustained mining:

   ```powershell
   nvidia-smi --query-gpu=name,fan.speed,power.limit,power.draw --format=csv -l 1
   ```

   Verify the effective power limit is 290 W and sampled board power
   does not exceed 290 W. Use the board vendor's control utility to
   confirm a manual **100% fan target**, and host sensor telemetry to
   confirm fan speed/RPM responds accordingly. A logged command or
   an `N/A` sensor value is not confirmation.
3. If the container controls are ignored, stop mining and apply a manual
   100% fan target and 290 W cap using the host GPU control utility.
   On native Linux, `sudo nvidia-smi -i 0 -pl 290` can set the power cap
   for GPU 0; fan control needs a supported host utility/driver setup.
   Do not add `--privileged` or install a Linux NVIDIA driver in WSL
   to work around unsupported controls.
4. Repeat both miner and host checks after applying host settings.
   Do not leave mining unattended if fan target or power cap cannot
   be confirmed, or if observed power exceeds 290 W. Record image
   tag/digest, driver version, fan target and speed, power limit and
   maximum observed draw, pool jobs and accepted-share count.

Check unMineable stats by your Solana wallet address for pool-side
hashrate as an additional check, not a substitute for host telemetry.

## Build it yourself

```sh
docker build -t miner:3.8.3 .
docker run -d --name pearl-miner --gpus all miner:3.8.3
```

## Images

The source release is tagged `v3.8.3`; its corresponding container image
tag is `3.8.3` (without the `v`). GitHub Actions publishes images when a
versioned source tag is pushed:

- GitHub Container Registry: `ghcr.io/<owner>/miner:3.8.3`
- Docker Hub: `<dockerhub-user>/miner:3.8.3`
  (requires the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository
  secrets; that job is skipped until those secrets are set)

Each release build also moves the floating `current` tag (same registries,
e.g. `ghcr.io/<owner>/miner:current`) to the newest image. Pin a version
tag if you need reproducibility.

The source tag alone does not confirm that an image was published. Check
the registry before describing or using `3.8.3` as an available image.
The image contains SRBMiner-MULTI 3.8.1; that is the miner binary version,
not the container image tag. Before the next image release, resolve the
verified pool-default and GPU-requirement issues and complete the GPU,
supervised-startup, TLS/SOL-login, automatic-intensity, fan-target, and
290 W-cap smoke tests.

## Fees, in plain terms

- SRBMiner PearlHash dev fee: 3%
- unMineable: about 1% conversion fee, 0.05 SOL minimum payout, daily
- This container adds no fee of its own, and it does not phone home
