# Pearl miner — desktop Docker container

Mine Pearl (PRL) on the unMineable PearlPow pool, with payouts in SOL.
Intended for a desktop Nvidia GPU, specifically an RTX 3070 Ti:
about 76 TH/s on WhatToMine's Pearl page, about $1.42/day revenue at
that snapshot, before pool/miner fees. Pearl price and difficulty move,
so that is a snapshot, not a guarantee.

## What is in this image

- Nvidia CUDA 12.4.1 runtime, Ubuntu 22.04
- SRBMiner-MULTI 3.8.1, PearlHash, MD5-verified at build time
- `start.sh`, which refuses to start without a payout wallet
- Automatic GPU intensity (no fixed `--gpu-intensity`), requested 100% fan
  (`--gpu-fan0 100`) and 290 W power cap (`--gpu-plimit0 290`)
- TLS to `pearlpow.unmineable.com:4444`, login `SOL:<address>.<worker>`
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
docker run -d --name pearl-miner --gpus all ghcr.io/jasincanada/miner:3.8.1-1
docker logs -f pearl-miner
```

Or, to override the baked-in payout address:

```sh
docker run -d --name pearl-miner --gpus all \
  -e PAYOUT_WALLET=ANOTHER_SOLANA_ADDRESS \
  -e WORKER=desktop3070ti \
  ghcr.io/jasincanada/miner:3.8.1-1
```

Optional:

- `POOL` — default `pearlpow.unmineable.com:4444` (TLS)
- `USE_TLS` — default `true`; for TCP explicitly set `USE_TLS=false`
  and a TCP endpoint. TLS also upgrades the old unMineable `:3333`
  endpoint to `:4444`.

Supply only the Solana address in `PAYOUT_WALLET`; the script adds `SOL:`
and the worker suffix. Stop with `docker stop pearl-miner`, then remove
with `docker rm pearl-miner` before reusing that container name.

## Verify on the target GPU before unattended mining

The flags request hardware settings; they do not prove the driver applies
them. Docker Desktop/WSL2 may not expose fan or power management even when
`--gpus all` enables mining. This repository update has **not** been
validated on the target RTX 3070 Ti: no target GPU telemetry, pool jobs,
or accepted shares were available in the development environment.

1. Use `docker logs -f pearl-miner` to check SRBMiner 3.8.1 detects the
   RTX 3070 Ti, tunes intensity without a fixed override, connects via TLS
   to `pearlpow.unmineable.com:4444` with `SOL:<address>.<worker>`, receives
   pool jobs, and reports accepted (not merely submitted) shares.
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
docker build -t miner:3.8.1-1 .
docker run -d --name pearl-miner --gpus all miner:3.8.1-1
```

## Images

GitHub Actions builds this configuration on push to `main` (or a manual
workflow run). The new image tag is `3.8.1-1`; the miner binary remains
3.8.1. Rebuild from the source revision containing these changes or pull
the new tag after publication; existing containers/images are not updated
automatically.

- GitHub Container Registry: `ghcr.io/jasincanada/miner:3.8.1-1`
- Docker Hub: `<dockerhub-user>/miner:3.8.1-1`
  (requires the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository
  secrets; that job is skipped until those secrets are set)

## Fees, in plain terms

- SRBMiner PearlHash dev fee: 3%
- unMineable: about 1% conversion fee, 0.05 SOL minimum payout, daily
- This container adds no fee of its own, and it does not phone home
