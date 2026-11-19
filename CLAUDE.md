# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Telegram Mini App (Next.js 16, App Router) for Bitcoin membership reward accrual with subscription management, built for Sri Lankan users. Users subscribe to weekly/monthly plans (paid via PayHere in LKR), accrue Bitcoin rewards, complete KYC verification, and track their wallet/transaction history — all inside a Telegram WebView.

## Commands

Package manager is **bun** (bun.lockb is committed; npm scripts also work).

```bash
bun dev              # Start dev server on port 3347
bun run build        # Production build
bun start            # Start production server on port 3347
bun run lint         # ESLint
bun run format       # Prettier (writes changes)
bun run init-git-hooks  # Point git at .githooks/ (runs prettier --check on pre-commit)
```

There is no test suite configured. Always run `bun run format` and `bun run build` before committing — the pre-commit hook already enforces prettier formatting.

## Architecture

### API layer

- All client-side HTTP calls MUST go through the `fetchy` wrapper (`src/lib/fetchy.ts`), not raw `fetch`. It sets JSON headers, parses JSON responses, and throws on non-OK responses.
- The browser calls the BitcoinDeepa-DCA-BE backend directly with credentials (its CORS allows this app's origin, `APP_URL` there). `fetchy` prefixes non-`/api/` paths with `NEXT_PUBLIC_API_BASE_URL`, sends the web session cookie (`credentials: "include"`) and adds the Mini App's session token as a Bearer header (don't pass either manually), bypasses the browser HTTP cache (TanStack Query owns caching), and throws `FetchyError` (with `.status`) on non-OK responses.
- The only Next.js API route left is `src/app/api/user/route.ts` (Mongo-backed user count/registration).
- MongoDB connection via `src/db/connect.ts`; the only schema is a loosely-typed `User` model (`src/db/schema.ts`) with an `id`, `username`, and a free-form `data` object — most "shape" lives in TypeScript types (`src/lib/types.ts`), not the Mongoose schema.

### Auth flow

- Server-side sessions on the backend; `src/lib/auth.ts` is the client's view of them (a small store read by `useSession`).
- **Mini App:** `useRegisterUser` exchanges the raw launch `initData` (never `initDataUnsafe`) once at launch: `POST /auth/telegram/miniapp` → a session token kept in memory + `sessionStorage` (never `localStorage` or a URL), sent as Bearer by `fetchy`. The backend accepts initData up to 15 min old; after a 401 it re-exchanges while it can, else `useAuthGuard` asks the user to reopen the app.
- **Web:** "Log In with Telegram" is a full-page redirect to the backend's `/auth/telegram/start?return_to=` (OIDC + PKCE), which returns with its HttpOnly session cookie. Prod: app and API share `bitcoindeepa.com`, so the `SameSite=Lax` cookie is sent. Dev on two sites (vercel.app + railway.app): the backend needs `APP_COOKIE_SAME_SITE=none` (Safari and the iOS Telegram WebView still block that; test web login in Chrome). JS never sees a token; `GET /auth/me` says who's signed in. Failures come back as `/?login_error=<code>` (`loginErrorMessage`). No Telegram login script runs on our pages.
- Each login links the user's bot wallet on the backend (the bot's `/api/v1/init`). Wallet calls (`/p2p/*`, `/sell/orders/:id/pay`) carry no Telegram credential; a `401 relogin_required` opens `ReloginPrompt` (reopen the Mini App / log in again).
- Logout: `POST /auth/logout` (web) and "Log out of all devices" (`/auth/logout-all`) in settings.
- `bitcoin-deepa-is-existing-user` in `localStorage` is only a UX flag (the launch redirect), not a credential. The pre-session token key `bitcoin-deepa-auth-token` is deleted on load.
- `src/hooks/useAuthGuard.ts` is invoked from `src/app/dashboard/layout.tsx` to gate the whole dashboard section — protected pages must live under `src/app/dashboard/`.

### App shell / providers

- `src/app/context/providers.tsx` composes, in order: `PlatformProvider` (`src/platform`, Telegram vs web) → `ThemeProvider` (`theme.tsx`) → TanStack Query `QueryClientProvider` → `ToastProvider` (`src/components/ui/toast.tsx`).
- Light/dark is driven by `<html data-theme>`: an inline script (`src/lib/theme-boot.ts`) sets it before first paint, and `ThemeProvider` keeps it in sync after hydration. The theme tokens and the `dark:` variant hang off it.

### State management

- Server state: TanStack Query. Each endpoint in `src/hooks/query/*` exports a `queryOptions`/`infiniteQueryOptions` factory (e.g. `kycStatusOptions`) plus a hook; keys live in `src/lib/query-keys.ts`. Use the factory for `prefetchQuery`/`invalidateQueries`. The client sets a 60s default `staleTime` (`src/app/context/providers.tsx`).
- No global store. Client state is small `useSyncExternalStore` hooks: `useSession` (the session store in `src/lib/auth.ts`), `useBalanceVisible` (the eye toggle, remembered). Request status comes from TanStack (e.g. the Telegram sign-in is a mutation; `useAuthGuard` reads it with `useMutationState`).
- Forms: plain React state + Zod (`safeParse`), schemas in `src/lib/validations.ts`. No form library.

### Routing / pages (App Router)

- `src/app/dashboard/` — main authenticated app (activity, news, plans, tasks; guarded by `useAuthGuard`).
- Plan picker: `ChoosePlanView` (`src/components/dashboard/plans/`) renders as the Plans tab when there's no active plan, and as the pushed `/dashboard/plans/choose` page (change plan) — both inside the dashboard layout, so the tab bar stays visible. `/plans/choose` only redirects there, for old links.
- `src/app/verification/` (+ `verification/details`) — KYC flow, outside the dashboard guard.
- `src/app/error.tsx` / `src/app/not-found.tsx` — App Router error/404 boundaries.
- Route-level `loading.tsx` files provide skeleton states (e.g. `src/app/dashboard/news/loading.tsx`).

### Components

- `src/components/ui/` — our UI components, shadcn-style (`components.json`, style `base-nova`): variants with `cva()`, class merging with `cn` (the `cn` package — `import { cn } from "cn"`), interactive parts on Base UI (`@base-ui/react`: Dialog → `sheet.tsx`, Toast → `toast.tsx`, Collapsible). Simple ones (`button`, `badge`, `card`, `cell`, `avatar`, …) are plain Tailwind.
- Colors come from semantic tokens in `src/styles/theme.css` (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `text-hint`, `bg-primary`, `border-border`, …), each with light and dark values. Prefer them over raw hex in new code.
- `@telegram-apps/telegram-ui` has been removed — don't reintroduce it.
- `src/components/dashboard/<feature>/` — feature-scoped components mirroring the dashboard route structure (activity, news, plans, tasks, wallet).

### Dependency notes

- Telegram SDK: `@tma.js/sdk` (the renamed successor of `@telegram-apps/sdk`), imported only in `src/platform/` (ESLint enforces it). `setupTelegram()` must run before any SDK feature — most of them throw until `init()` is called.
- `chart.js` is used directly (`PortfolioLine.tsx`, no React wrapper) and loads in its own chunk, only on the wallet chart.

### React 19 conventions

- Pass `ref` as a normal prop (no `forwardRef`); render contexts as `<SomeContext value={...}>` and read them with `use(SomeContext)`.
- Server data goes through TanStack Query (not `use(promise)`, `useActionState` or `useOptimistic`).
- React Compiler was measured and left off (+~7% JS per page for no visible gain here); enable with `reactCompiler: true` + `babel-plugin-react-compiler` if a screen gets re-render heavy.

### Telegram-specific concerns

- Mobile-first: content is constrained to `max-w-md` for a single-column mobile layout.
- Fast launch (`src/lib/launch-redirect.ts`, wired in `src/app/layout.tsx`): returning members skip `/` and go straight to `/dashboard` from a `<head>` script; `web_app_ready` is sent from the end of `<body>` so Telegram reveals the server-rendered skeleton before the JS loads; the backend is preconnected with React 19's `preconnect()`. The launch registration (`/api/user`) runs app-wide in `providers.tsx`.
- `next.config.mjs` forces `Cache-Control: no-store, must-revalidate` on all non-static routes — worked around a Telegram Desktop WebView bug where stale HTML gets cached; don't remove this without understanding that constraint.
- `allowedDevOrigins` in `next.config.mjs` permits `*.sats.day` and `*.ngrok-free.app` tunnels for testing inside the real Telegram client.

### PWA

- The service worker source is `src/sw.template.js`. `scripts/stamp-sw.mjs` (part of `build`, or `bun run stamp-sw`) writes `public/sw.js` with the commit sha, so every deploy ships new worker bytes. Never edit `public/sw.js` — it's generated and gitignored.
- The worker caches only hashed `/_next/static/` assets and `/icons/`, per build. Never cache HTML or API responses (see the `no-store` note above).
- `src/pwa/`: registration and safe auto-update (`register-sw.ts` — reloads after a new worker takes over, deferred on checkout/KYC/payment paths), install prompt state (`install.ts`), a one-time reload on chunk-load errors after a deploy (`chunk-reload.ts`), and `InstallButton` (Chromium prompt / iOS instructions, web only).
- The worker only registers in production builds (`bun run build && bun start` to test locally).

### Deployment

- Vercel (Next.js preset). `bun run build` also stamps the service worker with the commit sha (`VERCEL_GIT_COMMIT_SHA`).
