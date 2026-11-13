# Pre-`main` test checklist

Ticked items were verified on 2026-11-13 with the #97 build against the dev backend (Chrome + Telegram Web + Telegram Android). See `TODO.md` for the details.

Changes in `dev` not yet on `main`:

- #94: browser calls the backend directly; the Next.js proxy routes are removed.
- #96: `fetchy` adds the auth token itself and handles errors and empty responses.

Test these on a staging/preview build pointed at the real backend, inside the Telegram client and in a normal browser.

## 0. Setup (before building)

- [ ] `NEXT_PUBLIC_API_BASE_URL` is set on the host (Railway, plus Vercel if it's used). The old `API_BASE_URL` is no longer read.
  - It's baked in at **build** time, so set it first and redeploy afterwards.
- [ ] The backend's `CORS_ORIGIN` is either `*` or includes the TMA's exact origin (scheme + host, no trailing slash).
- [ ] Vercel builds on `dev` have been failing since `71c9ff9` (before these PRs). Find out why, or confirm Vercel isn't the real deploy target.

## 1. Network sanity (DevTools → Network)

- [x] App requests go to `NEXT_PUBLIC_API_BASE_URL/...`, not to `/api/...`. The exception is `/api/user`, which is still served by Next.js.
- [x] No CORS errors in the console. Preflight `OPTIONS` requests return 2xx.
- [x] Authenticated requests carry `Authorization: Bearer <token>`.
- [ ] `/package` and `/api/user` work while logged out.

## 2. Auth

- [x] **Telegram Mini App:** open from the bot. A token is saved (`bitcoin-deepa-auth-token` in localStorage) and the dashboard loads.
- [ ] **Browser (OIDC):** "Log in with Telegram" works and lands on the dashboard.
- [x] **Bad/expired token:** edit the token in localStorage. An expired token goes straight to login; a rejected one gets 401, the token is cleared, and the user goes to login (browser) or is silently signed in again (Telegram). Changed in #97.
- [ ] **Backend unreachable:** login fails cleanly. There is no "development mode" fake token any more.

## 3. Dashboard data

- [ ] **Wallet summary** (`/transaction/dca-summary`) shows correct totals.
- [ ] **DCA transaction history** (`/transaction/list`):
  - [ ] Pagination / "load more" works.
  - [ ] A user with **no transactions** sees the empty state, not an error.
- [ ] **Bot (sats) history** (`/transaction/bot-history`):
  - [ ] Paginates correctly.
  - [ ] A user with no bot transactions sees the empty state.
- [ ] **User count** on the landing page still loads (`/api/user`, Mongo).

## 4. Subscription

- [ ] **Current plan** (`/subscription/current`):
  - [x] An active subscriber sees their plan.
  - [x] A user with **no subscription** sees the "no plan" state (tested with a mocked 404). The backend returns 404 here, which should be handled.
- [ ] **Plans list** (`/package`) shows weekly and monthly plans.
- [ ] **Subscribe, KYC approved:** redirects to PayHere checkout (`/subscription/payhere-link`).
- [ ] **Subscribe, KYC not approved:** redirects to `/verification`. The backend's `KycVerifiedGuard` returns 403 here.
- [ ] **PayHere return:** the success and cancel pages show correctly afterwards.
- [ ] **Cancel plan** (`/subscription/cancel`):
  - [ ] The confirm popup appears.
  - [ ] The plan is cancelled and the plan screen refreshes.

## 5. KYC / profile

- [ ] **KYC status** (`/user/kyc/status`) is correct for each state: not started, in progress, approved, declined.
- [ ] **Start verification** (`/user/kyc/initiate`) returns a URL and opens the KYC flow.
  - This is a POST with a JSON body. It would fail if `Content-Type` were missing.
- [ ] **Profile update** (`POST /user`) saves the form, and the changes persist after reload.

## 6. Error handling

- [ ] A 4xx/5xx from the backend shows the backend's error message. NestJS validation errors (array messages) are joined into one readable message.
- [ ] Nothing shows stale data after an action (e.g. cancel → plan updates right away). TanStack Query handles caching; the browser cache is bypassed.

## 7. Platforms

- [ ] Telegram iOS
- [x] Telegram Android
- [ ] Telegram Desktop
- [x] Telegram Web (web.telegram.org)
- [ ] Mobile browser (OIDC login)
- [ ] Desktop browser (OIDC login)

## Sign-off

- [ ] All of the above pass. Then merge `dev` → `main`.
- [ ] After merging, update `NEXT_PUBLIC_API_BASE_URL` on the production host too (if not already done) and watch the first production deploy.
