# Pearl miner — desktop Docker container

Mine Pearl (PRL) on the unMineable PearlPow pool, with payouts in SOL.
Intended for a desktop Nvidia GPU, specifically an RTX 3070 Ti:
about 76 TH/s and $1.42/day revenue per WhatToMine's Pearl page at one
point in time (not measured on this container), before pool/miner fees. Pearl price and difficulty move,
so that is a snapshot, not a guarantee.

## What is in this image

- Nvidia CUDA 12.4.1 runtime, Ubuntu 22.04
- SRBMiner-MULTI 3.8.3, PearlHash, MD5-verified at build time
- `start.sh`, which refuses to start if `PAYOUT_WALLET` is empty (the image
  defaults it to the baked-in address and `WORKER` to `desktop3070ti`)
- Automatic GPU intensity and automatic fan. Fan and power flags are opt-in
  (`GPU_FAN`, `GPU_POWER_LIMIT`) and fail on Docker Desktop; set a 290 W cap
  on the host instead (see Power and fan)
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

## Power and fan on Docker Desktop (Windows 11 / WSL2)

**Fan and power cannot be set from inside the container.** SRBMiner's NVML
writes fail with `Insufficient Permissions (4)` (`PL0`/`FS0` FAILED), so
`--gpu-fan0` and `--gpu-plimit0` are not passed by default. They can be
requested with `-e GPU_FAN=... -e GPU_POWER_LIMIT=...`, but on this setup
they will fail.

**Settings for the RTX 3070 Ti:**

- **Power cap: 290 W, set on the Windows host.** Run
  `nvidia-smi -pl 290` in an Administrator PowerShell. It resets on reboot,
  so repeat it after each restart. 310 W (the card's default limit) is the
  absolute ceiling; never set the cap above it.
- **Fan: automatic.** Leave the card's own fan control on auto. A fixed
  100% fan target is not required and `nvidia-smi` cannot set fan speed on
  this GPU. A host utility such as MSI Afterburner is optional.
- **Intensity: automatic** (no `--gpu-intensity`).

**Verified on the target host (v3.8.4, SRBMiner 3.8.3, 15+ minutes):**
about 87-89 TH/s, 3 accepted and 0 rejected shares, draw 280-289 W under a
290 W cap, temperature peak 84 C, automatic fan up to 99%, no restarts.

**Check it yourself:**

1. `docker logs -f pearl-miner` should show your GPU detected, TLS to
   `pearlpow.unmineable.com:4444`, the `SOL:<address>.<worker>` login, jobs,
   and `share accepted` lines. Judge shares only after the first few
   minutes, while autotune runs.
2. On the Windows host, in a second PowerShell window:

   ```powershell
   nvidia-smi --query-gpu=name,power.limit,power.draw,fan.speed,temperature.gpu --format=csv -l 1
   ```

   Power limit should read 290 W with draw at or below it.
3. Stop mining if temperature stays above 85 C or draw exceeds the cap.
   Do not add `--privileged` or install a Linux NVIDIA driver in WSL to
   work around the blocked controls.

Check unMineable stats by your Solana wallet address for pool-side
hashrate as an additional check, not a substitute for host telemetry.

## Automatic updates (`:current`)

`docker-compose.yml` runs the miner from `ghcr.io/jasincanada/miner:current`
plus Watchtower, which checks every 15 minutes and recreates the miner when
a new release is published.

It is scoped (`--scope pearl-miner`), so it only touches the miner
container. It will not stop other Watchtower containers or Compose projects
on the same Docker daemon, and `--cleanup` only removes old images of the
miner it updates. The `watchtower=false` label on `miner-watchtower` also
stops other Watchtower instances from removing it. Other projects' Watchtowers
still need their own `--label-enable` or scope if they must not touch the miner.

```sh
docker compose up -d
```

Watchtower needs the Docker socket, which gives it control of the host's
Docker. Use the versioned tag instead of `:current` on any host where you
want to pin a release and skip the Watchtower service.

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
The image contains SRBMiner-MULTI 3.8.3; that is the miner binary version,
not the container image tag. The container release number (for example
`v3.8.4`) is separate and increases with every image change.

## Fees, in plain terms

- SRBMiner PearlHash dev fee: 3%
- unMineable: about 1% conversion fee, 0.05 SOL minimum payout, daily
- This container adds no fee of its own, and it does not phone home
