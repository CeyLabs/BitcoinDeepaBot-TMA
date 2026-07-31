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

-   All client-side HTTP calls MUST go through the `fetchy` wrapper (`src/lib/fetchy.ts`), not raw `fetch`. It sets JSON headers, parses JSON responses, and throws on non-OK responses.
-   API routes live in `src/app/api/**/route.ts` (auth, packages, subscription, transaction, user/kyc).
-   MongoDB connection via `src/db/connect.ts`; the only schema is a loosely-typed `User` model (`src/db/schema.ts`) with an `id`, `username`, and a free-form `data` object — most "shape" lives in TypeScript types (`src/lib/types.ts`), not the Mongoose schema.

### Auth flow

-   Telegram-based auth: `initData` from the Telegram WebView is exchanged for a token via `POST /api/auth/telegram`, handled by helpers in `src/lib/auth.ts` (`authenticateWithTelegram`, `registerUser`, `completeAuthFlow`).
-   Token and registration flag are persisted in `localStorage` under `bitcoin-deepa-auth-token` / `bitcoin-deepa-is-existing-user` (see the `*FromStorage` helpers in `src/lib/auth.ts`).
-   `src/hooks/useAuthGuard.ts` is invoked from `src/app/dashboard/layout.tsx` to gate the whole dashboard section — protected pages must live under `src/app/dashboard/`.

### App shell / providers

-   `src/app/context/providers.tsx` composes, in order: Telegram SDK `SDKProvider` → TMA setup (`tma.tsx`, dynamic/no-SSR) → `ThemeProvider` (`theme.tsx`, dynamic/no-SSR) → TanStack Query `QueryClientProvider` → a `ThemedAppRoot` that syncs telegram-ui's `AppRoot` appearance with the app's own theme context.
-   TMA/theme providers are loaded with `next/dynamic({ ssr: false })` because they depend on browser/Telegram WebView APIs.

### State management

-   Global UI state: Zustand (`src/lib/store.ts`).
-   Server state: TanStack Query, with query keys centralized in `src/lib/query-keys.ts` and query hooks under `src/hooks/query/*` (one hook per endpoint, e.g. `useSubscriptionCurrent`, `useWalletSummary`, `useKyc`).
-   Forms: React Hook Form + Zod, schemas in `src/lib/validations.ts`.

### Routing / pages (App Router)

-   `src/app/dashboard/` — main authenticated app (activity, news, plans, tasks; guarded by `useAuthGuard`).
-   `src/app/plans/choose/` and `src/app/verification/` (+ `verification/details`) — onboarding/plan-selection and KYC flows, outside the dashboard guard.
-   `src/app/error.tsx` / `src/app/not-found.tsx` — App Router error/404 boundaries.
-   Route-level `loading.tsx` files provide skeleton states (e.g. `src/app/dashboard/news/loading.tsx`).

### Components

-   `src/components/ui/` — hand-built UI primitives (`plan-card.tsx`, `toggle-plan.tsx`, etc.), styled directly with Tailwind. None use `cva()` or Radix; there's no component registry to regenerate from.
-   `src/components/dashboard/<feature>/` — feature-scoped components mirroring the dashboard route structure (activity, news, plans, tasks, wallet).

### Dependency notes

-   `radix-ui` is used in exactly one place — `VisuallyHidden` in `src/app/verification/page.tsx`.
-   `class-variance-authority` and `framer-motion` are listed in `package.json` but not imported anywhere in `src/` — don't assume `cva()` or motion-based animation is available just because the package is installed.
-   `sharp` is only used by the build-time script `scripts/optimize-emoji-svgs.mjs`, not by the app at runtime.

### Telegram-specific concerns

-   Mobile-first: content is constrained to `max-w-md` for a single-column mobile layout.
-   `next.config.mjs` forces `Cache-Control: no-store, must-revalidate` on all non-static routes — worked around a Telegram Desktop WebView bug where stale HTML gets cached; don't remove this without understanding that constraint.
-   `allowedDevOrigins` in `next.config.mjs` permits `*.sats.day` and `*.ngrok-free.app` tunnels for testing inside the real Telegram client.

### Deployment

-   Railway (`railway.json`), Nixpacks builder, `bun install && bun run build` at build time, `bun run start` as the start command, restart-on-failure.
