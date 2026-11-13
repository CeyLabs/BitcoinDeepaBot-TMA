# Contributing to Bitcoin Deepa

Thanks for helping! This repo is the frontend: a Next.js app that runs as a **Telegram Mini App** and as a normal **website / installable PWA**. The API lives in [BitcoinDeepa-DCA-BE](https://github.com/CeyLabs/BitcoinDeepa-DCA-BE).

## Setup

Prerequisites: [Bun](https://bun.sh) 1.4+ (CI uses 1.4.4) and a running backend.

```bash
git clone https://github.com/CeyLabs/BitcoinDeepaBot-TMA.git
cd BitcoinDeepaBot-TMA
bun install
cp .env.example .env.local   # then fill it in, see the comments in the file
bun run init-git-hooks       # prettier check on commit
bun dev                      # http://localhost:3347
```

- **Backend:** run [BitcoinDeepa-DCA-BE](https://github.com/CeyLabs/BitcoinDeepa-DCA-BE) locally and point `NEXT_PUBLIC_API_BASE_URL` at it.
- **Signing in:** both sign-in paths go through Telegram, so you need your own test bot from [@BotFather](https://t.me/BotFather):
  - **Browser:** set up the bot's Login Widget, put its client ID in `NEXT_PUBLIC_TELEGRAM_CLIENT_ID`, and allow your domain.
  - **Inside Telegram:** set the bot's Mini App URL to an HTTPS tunnel to your dev server. `*.ngrok-free.app` and `*.sats.day` are already allowed in `next.config.mjs`.
- `MONGODB_URI` is only needed for the landing page's user count (`/api/user`).

## Before you open a PR

CI runs these on every PR. Run them locally first:

```bash
bun run lint
bunx tsc --noEmit
bunx prettier --check .   # or: bun run format
bun run build
```

## Where things go

| Path                                  | What                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/platform/`                       | **The only place that talks to Telegram.** Use `usePlatform()`, `haptic` and `useBackButton` from `@/platform`. |
| `src/pwa/`                            | Service worker registration, auto-update and the install button                                                 |
| `src/sw.template.js`                  | Service worker source. `public/sw.js` is generated at build time; don't edit it                                 |
| `src/hooks/useSession.ts`             | Auth state (`status`, `user`, `logout`). Don't read the token from storage directly                             |
| `src/hooks/query/`                    | One TanStack Query hook per backend endpoint, keys in `src/lib/query-keys.ts`                                   |
| `src/lib/fetchy.ts`                   | All HTTP calls go through `fetchy`, never raw `fetch`                                                           |
| `src/app/dashboard/`                  | Signed-in pages (guarded by `useAuthGuard`)                                                                     |
| `src/components/ui/`                  | Shared UI components                                                                                            |
| `src/components/dashboard/<feature>/` | Feature components, mirroring the dashboard routes                                                              |

Rules worth knowing:

- **Don't import `@telegram-apps/sdk*` or use `window.Telegram` outside `src/platform/`.** ESLint enforces this. If you need a new Telegram capability, add it to the `Platform` interface with a web fallback.
- **Every feature must work in the browser too.** Check both `kind === "telegram"` and `kind === "web"` paths.
- **Never cache user data in the service worker.** It only caches hashed static assets.
- `NEXT_PUBLIC_*` env vars end up in the browser bundle. Never put secrets in them.
- UI components are moving from `@telegram-apps/telegram-ui` to our own (see `TODO.md`). Prefer our components and theme tokens for new UI.

## Commits and PRs

- Branch from `dev` and target `dev` with your PR. `main` is the release branch.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`, …
- Keep PRs focused. Add screenshots for UI changes, ideally in both Telegram and a browser, light and dark.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
