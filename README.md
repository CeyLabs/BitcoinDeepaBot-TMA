<!-- markdownlint-disable-next-line MD041 -->
<br>

<a href="https://app.bitcoindeepa.com"><picture><source media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/brand-dark.svg"><img
  alt="Bitcoin Deepa Mini App" width="300"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/brand.svg"></picture></a>

<p>The Bitcoin Deepa Telegram Mini App: stack sats on a weekly or monthly plan, paid in rupees.<br><strong>Live in
Telegram as <a href="https://t.me/BitcoinDeepaBot">@BitcoinDeepaBot</a> and at
<a href="https://app.bitcoindeepa.com">app.bitcoindeepa.com</a></strong>, open source and MIT licensed.</p>

<p>
<a href="https://bitcoindeepa.com"><picture><source media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-website-dark.svg"><img
  alt="Website" height="34"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-website.svg"></picture></a>
<a href="https://t.me/BitcoinDeepa"><picture><source media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-telegram-dark.svg"><img
  alt="Telegram" height="34"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-telegram.svg"></picture></a>
<a href="https://x.com/bitcoindeepa"><picture><source media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-x-dark.svg"><img
  alt="Follow on X" height="34"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-x.svg"></picture></a>
<a href="https://github.com/bitcoindeepa/app-frontend/blob/main/LICENSE"><picture><source media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-license-mit-dark.svg"><img
  alt="License: MIT" height="34"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-license-mit.svg"></picture></a>
<a href="https://github.com/bitcoindeepa/.github/blob/main/CONTRIBUTING.md"><picture><source
  media="(prefers-color-scheme: dark)"
  srcset="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-contribute-dark.svg"><img
  alt="Contribute" height="34"
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/pill-contribute.svg"></picture></a>
</p>

<br>

