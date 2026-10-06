# GM Coaching Platform — Improvement Audit & Plan

_Last updated: 2026-10-06_

A prioritized, actionable audit of the Gathoni Mwai Coaching platform
(Laravel 12 API + Next.js frontend). Each item lists **severity**,
**impact**, **effort**, and a concrete **action**. Severities:
🔴 High · 🟠 Medium · 🟡 Low.

This is a living document — check off items as they land and add new ones
as they surface.

---

## 0. What's already solid (keep it this way)

A fair audit starts with the strengths, because several things are done
right and should not regress:

- **Auth routes are rate-limited** — login, 2FA, register, password reset,
  and public write endpoints (inquiries, transactions, checkout) all carry
  explicit `throttle:*` middleware.
- **Stripe webhooks verify signatures** via `Webhook::constructEvent`
  rather than trusting the payload.
- **CORS is explicitly scoped** to known origins (no `*`).
- **Admin surface is behind `auth:sanctum` + `admin` middleware**, tested
  in `AdminAuthorizationTest` / `SettingsSecurityTest`.
- **Meaningful test suite already exists** — ~122 backend test methods and
  a frontend component/context/unit suite on Vitest.
- **CI runs lint + typecheck + tests + build** on every PR, with a deploy
  gate.

---

## 1. Testing & quality gates

### 1.1 🟠 No coverage floor is enforced
CI runs `phpunit --coverage-text` but nothing fails the build when coverage
drops. Coverage can silently erode.
- **Action:** add a minimum threshold. For PHPUnit, gate with a tool such as
  `php-coverage-check` on the generated Clover report, or adopt Pest's
  `--coverage --min=NN`. Start the floor at the current measured number and
  ratchet up.

### 1.2 🟠 `IntegrationTestService` was untested (now partially covered)
The admin "Integrations" page is the operator's single source of truth for
whether Stripe/SMTP/Calendly/etc. are wired up — and it had zero tests until
this change. A regression here (like the recent Calendly by-reference bug)
ships silently.
- **Done in this PR:** `IntegrationTestServiceTest` covering all seven
  probes with `Http::fake`, the Calendly fallback regression, persistence,
  and the controller endpoints.
- **Action (follow-up):** extend to `MailDeliveryService::sendTest` and the
  `send-test-email` success path.

### 1.3 🟠 External HTTP calls are made with no fake in most tests
Before this change, no test used `Http::fake()`. Any test that exercises a
code path doing a real outbound request is slow and flaky (and fails in a
locked-down CI network).
- **Action:** adopt `Http::fake()` + `Http::preventStrayRequests()` as the
  default in `TestCase::setUp()` so a stray real request fails loudly.

### 1.4 🟡 No static analysis
No PHPStan/Larastan config exists; the frontend has ~9 `any` escapes.
- **Action:** add Larastan at level 5+ to CI (backend) and enable
  `@typescript-eslint/no-explicit-any` as a warning trending to error
  (frontend). Fix the existing `any` usages.

### 1.5 🟡 No end-to-end / API contract test for the booking → payment flow at the HTTP boundary
`FullBookingFlowTest` exists but a Playwright smoke across the real frontend
(sign-in → pick package → checkout redirect) would catch integration drift
the unit layer can't.
- **Action:** one Playwright happy-path spec, run nightly rather than per-PR.

---

## 2. Security

### 2.1 🟠 Secrets read via `env()` outside `config/` — breaks under `config:cache`
`env()` is called in `MailTemplate`, `StripeService`, and
`IntegrationTestService` (10 call sites). In production with
`php artisan config:cache` (standard for performance), **`env()` returns
`null`** outside config files — silently disabling mail "from" addresses,
the Stripe return URL, and S3 detection.
- **Action:** move each to a `config/*.php` key and read `config(...)`.
  Examples: `config('mail.from_addresses.bookings')`,
  `config('app.frontend_url')`, `config('filesystems.disks.s3.*')`.
- **Verify:** add a CI step running `php artisan config:cache` before tests
  so this class of bug fails the build.

### 2.2 🟠 Admin integrations response may expose config shape
Integration details echo key prefixes, bucket names, regions, and
reachability. That's acceptable for admins, but confirm the endpoint can
never be reached unauthenticated and that `details.error` (raw exception
text) can't leak internal hostnames to a non-admin.
- **Action:** keep the `admin` middleware assertion test (added) and scrub
  exception messages before returning them.

### 2.3 🟡 No automated dependency / secret scanning in CI
- **Action:** add `composer audit` and `npm audit --production` as
  non-blocking CI steps, plus a secret-scanner (gitleaks) on PRs.

### 2.4 🟡 2FA is a setting but needs brute-force review
2FA verification is throttled (`throttle:10,1`). Confirm codes are
single-use, time-boxed, and invalidated after N failures.
- **Action:** add tests asserting code expiry and lockout.

---

## 3. CI/CD & developer experience

