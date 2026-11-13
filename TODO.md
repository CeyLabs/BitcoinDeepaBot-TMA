# TODO

On hold. Goal: remove the frontend's last server dependencies (`api/user` + Mongo, server-rendered news) so the TMA/PWA can be hosted as static files.

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
  - long-lived caching on `/_next/static/*`
- [ ] Move `metadata`/`viewport` from `layout.tsx` into static meta tags if needed
- [ ] Deploy static, retire the Railway Node service, and update the bot's Mini App URL
- [ ] Test in Telegram iOS / Android / Desktop and a browser PWA install
  - no stale pages
  - `sw.js` updates ship

## Later — Replace telegram-ui with our own components

After the PWA work. `@telegram-apps/telegram-ui` is unmaintained (last release 2.1.13, Oct 2025) and only supports React 18, which blocks the React 19 upgrade. It's used in 33 files.

Approach: shadcn conventions (`components.json`, `cn()`, `cva`, semantic tokens) on **Base UI** (`shadcn init -b base`, the shadcn default since July 2026).

Tokens first:

- [ ] Define ~12 semantic tokens in `theme.css`, each with light and dark values: `background`, `surface`, `surface-raised`, `foreground`, `muted-foreground`, `border`, `primary`, `primary-foreground`, `success`, `destructive`, `ring`, `radius`
- [ ] Skip shadcn's `chart-*`, `sidebar-*`, `popover` unless needed
- [ ] Remove unused `tma-*` / `card-*` variables (target: ~15 tokens, down from 41)

Components (one commit per component, replace its usages in the same commit):

- [ ] Write ourselves (styling only): Button (16 files), Card (8), Badge (7), Title (6), Cell (6), Navigation, IconButton, Avatar/AvatarStack, Progress
- [ ] Start from shadcn on Base UI, then restyle: Modal → Dialog/Drawer, Accordion, SegmentedControl → Tabs/ToggleGroup, Snackbar → Toast, Input → Field
- [ ] Replace hardcoded hex colors with tokens in each file as it migrates (516 uses, 53 unique, e.g. `bg-[#e2e8f0] dark:bg-[#1e293b]` → `bg-border`). No bulk replace
- [ ] Move `VisuallyHidden` (the only `radix-ui` usage) to Base UI and drop `radix-ui`

Cleanup:

- [ ] Remove `AppRoot`, the telegram-ui CSS import, the `--tg-theme-*` block in `theme.css`, and the package
- [ ] Update `CLAUDE.md` (component conventions, `cva` now used)
- [ ] Separate step: upgrade to React 19

## Later (optional) — Vite

On hold. Little benefit for users; mainly a nicer dev setup and simpler code. Revisit only if Next keeps getting in the way.

- React Router, `useAuthGuard` as a route guard
- Swap the framework imports:
  - `next/link`, `next/navigation` → router
  - `next/image` → `<img>`
  - `next/font` → CSS import
  - `next/script` + metadata → `index.html`
  - `next/dynamic` → `React.lazy`
- Keep the hand-written `sw.js` and change `/_next/static/` to `/assets/`
