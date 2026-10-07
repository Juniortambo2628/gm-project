#!/usr/bin/env bash
# Post-deploy smoke tests for gm-coaching.com. Exits non-zero if any check fails.
# Usage: .github/scripts/smoke-test.sh   (override hosts with SITE_URL / APEX_URL / API_URL)
set -uo pipefail

SITE_URL="${SITE_URL:-https://www.gm-coaching.com}"
APEX_URL="${APEX_URL:-https://gm-coaching.com}"
API_URL="${API_URL:-https://api.gm-coaching.com/api}"

FAILURES=0
pass() { echo "  ✓ $1"; }
fail() { echo "::error::$1"; FAILURES=$((FAILURES + 1)); }

# curl with retries; prints "<status> <redirect-location>"
probe() {
  local url=$1 out
  for attempt in 1 2 3 4 5; do
    out=$(curl -s -o /dev/null --max-time 20 -w "%{http_code} %{redirect_url}" "$url" 2>/dev/null) || out="000 "
    [ "${out%% *}" != "000" ] && [ "${out%% *}" -lt 500 ] && break
    sleep $((attempt * 3))
  done
  echo "$out"
}

expect_redirect() {
  local from=$1 to=$2 out status location
  out=$(probe "$from"); status=${out%% *}; location=${out#* }
  if [[ "$status" =~ ^30[178]$ ]] && [[ "${location%/}" == "${to%/}"* ]]; then
    pass "$from → $location ($status)"
  else
    fail "$from should redirect to $to, got HTTP $status ${location:+→ $location}"
  fi
}

expect_ok() {
  local url=$1 out status
  out=$(probe "$url"); status=${out%% *}
  if [ "$status" = "200" ]; then pass "$url (200)"; else fail "$url returned HTTP $status"; fi
}

echo "▸ Domain redirects"
expect_redirect "$APEX_URL/" "$SITE_URL/"
expect_redirect "http://${APEX_URL#https://}/" "https://"
expect_redirect "http://${SITE_URL#https://}/" "$SITE_URL/"

echo "▸ Frontend pages"
for path in / /book/ /services/ /contact/ /login/; do
  expect_ok "$SITE_URL$path"
done

echo "▸ API"
health=$(curl -s --max-time 20 "$API_URL/health" 2>/dev/null)
if echo "$health" | grep -q '"status":"ok"'; then pass "$API_URL/health reports ok"; else fail "$API_URL/health unhealthy: ${health:0:200}"; fi

services=$(curl -s --max-time 20 "$API_URL/services" 2>/dev/null)
if python3 - "$services" <<'PY'
import json, sys
data = json.loads(sys.argv[1])
services = data.get("data", data) if isinstance(data, dict) else data
assert isinstance(services, list) and services, "no active services"
free = [s.get("name") for s in services if float(s.get("price") or 0) <= 0]
assert not free, f"free services are listed: {free}"
print("  ✓ %d bookable services, all paid: %s" % (len(services), ", ".join(s.get("name", "?") for s in services)))
PY
then :; else fail "$API_URL/services check failed: ${services:0:200}"; fi

# Booking endpoints must exist (auth-protected → 401, not 404/500)
status=$(curl -s -o /dev/null --max-time 20 -w "%{http_code}" -X POST -H "Accept: application/json" "$API_URL/bookings/reserve")
if [ "$status" = "401" ]; then pass "POST /bookings/reserve requires sign-in (401)"; else fail "POST /bookings/reserve returned HTTP $status (expected 401)"; fi

status=$(curl -s -o /dev/null --max-time 20 -w "%{http_code}" -X POST -H "Accept: application/json" "$API_URL/payments/create-checkout")
if [ "$status" = "422" ]; then pass "POST /payments/create-checkout validates input (422)"; else fail "POST /payments/create-checkout returned HTTP $status (expected 422)"; fi

echo ""
if [ "$FAILURES" -gt 0 ]; then
  echo "✗ $FAILURES smoke check(s) failed"
  exit 1
fi
echo "✓ All smoke checks passed"
