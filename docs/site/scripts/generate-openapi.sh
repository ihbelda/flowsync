#!/usr/bin/env bash
# Genera docs/site/openapi.yaml a partir del backend real: arranca el
# servidor AdonisJS en background el tiempo justo para pedirle /openapi
# (generado por adonis-autoswagger desde las rutas/validators reales) y lo
# para. Así el "Reference" de la API no es un documento a mano que se
# desincroniza, sino un snapshot del backend en cada build.
#
# Requiere que backend/ tenga node_modules instalados (node ace ...).
set -euo pipefail

SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ROOT="$(cd "$SITE_ROOT/../../backend" && pwd)"
OUT_FILE="$SITE_ROOT/openapi.yaml"
PORT=3399
HEALTH_URL="http://localhost:$PORT/api/v1/health"
OPENAPI_URL="http://localhost:$PORT/openapi"

cd "$BACKEND_ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
fi
if ! grep -q '^APP_KEY=.\+' .env; then
  node ace generate:key
fi

PORT=$PORT HOST=localhost node ace serve > /tmp/flowsync-backend-openapi.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

echo "Esperando a que el backend arranque en :$PORT..."
ready=false
for _ in $(seq 1 30); do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [ "$ready" != true ]; then
  echo "El backend no respondió a tiempo en $HEALTH_URL" >&2
  cat /tmp/flowsync-backend-openapi.log >&2
  exit 1
fi

curl -sf "$OPENAPI_URL" -o "$OUT_FILE"
echo "openapi.yaml generado en $OUT_FILE ($(wc -c < "$OUT_FILE") bytes)"

node "$SITE_ROOT/scripts/patch-openapi.mjs"
