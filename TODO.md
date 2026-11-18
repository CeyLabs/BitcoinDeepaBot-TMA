# TODO

Phases 1–2 are on hold. Their goal: remove the frontend's last server dependencies (`api/user` + Mongo, server-rendered news) so the TMA/PWA can be hosted as static files.

## Now — Web/PWA follow-ups

Done on `rr/web-pwa-support`: the platform layer, auth (`useSession`, token expiry, 401 handling), browser fallbacks, PWA (stamped service worker, auto-update, install button, safe areas), security headers, and open-source setup (MIT, `.env.example`, CI, CONTRIBUTING).

Before deploying (tested 2026-11-13 against the dev backend):

- [ ] Set `NEXT_PUBLIC_GA_ID` on Vercel (analytics is off when unset)
- [x] `bun run build` passes (`/api/user` dynamic)
- Inside Telegram (bot @ceylabs_tma_bot, via a CeyPort tunnel):
  - [x] Android (Galaxy S24):
    - silent login, returning user → wallet, dark theme on open
    - bottom nav, native back button (news, verification, details)
    - community link stays in Telegram
    - story task shown, KYC start → details form
    - no install/logout icons
  - [x] Web (web.telegram.org): loads in the iframe (`frame-ancestors`), day/night switch applies live, 401 → silent re-login (`/auth/telegram` 201, no login screen)
  - [ ] iOS
  - [ ] Desktop (macOS)
  - [ ] Cancel-plan popup (needs a KYC-approved test account)
  - [ ] **Story sharing is broken in production too:** `ceyloncash.com/bitcoindeepa/tma/story.mp4` redirects to `ceylon.cash`, which serves HTML, so Telegram ignores the share. Host the video (e.g. `public/story.mp4`) and update the URL
- Browser / PWA (production build in Chrome):
  - [x] Expired token → login (no API call); backend 401 → token cleared → login; logout
  - [x] Back buttons on all 4 screens, `t.me` links in a new tab, story task hidden
  - [x] Light/dark (live), desktop frame, offline page + retry
  - [x] Service worker update: exactly one reload, old caches deleted, no reload on `/plans/choose` until leaving
  - [x] iOS Safari (simulated user agent): install sheet, KYC start allowed on mobile
  - [ ] Real phone browser + installed PWA: Android install prompt, iOS safe areas/standalone
  - [ ] Real Telegram login (OIDC) in a browser
  - [ ] PayHere return flow in standalone mode

Remaining:

- [ ] Manifest: phone screenshots (richer install dialog) and a monochrome icon
- [ ] iOS splash images (`apple-touch-startup-image`), or accept the plain launch screen
- [ ] "Link copied" feedback when `platform.share()` falls back to the clipboard (when the referral card launches)
- [ ] Issue/PR templates and `good first issue` labels before the event
- [ ] Vitest with a few tests (`fetchy` 401 handling, platform layer)
- [ ] Dev mock login: needs a dev-only backend endpoint, decide later
- [ ] Later: httpOnly cookie session instead of the localStorage token (backend change)
- [ ] Investigate: the bottom nav prefetches each dashboard route 2–5 times (different `_rsc` keys) within a couple of seconds of loading
- [ ] After testing: point @ceylabs_tma_bot's Mini App URL back from the tunnel

## Phase 1 — Move Mongo user data into the backend

Mongo `users` collection: `{ id, username, data: { authdata, launchparam } }`. Used by `src/app/page.tsx` for the landing user count (`useUserCount`) and the returning-user check (409 from `useRegisterTelegramUser`).

Notes:

- The data is unverified. `POST /api/user` has no auth.
- `id` has no unique index, so there may be duplicates. Keep the earliest one.
- The ObjectId `_id` holds the creation time, so use it for `first_seen_at`.

Backend (`BitcoinDeepa-DCA-BE`):

- [ ] Knex migration: new table `telegram_launch_user`
  - `telegram_id` text PK, `username`, `start_param`, `platform`, `raw` jsonb, `first_seen_at` timestamptz, `source` (`mongo_import` | `auth`)
- [ ] `/auth/telegram` + `/auth/telegram-oidc`: after verification, `INSERT ... ON CONFLICT DO NOTHING` and return `isNewUser`
- [ ] `GET /user/count` from the new table, so the number continues from the current Mongo count
- [ ] Add auth to `GET /user/exists/:telegramId` or remove it (open user enumeration)
- [ ] Set `CORS_ORIGIN` to the real domains. It currently falls back to `*`

