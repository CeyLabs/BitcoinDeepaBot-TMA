# Bitcoin Deepa - Telegram Mini App

A Telegram Mini App built with Next.js 14 that supports Bitcoin membership reward accrual with subscription management for Sri Lankan users.

![Bitcoin Deepa Logo](./public/BDLogo_White.svg)

## 🚀 Features

-   **Telegram Integration**: Native Telegram Mini App experience with SDK integration
-   **Bitcoin Wallet**: Track Bitcoin balance and transactions in satoshis
-   **Membership Plans**: Weekly and monthly subscription plans with automatic Bitcoin rewards
-   **Payment Integration**: PayHere payment gateway for Sri Lankan Rupee transactions
-   **KYC Verification**: User verification system for compliance
-   **Reward Tracking**: Visual charts showing Bitcoin price history and membership rewards
-   **Referral System**: Earn rewards for inviting friends
-   **Multi-language Support**: English and Sinhala (Sri Lankan) currency formatting

## 🛠 Tech Stack

-   **Framework**: Next.js 14 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + ShadCN UI components
-   **Database**: MongoDB with Mongoose ODM
-   **State Management**:
    -   Zustand (global state)
    -   TanStack Query (server state management)
-   **Forms**: React Hook Form + Zod validation
-   **Charts**: Chart.js with react-chartjs-2
-   **Telegram SDK**: @telegram-apps/sdk-react
-   **HTTP Client**: Custom `fetchy` wrapper for API calls
-   **Animations**: Framer Motion

## 📦 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-repo/BitcoinDeepa-TMA-Bot.git
    cd BitcoinDeepa-TMA-Bot
    ```

2. **Install dependencies**

    ```bash
    bun install
    # or
    npm install
    ```

3. **Environment Setup**
   Create a `.env.local` file with your environment variables:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    API_BASE_URL=http://localhost:3000

    ```

4. **Run the development server**

    ```bash
    bun dev
    # or
    npm run dev
    ```

5. **Open in browser**
   Navigate to `http://localhost:3347`

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

> **Important**: Always run `bun run format` and `bun run build` before committing changes.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── subscription/  # Subscription management
│   │   ├── transaction/   # Transaction handling
│   │   └── user/          # User management & KYC
│   ├── dashboard/         # Main app dashboard
│   │   ├── history/       # Transaction history
│   │   ├── invite/        # Referral system
│   │   └── subscription/  # Membership plans
│   ├── onboard/          # User onboarding
│   └── payment/          # Payment success/cancel pages
├── components/           # Reusable components
│   ├── ui/              # ShadCN UI primitives
│   ├── dashboard/       # Dashboard-specific components
│   └── skeletons/       # Loading state components
├── db/                  # Database connection and schema
├── lib/                 # Utility libraries
│   ├── auth.ts          # Authentication helpers
│   ├── fetchy.ts        # HTTP client wrapper
│   ├── store.ts         # Zustand global state
│   ├── types.ts         # TypeScript definitions
│   └── validations.ts   # Zod schemas
└── styles/             # Global styles and themes
```

## 🏗 Architecture Patterns

### API Layer

-   All HTTP requests use `fetchy` from `@/lib/fetchy`
-   RESTful API routes in `src/app/api/`
-   MongoDB connection via `src/db/connect.ts`

### Authentication

-   Telegram-based authentication using `@/lib/auth`
-   JWT tokens stored in localStorage
-   Dashboard layout checks auth and redirects to `/onboard` if unauthorized

### State Management

-   **Global UI State**: Zustand store (`@/lib/store`)
-   **Server State**: TanStack Query with keys in `@/lib/query-keys`
-   **Form State**: React Hook Form with Zod validation

### Database Models

-   **User**: Profile with subscription, wallet, and rewards data
-   **Subscription**: Weekly/monthly membership plans
-   **Transaction**: Bitcoin transactions with multiple types
-   **Wallet**: Bitcoin balance with USD/LKR tracking

## 💳 Payment Integration

The app integrates with PayHere payment gateway for Sri Lankan users:

-   Subscription plans in Sri Lankan Rupees (LKR)
-   Automatic Bitcoin purchase with membership plans
-   Real-time Bitcoin price tracking
-   Transaction history with detailed analytics

## 🔐 Security Features

-   Telegram Web App security validation
-   JWT-based authentication
-   KYC verification system
-   Secure payment processing
-   Environment variable protection

## 📱 Mobile-First Design

-   Optimized for mobile viewing (max-width: 28rem)
-   Telegram Mini App SDK integration
-   Custom header color (#202020)
-   Bottom navigation for authenticated users
-   Full-screen expansion support

## 🌍 Deployment

The app is configured for deployment on Railway:

```json
{
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "npm start",
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the coding standards
4. **Run quality checks**: `bun run format && bun run build`
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Commit Message Format

-   `feat:` for new features
-   `fix:` for bug fixes
-   `docs:` for documentation changes
-   `style:` for formatting changes
-   `refactor:` for code refactoring
-   `test:` for adding tests
-   `chore:` for maintenance tasks

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions:

-   Create an issue in this repository
-   Contact the development team

---

**Built with ❤️ for the Sri Lankan Bitcoin community 🇱🇰**
