# Changelog

## [0.2.1] — 2026-06-10 (intra-day patch)

### Changed
- Bumped article-search cache TTL from 15min → 1h to amortize across GDELT's "1 req per 5s" upstream rate limit.

### Known limitation
- GDELT throttles requests from Cloudflare Workers' shared-IP edge POPs aggressively. First-time queries (cold cache) may return a 429 surfaced as `-32603 "GDELT 429: Please limit requests…"`. The cache mitigates this for repeat queries but cold-start hits are user-visible. Mitigation: any subsequent call to the same query returns the cached result instantly; users seeing 429s should retry 5+ seconds later.

## [0.2.0] — 2026-06-10

### Changed
- **Billing migrated to Dodo Payments** (was: planned Stripe). Merchant-of-Record model — Dodo handles VAT/GST/sales-tax remittance worldwide on our behalf, lifting tax compliance off the operator.
- Env vars: `STRIPE_*` → `DODO_API_KEY` / `DODO_WEBHOOK_SECRET`. New `[vars]`: `DODO_PRODUCT_ID_{SOLO,TEAM,PRO}`, `PRODUCT_NAME`, `FROM_EMAIL`.

### Added
- `GET /upgrade?tier=…` — creates a Dodo hosted checkout link, 302s to it.
- `GET /account` — returns the caller's key + tier + Dodo customer-portal link (requires `Authorization: Bearer …`).
- `POST /webhooks/dodo` — verifies Standard-Webhooks signature (HMAC-SHA256 + 5-minute replay window), mints API keys on `subscription.active`, downgrades on cancellation/failure, idempotent on retries.
- `src/dodo.ts`, `src/webhook.ts`, `src/checkout.ts` — vendored shim, identical across all Category-1 products.
- `mintApiKey()`, `updateKeyStatus()`, `getKeyBySubscription()` in `auth.ts`.
- `KeyRecord.status` field — tracks `active` / `cancelled` / `past_due`.
- Optional Resend integration: API key emailed to the customer on subscription start.


## [0.1.0] — 2026-05-26

### Added
- Initial release. Tools: `gdelt_search_events`, `gdelt_trending_actors`, `gdelt_tone_timeseries`, `gdelt_compare`.
- Wraps GDELT 2.0 `doc` API (article search) + `events` and `geo` modes.
- CSV → JSON normalization for GDELT's idiosyncratic outputs.
