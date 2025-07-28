# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build and deployment (Cloudflare)
npm run build
npm run deploy        # Build and deploy to Cloudflare
npm run preview       # Build and preview locally

# Code quality
npm run lint

# Testing
npm test             # Run unit tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with Vitest UI
npm run test:e2e     # Run E2E tests with Playwright
npm run test:e2e:ui  # Run E2E tests with Playwright UI
npm run test:e2e:debug # Debug E2E tests
npm run test:all     # Run both unit and E2E tests

# Cloudflare specific
npm run cf-typegen   # Generate Cloudflare environment types
```

## Architecture Overview

This is a **file sharing application** built with Next.js 14 App Router, designed for deployment on Cloudflare using OpenNext.js.

### Key Technology Stack
- **Framework**: Next.js 14 with App Router
- **Runtime**: Cloudflare Workers/Pages via @opennextjs/cloudflare
- **Database**: SQLite with Drizzle ORM
- **Internationalization**: next-intl (English/Japanese)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Testing**: Vitest (unit/integration) + Playwright (E2E)

### Project Structure
```
app/[locale]/          # Internationalized app router pages
├── layout.tsx         # Root layout with i18n provider
└── page.tsx          # Main landing page

components/            # React components
├── ui/               # Shadcn/ui base components
├── language-switcher.tsx
└── theme-toggle.tsx

db/
└── schema.ts         # Drizzle database schema (files table)

i18n-intl/            # Internationalization setup
├── i18n.ts          # next-intl configuration
└── languages/       # Translation files (en.json, ja.json)

test/                 # Unit/integration tests (mirrors app structure)
e2e/                  # Playwright E2E tests
```

### Database Schema
The application uses Drizzle ORM with a simple `files` table containing:
- `id` (UUID primary key)
- `name`, `path`, `size`, `type`
- `createdAt`, `updatedAt` timestamps

### Internationalization
- Supports English (`en`) and Japanese (`ja`) locales
- Default locale: Japanese (`ja`)
- All routes are prefixed with locale: `/en/...` or `/ja/...`
- Middleware handles locale detection and routing

### Cloudflare Integration
- Uses `@opennextjs/cloudflare` for deployment
- Development integration via `initOpenNextCloudflareForDev()`
- R2 incremental cache available but commented out
- Wrangler for Cloudflare tooling and type generation

### Testing Configuration
- **Unit Tests**: Vitest with jsdom, 95% coverage thresholds
- **E2E Tests**: Playwright across multiple browsers and devices
- Test files mirror the app structure in `test/` directory
- Coverage excludes config files, middleware, and build artifacts

### Component Architecture
- Uses Shadcn/ui design system with Radix UI primitives
- Tailwind CSS for styling with CSS custom properties
- Components follow atomic design principles
- Theme toggle and language switcher in fixed positions

This codebase follows modern Next.js 14 patterns with proper TypeScript configuration, comprehensive testing setup, and Cloudflare-optimized deployment strategy.