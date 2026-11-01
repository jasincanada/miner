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
- SRBMiner is started with a 100% fan target (`--gpu-fan0 100`) and a
  290 W power limit (`--gpu-plimit0 290`). GPU intensity remains
  automatic; no `--gpu-intensity` is set.
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

Optional:

- `POOL` — default `pearlpow.unmineable.com:3333` (TCP)
- `USE_TLS=true` — switches to the SSL pool port automatically

### Verify fan, power, and mining

The SRBMiner options request these settings; their presence in the
command line does not prove that the driver applied them. With Docker
Desktop's WSL 2 backend, CUDA mining and telemetry may work while
hardware fan and power-limit controls are unavailable or unreliable.
In particular, Windows does not reliably expose those controls to a
Linux container. If the limit or fan target is not reflected in live
telemetry, apply it with a Windows-native GPU utility or use a Linux
host that supports NVIDIA management controls; do not assume the
container enforced it.

While mining, check the GPU from a second Windows terminal (or the Linux
host):

```powershell
nvidia-smi --query-gpu=timestamp,name,fan.speed,power.draw,power.limit --format=csv -l 1
```

Confirm during sustained mining that fan speed reports 100%, the power
limit reports no more than 290 W, and sampled power draw never exceeds
290 W. `N/A`, an unsupported query, or a power limit above 290 W means
the requirement has not been verified; stop mining until a supported
host-side control is applied. These readings must be observed on the
RTX 3070 Ti itself under Docker Desktop to verify that setup.

Also check the miner's live log for received jobs and accepted shares:
`docker logs -f <container-name>`. Check unMineable stats by your wallet
address for the pool-side hashrate.

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