Migration:

- [ ] `mongodump` backup. Keep Mongo read-only and don't delete anything
- [ ] One-off import script (idempotent, `ON CONFLICT DO NOTHING`). Test on a scratch DB first
- [ ] Run on prod. Row count should equal the number of distinct Mongo ids
- [ ] Re-run after the frontend cutover to catch the gap
- [ ] Decommission Mongo after a few weeks (needs explicit approval)

Frontend:

- [ ] Landing: use `isNewUser` from auth and `/user/count`, and keep the cached returning-user flag
- [ ] Remove `src/app/api/user`, `src/db`, `mongoose`, and the `/api/` branch in `fetchy`

Decide first:

- [ ] Keep the full `raw` launch params (includes signed initData) or only the extracted fields?
- [ ] Is `start_param` used for referrals or campaigns? If yes, index it
- [ ] Which user count to show?

## Phase 1b — Move news to the backend

- [ ] Backend `GET /news` (+ `/news/:id`): move the fetch/parse/sanitise code from `src/lib/news.ts`, cache it in Redis for 15 min, and keep the last good result if a fetch fails
- [ ] Frontend: make the news pages client-rendered with TanStack Query (`staleTime` 15 min), and have the article page read from the cached list first
- [ ] Remove `rss-parser`, `sanitize-html`, `unstable_cache`, and `experimental.staleTimes`

## Phase 2 — Next.js static export

- [ ] `output: "export"`, `images.unoptimized: true`
- [ ] Change `news/[id]` to `news?id=...` (dynamic routes can't be exported)
- [ ] Move the `next.config.mjs` headers to the static host (e.g. a `_headers` file)
  - `no-store` on HTML
  - `no-cache` + CSP on `/sw.js`
  - the security headers from `next.config.mjs` (`nosniff`, referrer policy, `frame-ancestors`)
  - long-lived caching on `/_next/static/*`
- [ ] Move `metadata`/`viewport` from `layout.tsx` into static meta tags if needed
- [ ] Deploy static, retire the Railway Node service, and update the bot's Mini App URL
  - Make sure the host's build exposes a commit sha (see `scripts/stamp-sw.mjs`); otherwise the service worker is stamped with a timestamp
- [ ] Test in Telegram iOS / Android / Desktop and a browser PWA install
  - no stale pages
  - `sw.js` updates ship

## Replace telegram-ui with our own components

Done on `rr/base-ui-components` (based on `rr/web-pwa-support`). `@telegram-apps/telegram-ui` was unmaintained (last release Oct 2025) and React 18 only.

- [x] shadcn conventions (`components.json`, style `base-nova`), `cn` package instead of clsx + tailwind-merge, `@base-ui/react`
- [x] Semantic tokens in `theme.css` (light + dark); legacy `tma-*`, `card-*`, `--tg-theme-*` variables removed
- [x] Simple components: Button, IconButton, Badge (incl. gain/loss/active/success variants), Card, Title, Cell + CellChevron, Avatar/AvatarStack, Progress
- [x] Interactive: Snackbar → toast (`useToast`), Modal → Sheet (Dialog), Input → TextField, Accordion → Collapsible, SegmentedControl → nav with sliding pill
- [x] Removed `AppRoot`, the telegram-ui CSS, the package, `radix-ui`; `!important` / `--tgui--` overrides gone
- [x] Docs: `CLAUDE.md`, `CONTRIBUTING.md`

Follow-ups:

- [ ] Visual check in Telegram (Android/Web) and a browser, light + dark — not done yet. Known intentional changes: app font (Inter) on buttons/titles instead of system-ui; no tap ripple; the sheet can't be swiped down (close button / backdrop instead)
- [ ] Replace remaining hardcoded hex colors with tokens as files are touched (only exact matches were converted). No bulk replace
- [ ] React 19: blocked by `@telegram-apps/sdk-react@1` (React 17/18 only). Needs the SDK v3 migration (contained in `src/platform/`), then React 19

## Later (optional) — Vite

On hold. Little benefit for users; mainly a nicer dev setup and simpler code. Revisit only if Next keeps getting in the way.

- React Router, `useAuthGuard` as a route guard
- Swap the framework imports:
  - `next/link`, `next/navigation` → router
  - `next/image` → `<img>`
  - `next/font` → CSS import
  - `next/script` + metadata → `index.html`
  - `next/dynamic` → `React.lazy`
- Keep `src/sw.template.js` + the stamp script and change `/_next/static/` to `/assets/`
