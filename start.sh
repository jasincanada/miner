#!/bin/sh
# Pearl miner start script for the desktop container.
# Configuration comes from environment variables. The default payout
# wallet is set in the Dockerfile (public address only, no secrets).
#
# Pool: unMineable PearlPow — mines PRL, pays out in SOL on the
# Solana network. unMineable uses your wallet address as the login,
# so NO pool account is needed.
#
# Required:
#   PAYOUT_WALLET  Your Solana wallet address (SOL payout address.
#                  MUST be a Solana-network address, NOT a BSC
#                  address and NOT a PRL address)
# Optional:
#   WORKER   default: worker1
#   POOL     default: pearlpow.unmineable.com:3333 (TCP). For SSL set
#            POOL=pearlpow.unmineable.com:4444 and USE_TLS=true.
#   USE_TLS  default: false; set to "true" to add --tls true
set -eu

if [ -z "${PAYOUT_WALLET:-}" ]; then
    echo "ERROR: PAYOUT_WALLET is not set. Refusing to start." >&2
    echo "Set it to your Solana wallet address with -e PAYOUT_WALLET=..." >&2
    exit 1
fi

WORKER="${WORKER:-worker1}"
POOL="${POOL:-pearlpow.unmineable.com:3333}"
USE_TLS="${USE_TLS:-false}"

# Fail-fast GPU sanity check: log what the container sees. A missing
# nvidia-smi binary alone is only a warning (PATH quirks happen); the
# miner itself will fail clearly if no GPU is present, and with
# --disable-cpu it exits instead of mining on CPU.
if command -v nvidia-smi >/dev/null 2>&1; then
    echo "--- GPU seen by container ---"
    nvidia-smi || echo "WARNING: nvidia-smi ran but reported an error."
else
    echo "WARNING: nvidia-smi not found in container; continuing and letting the miner report GPU status."
fi

# TLS note: unMineable's SSL endpoint is a different port (4444), not
# a flag on the TCP port. If TLS is requested and POOL is still the
# TCP default, switch to the SSL endpoint automatically.
if [ "$USE_TLS" = "true" ] && [ "$POOL" = "pearlpow.unmineable.com:3333" ]; then
    POOL="pearlpow.unmineable.com:4444"
fi

# Build the miner command. --tls true is appended only when USE_TLS=true.
set -- /opt/srbminer/SRBMiner-MULTI \
    --disable-cpu \
    --gpu-fan0 100 \
    --gpu-plimit0 290 \
    --algorithm pearlhash \
    --pool "$POOL" \
    --wallet "${PAYOUT_WALLET}.${WORKER}"

if [ "$USE_TLS" = "true" ]; then
    set -- "$@" --tls true
fi

echo "--- Starting SRBMiner-MULTI ---"
echo "Pool:   $POOL"
echo "Wallet: ${PAYOUT_WALLET}.${WORKER}"
echo "TLS:    $USE_TLS"
echo "Command template: SRBMiner-MULTI --disable-cpu --algorithm pearlhash --pool <pool> --wallet <sol-address>.<worker>[ --tls true ]"

# Keep the shell alive to supervise the miner in detached Docker runs.
"$@" &
miner_pid=$!

stop_miner() {
    trap '' TERM INT
    kill "-$1" "$miner_pid" 2>/dev/null || true
    wait "$miner_pid"
    exit $?
}

trap 'stop_miner TERM' TERM
trap 'stop_miner INT' INT
wait "$miner_pid"