The same Next.js app runs inside Telegram as a Mini App and in any browser as an installable PWA. Payments go
through PayHere in LKR. Everything else (accounts, plans, wallet, KYC) lives in
[app-backend](https://github.com/bitcoindeepa/app-backend), which this app calls directly.

## What's in it

- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-wallet.svg">
  **Wallet** (`/dashboard`):
  your total in LKR, sats or USD, a portfolio chart, your plan at a glance, your average buy price and the latest
  news. Balances can be hidden.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-plans.svg">
  **Plans** (`/dashboard/plans`):
  pick a weekly or monthly plan, pay through PayHere, and cancel any time. Gift plans are marked coming soon.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-trade.svg">
  **Buy and sell**
  (`/dashboard/buy`, `/dashboard/sell`): a one-time buy paid with PayHere, or sell sats at a locked rate with the
  rupees (less the bank charge) sent to your verified bank account.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-send.svg">
  **Send** (`/dashboard/send`):
  send sats to another Bitcoin Deepa user by @username or Telegram ID.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-activity.svg">
  **Activity**
  (`/dashboard/activity`): transactions, plan payments and task rewards, with search and filters.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-news.svg">
  **News** (`/dashboard/news`):
  Bitcoin Magazine's feed, read inside the app.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-identity.svg">
  **Verification**
  (`/verification`): KYC with your NIC, passport or driving licence and a selfie. Needed to buy plans and sell sats.
- <img width="20" height="20" alt=""
  src="https://raw.githubusercontent.com/bitcoindeepa/app-frontend/main/.github/assets/readme/icon-profile.svg">
  **Profile and settings**
  (`/dashboard/profile`): avatar, username, personal details, payout bank account, light or dark theme, and
  log out of all devices.

## Run it

You need [Bun](https://bun.sh) 1.4 or newer (CI uses 1.4.4) and a running
[app-backend](https://github.com/bitcoindeepa/app-backend).

```bash
git clone https://github.com/bitcoindeepa/app-frontend.git
cd app-frontend
bun install
cp .env.example .env.local   # point it at your backend
bun run init-git-hooks       # prettier check on commit
bun dev                      # http://localhost:3347
```

- **Inside Telegram:** make a test bot with [@BotFather](https://t.me/BotFather) and set its Mini App URL to an
  HTTPS tunnel to your dev server. `*.ngrok-free.app` and `*.sats.day` are already allowed in `next.config.mjs`.
- **In the browser:** "Log In with Telegram" redirects to the backend, which sets the session cookie. Across two
  sites in dev, the backend needs `APP_COOKIE_SAME_SITE=none`, and Safari still blocks it, so test in Chrome.
- **Before a PR:** `bun run lint`, `bunx tsc --noEmit`, `bunx prettier --check .` and `bun run build`. CI runs
  all four. There is no test suite.
- **Never put a secret in a `NEXT_PUBLIC_` variable.** Those are baked into the browser bundle at build time.

<details>
<summary><strong>Environment variables</strong></summary>

<br>

| Variable                            | What it does                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`          | Base URL of app-backend; the backend's `APP_URL` must be this app's origin             |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Bot that hosts the Mini App, for t.me links and invites; defaults to `BitcoinDeepaBot` |
| `NEXT_PUBLIC_GA_ID`                 | Google Analytics measurement ID; leave empty to turn analytics off                     |
| `MONGODB_URI`                       | Server-only. MongoDB for `/api/user`, the user count on the landing page               |
| `VERCEL_GIT_COMMIT_SHA` and friends | Set by the host. Stamps the service worker with the commit; falls back to a timestamp  |

The build checks `RAILWAY_GIT_COMMIT_SHA`, `GITHUB_SHA`, `VERCEL_GIT_COMMIT_SHA`, `CF_PAGES_COMMIT_SHA` and
`SOURCE_COMMIT`, in that order.

</details>

## What it's made of

[Next.js 16](https://nextjs.org) on the App Router with [React 19](https://react.dev),
[TypeScript](https://www.typescriptlang.org) and [Tailwind CSS 4](https://tailwindcss.com). Server state with
[TanStack Query](https://tanstack.com/query), forms checked with [Zod](https://zod.dev), interactive parts from
[Base UI](https://base-ui.com), charts from [Chart.js](https://www.chartjs.org) and Telegram through
[@tma.js/sdk](https://docs.telegram-mini-apps.com). Built and run with [Bun](https://bun.sh).

```text
src/
├── app/         # Routes: dashboard/*, verification, payment
├── components/  # ui/ primitives, dashboard/<feature>/
├── platform/    # The only code that talks to Telegram
├── pwa/         # Service worker, auto-update, install
├── hooks/       # useSession, useAuthGuard, query/ hooks
├── lib/         # fetchy, auth, query keys, types
├── db/          # Mongo, used only by /api/user
└── styles/      # Theme tokens, light and dark
```

## How it works

- **One app, two platforms.** `src/platform/` hides the Telegram vs browser differences behind `usePlatform()`,
  with a web fallback for every Telegram feature. ESLint blocks `@tma.js/*` imports anywhere else.
- **Sign-in.** Inside Telegram, the signed launch data is exchanged with the backend for a session token, kept
  in memory and `sessionStorage`. In the browser, Telegram login runs on the backend and returns an HttpOnly
  cookie. `useSession()` is the one source of auth state, and `useAuthGuard` protects `src/app/dashboard/`.
- **API calls.** Everything goes through `fetchy` (`src/lib/fetchy.ts`), which talks to the backend directly and
  attaches the session. TanStack Query owns caching; `/api/user` is the only Next API route.
- **Payments.** Plans and one-time buys redirect to PayHere and come back to `/payment/success` or
  `/payment/cancel`.
- **PWA.** The service worker is built from `src/sw.template.js` into `public/sw.js` (don't edit that one). It
  caches only hashed static assets and icons, never HTML, API calls or user data.
- **Mobile first.** A single `max-w-md` column with bottom navigation (Wallet, Activity, Plans, News), expanded
  to full screen inside Telegram.

<details>
<summary><strong>Deployment</strong></summary>

<br>

Deployed on Vercel (Next.js preset, `bun run build`). Set the variables from `.env.example` in the Vercel project;
`NEXT_PUBLIC_*` values are baked in at build time. Any Node host works too:

```bash
bun install --frozen-lockfile
bun run build
bun run start                # port 3347
```

`next.config.mjs` sends `Cache-Control: no-store` on every non-static route, because Telegram Desktop caches
stale HTML. It also limits framing to `*.telegram.org` so the app works in Telegram Web.

</details>

## Help out

Fix a bug, polish a screen or bring the copy into Sinhala. Read this repo's [CONTRIBUTING.md][CONTRIBUTING.md]
and the [contributing guide](https://github.com/bitcoindeepa/.github/blob/main/CONTRIBUTING.md), then open an issue
or say hello on [Telegram](https://t.me/BitcoinDeepa). Branch from `dev` and target `dev`; `main` is the release
branch. Security problems go through the
[security policy](https://github.com/bitcoindeepa/.github/blob/main/SECURITY.md), not a public issue.

## Licence

[MIT][LICENSE] for the code in this repository: use it, change it, build on it.

The Bitcoin Deepa name, "Pearl of Satoshi", the Yaka mask, the දීප glyph and the logos (including the logo and app
icon files in `public/`) are trademarks of CeylonCash and not part of the licence. See
[TRADEMARK](https://github.com/bitcoindeepa/.github/blob/main/TRADEMARK.md) and the
[brand guidelines](https://bitcoindeepa.com/brand).

<br>

<p><sub>A CeylonCash community initiative · Colombo, Sri Lanka 🇱🇰 ·
<a href="mailto:hello@bitcoindeepa.com">hello@bitcoindeepa.com</a></sub></p>

[CONTRIBUTING.md]: https://github.com/bitcoindeepa/app-frontend/blob/main/CONTRIBUTING.md
[LICENSE]: https://github.com/bitcoindeepa/app-frontend/blob/main/LICENSE