### 3.1 🔴 The `auto-fix` job commits directly to `main`
The CI pipeline's `auto-fix` job runs Pint/ESLint `--fix` and
`git push`es to `main` with `[ci-skip]`. This pushes **unreviewed, un-CI'd
commits to the production branch** and needs `contents: write`.
- **Risk:** a bad auto-fix lands on `main` without a green pipeline; the
  `[ci-skip]` means the amended tree is never re-verified.
- **Action:** make formatting a **required check that fails** the PR instead
  of auto-committing (contributors run `pint`/`eslint --fix` locally), or
  have the job push to the PR branch, never to `main`. Drop `contents:
  write` from the default pipeline if the auto-commit is removed.

### 3.2 🟡 No pre-commit hook mirrors CI
Style failures are discovered in CI, not locally.
- **Action:** add a lightweight hook (Husky + lint-staged on the frontend,
  a `pint --dirty` on the backend) so formatting is fixed before push.

### 3.3 🟡 Coverage artifacts not published
`coverage-html` is generated but discarded.
- **Action:** upload coverage as a CI artifact (or to a coverage service)
  for trend visibility.

---

## 4. Reliability & correctness

### 4.1 🟠 Outbound integration probes have short timeouts but no retry/backoff
`IntegrationTestService` probes use 5–10s timeouts. A transient blip shows a
scary red "error" to the operator.
- **Action:** one retry with short backoff on the reachability probes, and
  distinguish "timeout/transient" from "auth rejected" in the status copy.

### 4.2 🟠 Payment reconciliation depends on the Stripe webhook secret
As the Stripe probe already warns: without `STRIPE_WEBHOOK_SECRET`, bookings
stay `Pending`. The recent "recover orphan payments" work mitigates this.
- **Action:** add a scheduled reconciliation command test and alerting when
  orphaned/pending transactions exceed a threshold.

### 4.3 🟡 Calendly config currently points MBA and consulting at the same URL
Observed in the live admin panel: `mba_calendly_url` and
`consulting_calendly_url` resolve to the same `gm-discovery-call` link, and
discovery is unset. That's a data/config issue, not code — but the UI could
guide it.
- **Action:** surface a soft warning in the CMS when two booking types share
  one Calendly URL.

---

## 5. Frontend / UX robustness

### 5.1 🟠 No app-level error boundaries
There is no `app/error.tsx`, `app/global-error.tsx`, or `app/not-found.tsx`.
An unhandled render error shows the default Next error screen.
- **Action:** add branded `error.tsx` + `not-found.tsx` with a recovery
  action, and a `global-error.tsx` for root failures.

### 5.2 🟡 Currency formatting was centralized but not tested (now fixed)
`formatCurrency` is the single source for money rendering; the GBP symbol
bug slipped through because it was duplicated inline in the admin page and
untested.
- **Done in this PR:** `formatCurrency` unit tests guarding the `£` output.
- **Action (follow-up):** replace any remaining inline currency-symbol
  literals in components with `formatCurrency` so there is one code path.

### 5.3 🟡 Tighten `any` usage and add a few page-level tests
- **Action:** type the 9 `any` sites; add render tests for the admin
  Services and Integrations pages (the two most logic-heavy admin screens).

---

## 6. Performance & scalability

### 6.1 🟡 Confirm list endpoints paginate and eager-load
Admin list endpoints (services, blog, inquiries, transactions) should
paginate and avoid N+1 via `with(...)`.
- **Action:** audit each index controller; add `->with()` where relations
  are serialized, and assert query counts in tests with
  `DB::enableQueryLog` or Larastan's N+1 helpers.

### 6.2 🟡 Cache public settings
`/api/settings` is hit on every public page load and backend-API self-probe.
- **Action:** cache the public settings payload with a tag invalidated on
  CMS save.

---

## 7. Observability

### 7.1 🟠 No error tracking / structured logging wired
There's no Sentry (or equivalent) integration visible.
- **Action:** add error tracking on both tiers, redacting PII, so production
  failures (like the Calendly error) surface proactively instead of being
  spotted in the admin UI.

### 7.2 🟡 Persist integration-test history, not just latest
`integration_test_results` keeps only the latest row per key
(`updateOrCreate`). Trends ("Calendly started failing at 3pm") are lost.
- **Action:** optionally append-only history with a retention window.

---

## Suggested phased roadmap

**Phase 1 — Correctness & safety (this week)**
- 2.1 Move `env()` → `config()` and add `config:cache` to CI (prevents a
  whole class of silent prod failures).
- 3.1 Stop auto-committing to `main`.
- 1.2 / 5.2 Land the new integration + currency tests (this PR).

**Phase 2 — Guardrails (next sprint)**
- 1.1 Coverage floor · 1.3 default `Http::fake` · 1.4 Larastan + no-any
- 5.1 Error boundaries · 7.1 Error tracking

**Phase 3 — Hardening & scale**
- 4.1 retries · 4.2 reconciliation alerting · 6.x perf · 7.2 history

---

### Appendix — how the recent fixes map to this plan
- **Calendly "pass by reference" bug** → §1.2 (missing service tests) +
  §4.1 (probe robustness). Regression test added.
- **GBP `£` rendering bug** → §5.2 (untested, duplicated currency
  formatting). `formatCurrency` tests added.
