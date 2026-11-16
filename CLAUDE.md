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
- The browser calls the BitcoinDeepa-DCA-BE backend directly (CORS is enabled there). `fetchy` prefixes non-`/api/` paths with `NEXT_PUBLIC_API_BASE_URL`, attaches the stored auth token as a Bearer header on those requests (don't pass it manually), bypasses the browser HTTP cache (TanStack Query owns caching), and throws `FetchyError` (with `.status`) on non-OK responses.
- The only Next.js API route left is `src/app/api/user/route.ts` (Mongo-backed user count/registration).
- MongoDB connection via `src/db/connect.ts`; the only schema is a loosely-typed `User` model (`src/db/schema.ts`) with an `id`, `username`, and a free-form `data` object — most "shape" lives in TypeScript types (`src/lib/types.ts`), not the Mongoose schema.

### Auth flow

- Telegram-based auth: `initData` from the Telegram WebView is exchanged for a token via the backend's `POST /auth/telegram`, handled by `authenticateWithTelegram` in `src/lib/auth.ts` (browser login uses `authenticateWithTelegramOidc`).
- Token and registration flag are persisted in `localStorage` under `bitcoin-deepa-auth-token` / `bitcoin-deepa-is-existing-user` (see the `*FromStorage` helpers in `src/lib/auth.ts`).
- `src/hooks/useAuthGuard.ts` is invoked from `src/app/dashboard/layout.tsx` to gate the whole dashboard section — protected pages must live under `src/app/dashboard/`.

### App shell / providers

- `src/app/context/providers.tsx` composes, in order: `PlatformProvider` (`src/platform`, Telegram vs web) → `ThemeProvider` (`theme.tsx`, dynamic/no-SSR) → TanStack Query `QueryClientProvider` → `ToastProvider` (`src/components/ui/toast.tsx`).
- `ThemeProvider` is loaded with `next/dynamic({ ssr: false })` because it depends on browser APIs. It wraps the app in a `.light`/`.dark` element that the theme tokens hang off.

### State management

- Global UI state: Zustand (`src/lib/store.ts`).
- Server state: TanStack Query, with query keys centralized in `src/lib/query-keys.ts` and query hooks under `src/hooks/query/*` (one hook per endpoint, e.g. `useSubscriptionCurrent`, `useWalletSummary`, `useKyc`).
- Forms: React Hook Form + Zod, schemas in `src/lib/validations.ts`.

### Routing / pages (App Router)

- `src/app/dashboard/` — main authenticated app (activity, news, plans, tasks; guarded by `useAuthGuard`).
- `src/app/plans/choose/` and `src/app/verification/` (+ `verification/details`) — onboarding/plan-selection and KYC flows, outside the dashboard guard.
- `src/app/error.tsx` / `src/app/not-found.tsx` — App Router error/404 boundaries.
- Route-level `loading.tsx` files provide skeleton states (e.g. `src/app/dashboard/news/loading.tsx`).

### Components

- `src/components/ui/` — our UI components, shadcn-style (`components.json`, style `base-nova`): variants with `cva()`, class merging with `cn` (the `cn` package — `import { cn } from "cn"`), interactive parts on Base UI (`@base-ui/react`: Dialog → `sheet.tsx`, Toast → `toast.tsx`, Collapsible). Simple ones (`button`, `badge`, `card`, `cell`, `avatar`, …) are plain Tailwind.
- Colors come from semantic tokens in `src/styles/theme.css` (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `text-hint`, `bg-primary`, `border-border`, …), each with light and dark values. Prefer them over raw hex in new code.
- `@telegram-apps/telegram-ui` has been removed — don't reintroduce it.
- `src/components/dashboard/<feature>/` — feature-scoped components mirroring the dashboard route structure (activity, news, plans, tasks, wallet).

### Dependency notes

- `framer-motion` is only used by `src/components/motion/number-ticker.tsx`.
- `@telegram-apps/sdk-react@1` only supports React 17/18 — it's what blocks a React 19 upgrade (see `TODO.md`).
- `sharp` is only used by the build-time script `scripts/optimize-emoji-svgs.mjs`, not by the app at runtime.

### Telegram-specific concerns

- Mobile-first: content is constrained to `max-w-md` for a single-column mobile layout.
- `next.config.mjs` forces `Cache-Control: no-store, must-revalidate` on all non-static routes — worked around a Telegram Desktop WebView bug where stale HTML gets cached; don't remove this without understanding that constraint.
- `allowedDevOrigins` in `next.config.mjs` permits `*.sats.day` and `*.ngrok-free.app` tunnels for testing inside the real Telegram client.

### PWA

- The service worker source is `src/sw.template.js`. `scripts/stamp-sw.mjs` (part of `build`, or `bun run stamp-sw`) writes `public/sw.js` with the commit sha, so every deploy ships new worker bytes. Never edit `public/sw.js` — it's generated and gitignored.
- The worker caches only hashed `/_next/static/` assets and `/icons/`, per build. Never cache HTML or API responses (see the `no-store` note above).
- `src/pwa/`: registration and safe auto-update (`register-sw.ts` — reloads after a new worker takes over, deferred on checkout/KYC/payment paths), install prompt state (`install.ts`), a one-time reload on chunk-load errors after a deploy (`chunk-reload.ts`), and `InstallButton` (Chromium prompt / iOS instructions, web only).
- The worker only registers in production builds (`bun run build && bun start` to test locally).

### Deployment

- Railway (`railway.json`), Nixpacks builder, `bun install && bun run build` at build time, `bun run start` as the start command, restart-on-failure.
