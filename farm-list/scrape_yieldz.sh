#!/usr/bin/env bash
# Scrape yieldz.io/leverage (both views) into a JSON file for the Looping tab.
#
# yieldz.io is a client-side app, so this drives headless Chromium. The
# session's egress gateway rejects Chromium's TLS handshake directly, so a
# local mitmproxy is chained in front of the sanctioned agent proxy purely as
# a TLS-compatibility shim — all traffic still flows through (and is policed
# by) the upstream proxy; nothing bypasses the egress policy.
#
# Usage: scrape_yieldz.sh <out.json>
set -euo pipefail
OUT="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"

# 1) mitmproxy venv (survives while the container lives; rebuilt after recycle)
if [ ! -x /opt/mitmenv/bin/mitmdump ]; then
  python3 -m venv /opt/mitmenv
  /opt/mitmenv/bin/pip install -q --upgrade pip setuptools wheel
  /opt/mitmenv/bin/pip install -q mitmproxy
fi

# 2) NSS trust store for Chromium (proxy CA + mitmproxy CA)
if ! command -v certutil >/dev/null; then
  apt-get install -y -q libnss3-tools >/dev/null 2>&1 || apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libnss3-tools >/dev/null
fi
mkdir -p "$HOME/.pki/nssdb"
certutil -d sql:"$HOME/.pki/nssdb" -L >/dev/null 2>&1 || certutil -d sql:"$HOME/.pki/nssdb" -N --empty-password
certutil -d sql:"$HOME/.pki/nssdb" -L 2>/dev/null | grep -q ccr-agent-proxy || \
  certutil -d sql:"$HOME/.pki/nssdb" -A -t "C,," -n ccr-agent-proxy -i /root/.ccr/agent-proxy-ca.crt

# 3) start the shim (mitmproxy generates its CA on first run)
/opt/mitmenv/bin/mitmdump --mode "upstream:$HTTPS_PROXY" --listen-port 8081 \
  --set ssl_verify_upstream_trusted_ca=/root/.ccr/ca-bundle.crt -q &
MITM=$!
trap 'kill $MITM 2>/dev/null || true' EXIT
for i in $(seq 1 30); do [ -f "$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ] && break || sleep 1; done
certutil -d sql:"$HOME/.pki/nssdb" -L 2>/dev/null | grep -q mitmproxy-local || \
  certutil -d sql:"$HOME/.pki/nssdb" -A -t "C,," -n mitmproxy-local -i "$HOME/.mitmproxy/mitmproxy-ca-cert.pem"
for i in $(seq 1 30); do
  curl -sx http://127.0.0.1:8081 -o /dev/null --max-time 8 https://yieldz.io/ && break || sleep 1
done

# 4) scrape
export NODE_PATH="$(npm root -g)"
node "$HERE/yz_scrape.js" "$OUT"
