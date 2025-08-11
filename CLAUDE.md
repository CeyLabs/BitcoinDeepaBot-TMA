# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**

```bash
npm run dev          # Starts Next.js dev server on port 3347
npm start           # Starts production server on port 3347
```

**Build and quality checks:**

```bash
npm run build       # Build production bundle
npm run lint        # ESLint code checking
npm run format      # Prettier code formatting
```

**Git hooks:**

```bash
npm run init-git-hooks    # Initialize git hooks from .githooks/
```

Always run `npm run format` and `npm run build` before committing changes.

## Project Architecture

This is a **Telegram Mini App (TMA)** built with Next.js 14 that provides Bitcoin DCA (Dollar Cost Averaging) services with subscription management.

### Tech Stack

-   **Framework:** Next.js 14 with App Router
-   **Styling:** Tailwind CSS + ShadCN UI components
-   **Database:** MongoDB with Mongoose ODM
-   **State Management:** Zustand (global) + TanStack Query (server state)
-   **Forms:** React Hook Form + Zod validation
-   **Telegram Integration:** @telegram-apps/sdk-react
-   **HTTP Client:** Custom `fetchy` wrapper (required for all API calls)

### Core Architecture Patterns

**API Layer:**

-   All HTTP requests MUST use `fetchy` from `@/lib/fetchy`
-   API routes follow REST conventions in `src/app/api/`
-   MongoDB connection handled via `src/db/connect.ts`

**Authentication Flow:**

-   Telegram-based auth using `@/lib/auth`
-   Auth token stored in localStorage
-   Dashboard layout checks authentication and redirects to `/onboard` if unauthorized

**State Management:**

-   Global UI state: Zustand store (`@/lib/store`)
-   Server state: TanStack Query with query keys in `@/lib/query-keys`
-   Form state: React Hook Form with Zod schemas from `@/lib/validations`

**Component Organization:**

-   Page components in `src/app/` (App Router)
-   Reusable components in `src/components/`
-   UI primitives in `src/components/ui/` (ShadCN)
-   Dashboard-specific components in `src/components/dashboard/`

### Key Domain Models

**Core Types** (see `src/lib/types.ts`):

-   `User`: User profile with subscription, wallet, and rewards
-   `Subscription`: Weekly/monthly Bitcoin DCA plans
-   `Transaction`: Financial transactions with multiple types
-   `Wallet`: Bitcoin wallet with USD balance tracking
-   `UserRewards`: Referral and story sharing earnings

**Database Schema** (see `src/db/schema.ts`):

-   Simple MongoDB User model with flexible `data` object

### Mobile-First Design

-   Max width container (max-w-md) for mobile optimization
-   Telegram Mini App SDK integration for native app feel
-   Bottom navigation for registered users only
-   Custom header color (#202020) and full-screen expansion

### Development Guidelines

-   Use `bun` package manager (preferred over npm)
-   Dynamic imports for code splitting
-   Server-side rendering where possible
-   Conventional commit messages (feat:, fix:, docs:, etc.)
-   Always create feature branches and submit PRs to main branch
