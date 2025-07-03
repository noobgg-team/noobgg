# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo using Turborepo with Bun as the package manager. The project consists of:

- **apps/api**: Hono-based REST API with PostgreSQL database via Drizzle ORM
- **apps/web**: Next.js 15 web application with Tailwind CSS, React Query, and Three.js
- **apps/mobile**: React Native Expo application using React Navigation
- **packages/**: Shared packages including UI components and utilities

## Development Commands

### Root Level Commands
```bash
# Start all applications in development
bun run dev

# Build all applications
bun run build

# Run linting across all projects
bun run lint

# Run type checking across all projects
bun run check-types

# Format code
bun run format
```

### API Development (apps/api)
```bash
cd apps/api

# Start development server with hot reload
bun run dev

# Database operations
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Run migrations
bun run db:studio      # Open Drizzle Studio
bun run db:reset       # Drop, generate, and migrate

# Testing
bun run test

# Linting
bun run lint
```

### Web Development (apps/web)
```bash
cd apps/web

# Start development server (runs on port 3001)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Linting
bun run lint
```

### Mobile Development (apps/mobile)
```bash
cd apps/mobile

# Start Expo development server
bun run dev

# Platform-specific development
bun run android
bun run ios
bun run web

# Build for platforms
bun run build:android
bun run build:ios

# Type checking
bun run type-check
```

## Architecture Overview

### API Architecture
- **Framework**: Hono with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Built-in middleware system
- **Internationalization**: Multi-language support via middleware
- **API Documentation**: Swagger UI at `/docs`
- **Key Features**:
  - RESTful API design with versioning support
  - Comprehensive controller and route structure
  - Database schemas for gaming-related entities (games, lobbies, user profiles)
  - Error handling and deprecation middleware

### Web Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **3D Graphics**: Three.js with React Three Fiber
- **Authentication**: NextAuth.js v5
- **Internationalization**: next-intl
- **Key Features**:
  - Interactive 3D globe visualization
  - Gaming lobby finder interface
  - User profiles and social features
  - Admin dashboard for content management

### Mobile Architecture
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: React Query
- **Key Features**:
  - Cross-platform mobile app
  - Native navigation patterns
  - Shared business logic with web app

## Database Schema

The database includes entities for:
- **Games**: Supported games with metadata
- **Lobbies**: Gaming sessions and matchmaking
- **Users**: Profiles, social links, and preferences
- **Events**: Gaming events and tournaments
- **Platforms**: Gaming platforms and distributors
- **Languages**: Internationalization support

## Key Development Notes

### API Development
- Use Drizzle ORM for database operations
- Follow the existing controller/route pattern in `src/controllers/v1/` and `src/routes/v1/`
- API versioning is handled via middleware
- Localization strings are in `src/locales/`
- Database schemas are in `src/db/schemas/`

### Web Development
- Components follow shadcn/ui patterns
- Feature-based organization in `features/` directory
- Custom hooks in `hooks/` directory
- 3D components use React Three Fiber
- Internationalization messages in `messages/` directory

### Mobile Development
- Uses Expo managed workflow
- Cross-platform components in `components/mobile/`
- Navigation setup in React Navigation
- Shared types and utilities with web app

### Testing
- API tests use Bun's built-in test runner
- Test files follow `.test.ts` naming convention
- Manual tests documented in `.manual.test.ts` files

## Environment Requirements

- Node.js >= 18
- Bun 1.2.15+ (primary package manager)
- PostgreSQL database for API
- Required environment variables:
  - `DATABASE_URL`: PostgreSQL connection string