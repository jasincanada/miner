# Pearl miner — desktop Docker container

Mine Pearl (PRL) on the unMineable PearlPow pool, with payouts in SOL.
Built for a desktop Nvidia GPU, tested in spirit for an RTX 3070 Ti:
about 76 TH/s on WhatToMine's Pearl page, about $1.42/day revenue at
that snapshot, before pool/miner fees. Pearl price and difficulty move,
so that is a snapshot, not a guarantee.

## What is in this image

- Nvidia CUDA 12.4.1 runtime, Ubuntu 22.04
- SRBMiner-MULTI 3.8.1, PearlHash, MD5-verified at build time
- `start.sh`, which refuses to start without a payout wallet

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
docker run --rm --gpus all <image>
```

Or, to override the baked-in payout address:

```sh
docker run --rm --gpus all \
  -e PAYOUT_WALLET=ANOTHER_SOLANA_ADDRESS \
  -e WORKER=desktop3070ti \
  <image>
```

The default connection uses `pearlpow.unmineable.com:4444` with
`--tls true`. The login is `SOL:<solana-address>.<worker>`; supply
`PAYOUT_WALLET` as the address only, without the `SOL:` prefix.

Optional:

- `POOL` — default `pearlpow.unmineable.com:4444` (TLS)
- `USE_TLS` — default `true`; adds `--tls true` and switches the
  unMineable TCP endpoint to port 4444 automatically
- To use TCP instead, set both `POOL=pearlpow.unmineable.com:3333`
  and `USE_TLS=false`

Check the miner log for accepted shares, and check unMineable stats
by your wallet address for the pool-side hashrate.

## Build it yourself

```sh
docker build -t miner:3.8.1 .
```

## Images

GitHub Actions builds this on push to `main`:

- GitHub Container Registry: `ghcr.io/<owner>/miner:3.8.1`
- Docker Hub: `<dockerhub-user>/miner:3.8.1`
  (requires the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository
  secrets; that job is skipped until those secrets are set)

## Fees, in plain terms

- SRBMiner PearlHash dev fee: 3%
- unMineable: about 1% conversion fee, 0.05 SOL minimum payout, daily
- This container adds no fee of its own, and it does not phone home
