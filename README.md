# Bitcoin Deepa - Telegram Mini App

Bitcoin membership reward accrual with subscription management for Sri Lankan users. Runs as a **Telegram Mini App** and as a normal **website / installable PWA**, built with Next.js 16.

The API lives in [BitcoinDeepa-DCA-BE](https://github.com/CeyLabs/BitcoinDeepa-DCA-BE).

![Bitcoin Deepa Logo](./public/BDLogo_White.svg)

## 🚀 Features

- **Telegram Integration**: Native Telegram Mini App experience with SDK integration
- **Bitcoin Wallet**: Track Bitcoin balance and transactions in satoshis
- **Membership Plans**: Weekly and monthly subscription plans with automatic Bitcoin rewards
- **Payment Integration**: PayHere payment gateway for Sri Lankan Rupee transactions
- **KYC Verification**: User verification system for compliance
- **Reward Tracking**: Visual charts showing Bitcoin price history and membership rewards
- **Referral System**: Earn rewards for inviting friends
- **Currency Formatting**: LKR/satoshi amounts formatted for Sri Lankan users

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with hand-built UI primitives (`src/components/ui/`)
- **Database**: MongoDB with Mongoose ODM
- **State Management**:
- Zustand (global state)
- TanStack Query (server state management)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js with react-chartjs-2
- **Telegram SDK**: @telegram-apps/sdk-react
- **HTTP Client**: Custom `fetchy` wrapper for API calls

## 📦 Installation

```bash
git clone https://github.com/CeyLabs/BitcoinDeepaBot-TMA.git
cd BitcoinDeepaBot-TMA
bun install
cp .env.example .env.local   # fill in the values (see comments in the file)
bun dev                      # http://localhost:3347
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for running the backend and signing in with a test bot.

## 🚀 Development Commands

```bash
# Development
bun dev              # Start development server on port 3347
bun start           # Start production server on port 3347

# Build and Quality
bun run build       # Build production bundle
bun run lint        # ESLint code checking
bun run format      # Prettier code formatting

# Git Hooks
bun run init-git-hooks    # Initialize git hooks from .githooks/
```

> **Important**: Run `bun run lint`, `bun run format` and `bun run build` before committing. CI checks all of them.

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/user/         # The only API route left (Mongo-backed user count)
│   ├── context/          # Providers (theme, TanStack Query)
│   ├── dashboard/        # Signed-in app (activity, news, plans, tasks)
│   ├── plans/choose/     # Plan selection / checkout
│   └── verification/     # KYC flow
├── platform/             # Telegram vs browser differences (usePlatform)
├── pwa/                  # Service worker registration, auto-update, install button
├── sw.template.js        # Service worker source (stamped into public/sw.js at build)
├── components/
│   ├── ui/               # Shared UI components
│   └── dashboard/        # Feature components, mirrors app/dashboard
├── db/                   # Mongo connection and schema (/api/user only)
├── hooks/                # useSession, useUser, useAuthGuard, ...
│   └── query/            # TanStack Query hooks, one per endpoint
├── lib/                  # fetchy, auth, query keys, store, types, validations
└── styles/               # Global styles and theme tokens
```

## 🏗 Architecture Patterns

### Platform

- `src/platform/` is the only code that talks to Telegram; components use `usePlatform()` and get a web fallback automatically

### API Layer

- All HTTP requests use `fetchy` from `@/lib/fetchy`, which calls the backend directly and attaches the auth token

### Authentication

- Inside Telegram: signed launch data (`initData`) is exchanged for a token on every launch
- In the browser / PWA: Telegram Login widget; tokens last 7 days
- `useSession()` is the single source of auth state; `useAuthGuard` gates `src/app/dashboard/`

### State Management

- **Global UI State**: Zustand store (`@/lib/store`)
- **Server State**: TanStack Query with keys in `@/lib/query-keys`
- **Form State**: React Hook Form with Zod validation

## 💳 Payment Integration

The app integrates with PayHere payment gateway for Sri Lankan users:

- Subscription plans in Sri Lankan Rupees (LKR)
- Automatic Bitcoin purchase with membership plans
- Real-time Bitcoin price tracking
- Transaction history with detailed analytics

## 🔐 Security Features

- Telegram Web App security validation
- Token-based authentication
- KYC verification system
- Secure payment processing
- Environment variable protection

## 📱 Mobile-First Design

- Optimized for mobile viewing (max-width: 28rem / `max-w-md`)
- Telegram Mini App SDK integration, expanded to full screen on launch
- Bottom navigation for authenticated users

## 🌍 Deployment

Deployed on Railway (see `railway.json`): `bun install --frozen-lockfile && bun run build`, then `bun run start`. Set the variables from `.env.example` in the Railway service; `NEXT_PUBLIC_*` values are baked in at build time.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE) © CeyLabs

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Contact the development team

---

**Built with ❤️ for the Sri Lankan Bitcoin community 🇱🇰**
