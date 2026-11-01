# Pearl (PRL) miner for a desktop Nvidia GPU — SRBMiner-MULTI, PearlHash.
# Default payout wallet is baked in at the user's explicit request
# (2026-10-31): his public Solana payout address, the same address
# his Salad miners pay out to. This is a PUBLIC address only — it
# cannot spend funds, and no private key, seed phrase, or secret
# is in this image. Override it at run time with -e PAYOUT_WALLET=...
# Runtime config:
#   PAYOUT_WALLET  (default: baked-in public Solana payout address)
#   WORKER         (default: desktop3070ti)
#   POOL           (default: pearlpow.unmineable.com:4444)
#   USE_TLS        (default: true)
# GPU intensity is automatic. Fan/power flags are opt-in (GPU_FAN,
# GPU_POWER_LIMIT) because Docker Desktop/WSL2 blocks those NVML writes.
#
# Run with Nvidia Container Toolkit, for example:
#   docker run --rm --gpus all \
#     -e PAYOUT_WALLET=YOUR_SOL_ADDRESS -e WORKER=desktop3070ti \
#     <image>
#
# SRBMiner-MULTI 3.8.3, MD5 as published by the miner author.
ARG SRBMINER_VERSION=3.8.3
ARG SRBMINER_MD5=2b440b62923ec6930c56f352495c28e9

FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

ARG SRBMINER_VERSION
ARG SRBMINER_MD5

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libcurl4 \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    VERSION_DASH="$(echo "${SRBMINER_VERSION}" | tr '.' '-')"; \
    ASSET="SRBMiner-Multi-${VERSION_DASH}-Linux.tar.gz"; \
    curl -fL -o "/tmp/${ASSET}" \
        "https://github.com/doktor83/SRBMiner-Multi/releases/download/${SRBMINER_VERSION}/${ASSET}"; \
    cd /tmp && echo "${SRBMINER_MD5}  ${ASSET}" | md5sum -c -; \
    tar -xzf "/tmp/${ASSET}" -C /tmp; \
    mkdir -p /opt/srbminer; \
    cp "/tmp/SRBMiner-Multi-${VERSION_DASH}/SRBMiner-MULTI" /opt/srbminer/SRBMiner-MULTI; \
    chmod +x /opt/srbminer/SRBMiner-MULTI; \
    rm -rf "/tmp/${ASSET}" "/tmp/SRBMiner-Multi-${VERSION_DASH}"

COPY start.sh /opt/srbminer/start.sh
RUN chmod +x /opt/srbminer/start.sh

ENV PAYOUT_WALLET=615Jb4hfGDPBrJvjdvjAgTAWbYzwz5jAF8Xt72FVRm3j
ENV WORKER=desktop3070ti

# Expose the GPU compute libs and nvidia-smi (needed on Docker Desktop/WSL2).
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

WORKDIR /opt/srbminer
ENTRYPOINT ["/opt/srbminer/start.sh"]
