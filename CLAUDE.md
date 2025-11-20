# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MemoWords is a web application for managing and learning vocabulary. Users can browse word lists with translations, add new words through a form (English word input with GPT-generated translations), and track their personal word collections. The app requires user registration and authentication, with each user maintaining their own word list.

## Technology Stack

**Frontend:**
- React 19
- TypeScript
- Vite (build tool)
- TailwindCSS 4 (alpha)
- shadcn/ui components (Radix UI primitives)
- React Router v6

**Backend:**
- ASP.NET Core 9.0 (.NET 9.0)
- Entity Framework Core
- Supabase for authentication and PostgreSQL database

**Database:**
- Supabase PostgreSQL

## Repository Structure

```
./memo-words/              # Frontend React application (this directory)
./memo-words/src/          # Source code
./memo-words/src/components/  # React components
./memo-words/src/components/ui/  # shadcn/ui components
./memo-words/src/components/layout/  # Layout components (AppShell, PageHeader, etc.)
./memo-words/src/pages/    # Page components (CardsPage, LoginPage, etc.)
./memo-words/src/services/ # API service layer
./memo-words/src/types/    # TypeScript type definitions
./memo-words/src/utils/    # Utility functions
./memo-words/src/hooks/    # Custom React hooks
./memo-words/src/styles/   # Global styles

./MemoWords/              # Backend solution directory
./MemoWords/MemoWords.Api/  # Main API project with controllers
```

## Common Development Commands

### Frontend (React + Vite)

All commands run from the `memo-words/` directory:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Backend (.NET)

Navigate to `MemoWords/` directory for backend commands:

```bash
# Restore NuGet packages
dotnet restore

# Build the solution
dotnet build

# Run the API (from MemoWords.Api directory)
dotnet run --project MemoWords.Api

# Run in watch mode (auto-reload on changes)
dotnet watch --project MemoWords.Api

# Create new EF Core migration
dotnet ef migrations add MigrationName --project MemoWords.Api

# Apply migrations to database
dotnet ef database update --project MemoWords.Api
```

## Architecture Patterns

### Frontend Architecture

**Component Organization:**
- **Pages**: Top-level route components (`CardsPage`, `LoginPage`, etc.)
- **Layout Components**: Reusable layout wrappers (`AppShell`, `PageHeader`, `ListPageLayout`, `FormPageLayout`, `DetailPageLayout`)
- **UI Components**: shadcn/ui components in `components/ui/`
- **Feature Components**: Domain-specific components (`CardForm`, `CardListItem`, etc.)

**State Management:**
- React 19 with hooks (`useState`, `useEffect`)
- URL-based state for pagination (via `useSearchParams`)
- Local state for forms and UI interactions

**API Layer:**
- Centralized `apiClient` in `services/apiClient.ts` handles all HTTP requests
- Automatic JWT token injection from localStorage
- Automatic 401 redirects to login page
- Service modules (`cardsApi.ts`, `aiApi.ts`) for domain-specific API calls

**Routing:**
- React Router v6 with `createBrowserRouter`
- Nested routes with `AppShell` wrapper for authenticated pages
- Route definitions in `router.tsx`

**Styling:**
- TailwindCSS 4 (alpha) with CSS variables for theming
- shadcn/ui components with "new-york" style
- Custom design system with gradient backgrounds and glassmorphism effects
- Path alias `@/` maps to `src/`

### Authentication Flow

**Important:** The application uses Supabase as the single source of truth for authentication.

- **Frontend**: Communicates directly with Supabase Auth for login/registration
- **Frontend**: Stores JWT in localStorage (`sb-access-token` or `access_token`)
- **Frontend**: `apiClient` automatically includes `Authorization: Bearer <token>` header
- **Frontend**: Redirects to `/login?returnUrl=...` on 401 responses
- **Backend**: Validates incoming JWTs using Supabase JWK endpoint
- **Backend**: Reads `User.Claims` from validated JWT tokens
- **Backend**: All protected endpoints require authorization via `RequireAuthorization()`

### Backend Patterns

- **Repository Pattern**: Abstract data access logic using repository and unit of work patterns
- **MediatR**: Use mediator pattern for decoupling request handling
- **Eager Loading**: Use `Include()` to prevent N+1 query problems
- **Query Optimization**: Apply `AsNoTracking()` for read-only queries
- **Migrations**: Use EF Core code-first migrations for all database schema changes
- **FluentValidation**: Validate all data exchanged with the backend

## Code Style and Conventions

### General Guidelines

- **Error Handling**: Handle errors and edge cases at the beginning of functions
- **Early Returns**: Use early returns for error conditions to avoid nested if statements
- **Guard Clauses**: Handle preconditions and invalid states early
- **Happy Path Last**: Place the happy path at the end of functions for readability
- **Avoid Else**: Use if-return pattern instead of unnecessary else statements
- **Error Logging**: Implement proper error logging with user-friendly messages
- **Linters**: Use feedback from linters when making changes

### React/TypeScript Specific

- **TypeScript**: Use explicit types for all function parameters and return values
- **Components**: Use functional components with TypeScript interfaces for props
- **Hooks**: Use built-in React hooks; custom hooks in `hooks/` directory
- **API Calls**: Always use service layer (`services/`) rather than direct fetch calls
- **Error Handling**: Use try-catch blocks and display errors via toast notifications

### .NET Specific

- **Minimal APIs**: Use for simple endpoints in .NET 6+ to reduce boilerplate
- **Dependency Injection**: Use scoped lifetime for request-specific services, singleton for stateless
- **Exception Handling**: Use ExceptionFilter or middleware for consistent error responses
- **Response Caching**: Apply cache profiles and ETags for high-traffic endpoints

## Environment Variables

**Frontend** (`.env` in `memo-words/`):
```
VITE_API_BASE_URL=https://localhost:7048
```

**Backend**: Configure Supabase connection strings and JWT validation settings in `appsettings.json`