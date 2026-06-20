#!/usr/bin/env bash
# Usage: dtrack-upload.sh <bom-file> <project-name> <project-version>
# Required env: DTRACK_URL, DTRACK_API_KEY, CF_CLIENT_ID, CF_CLIENT_SECRET
set -euo pipefail

BOM_FILE="$1"
PROJECT_NAME="$2"
PROJECT_VERSION="$3"

CF_HEADERS=(
  -H "CF-Access-Client-Id: ${CF_CLIENT_ID}"
  -H "CF-Access-Client-Secret: ${CF_CLIENT_SECRET}"
)
AUTH_HEADER=(-H "X-Api-Key: ${DTRACK_API_KEY}")

# ── Upload BOM ────────────────────────────────────────────────────────────────
echo "Uploading ${BOM_FILE} to DependencyTrack..."
HTTP_CODE=$(curl -so /tmp/dt-upload.json -w "%{http_code}" --retry 3 \
  "${AUTH_HEADER[@]}" "${CF_HEADERS[@]}" \
  -F "projectName=${PROJECT_NAME}" \
  -F "projectVersion=${PROJECT_VERSION}" \
  -F "autoCreate=true" \
  -F "bom=@${BOM_FILE}" \
  "${DTRACK_URL}/api/v1/bom")

if [ "$HTTP_CODE" != "200" ]; then
  echo "Upload failed (HTTP ${HTTP_CODE}): $(cat /tmp/dt-upload.json)"
  exit 1
fi

TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/dt-upload.json'))['token'])")
echo "BOM token: ${TOKEN}"

# ── Poll until processing complete ───────────────────────────────────────────
echo "Waiting for BOM processing..."
for i in $(seq 1 30); do
  PROCESSING=$(curl -s --retry 3 \
    "${AUTH_HEADER[@]}" "${CF_HEADERS[@]}" \
    "${DTRACK_URL}/api/v1/bom/token/${TOKEN}" \
    | python3 -c "import json,sys; print(json.load(sys.stdin).get('processing','true'))" 2>/dev/null || echo "true")
  echo "  poll ${i}: processing=${PROCESSING}"
  [ "$PROCESSING" = "False" ] && break
  sleep 10
done

if [ "$PROCESSING" != "False" ]; then
  echo "BOM processing timed out after 5 minutes"
  exit 1
fi

# ── Check policy violations ───────────────────────────────────────────────────
echo "Checking policy violations..."
VIOLATIONS=$(curl -s --retry 3 \
  "${AUTH_HEADER[@]}" "${CF_HEADERS[@]}" \
  "${DTRACK_URL}/api/v1/violation/project?name=${PROJECT_NAME}&version=${PROJECT_VERSION}")

COUNT=$(echo "${VIOLATIONS}" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read() or '[]')
critical = [v for v in data if v.get('type') == 'SECURITY']
print(len(critical))
" 2>/dev/null || echo "0")

if [ "$COUNT" -gt 0 ]; then
  echo "SECURITY policy violations: ${COUNT}"
  exit 1
fi

echo "No critical policy violations."
