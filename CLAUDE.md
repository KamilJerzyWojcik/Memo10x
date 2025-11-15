# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MemoWords is a web application for managing and learning vocabulary. Users can browse word lists with translations, add new words through a dialog form (English word input with GPT-generated translations), and track their personal word collections. The app requires user registration and authentication, with each user maintaining their own word list.

## Technology Stack

**Backend:**
- ASP.NET Core 9.0 (.NET 9.0)
- Entity Framework Core (code-first migrations)
- Supabase for authentication and PostgreSQL database

**Frontend:**
- Angular 20
- SCSS for styling
- Standalone components architecture (no NgModules)

**Database:**
- Supabase PostgreSQL

## Repository Structure

```
./MemoWords/              # Backend solution directory
./MemoWords/MemoWords.Api/  # Main API project with controllers
./MemoWordsFrontend/      # Angular frontend application
./MemoWordsFrontend/src/app/  # Angular components
```

## Common Development Commands

### Frontend (Angular)

Navigate to `MemoWordsFrontend/` directory for all frontend commands:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4200)
ng serve

# Build for production
ng build

# Build and watch for changes
ng build --watch --configuration development

# Run unit tests with Karma
ng test

# Generate new component
ng generate component component-name

# Generate other schematics (directives, pipes, etc.)
ng generate --help
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

### Authentication Flow

**Important:** The application uses Supabase as the single source of truth for authentication and user identity.

- **Frontend**: Communicates directly with Supabase Auth for login/registration
- **Frontend**: Stores and manages Supabase session tokens (JWT)
- **Frontend**: Includes JWT in all backend requests via `Authorization: Bearer <token>` header
- **Backend**: Validates incoming JWTs using Supabase JWK (JSON Web Key Set) endpoint
- **Backend**: Reads `User.Claims` from validated JWT tokens
- **Backend**: Does NOT store or process passwords locally
- **Backend**: All protected endpoints require authorization via `RequireAuthorization()`

### Backend Patterns

- **Repository Pattern**: Abstract data access logic using repository and unit of work patterns
- **MediatR**: Use mediator pattern for decoupling request handling
- **Eager Loading**: Use `Include()` to prevent N+1 query problems
- **Query Optimization**: Apply `AsNoTracking()` for read-only queries
- **Migrations**: Use EF Core code-first migrations for all database schema changes
- **FluentValidation**: Validate all data exchanged with the backend

### Frontend Patterns (Angular 20)

- **Standalone Components**: Use standalone components, directives, and pipes (no NgModules)
- **Signals**: Implement signals for state management instead of traditional RxJS approaches
- **Dependency Injection**: Use the new `inject()` function instead of constructor injection
- **Control Flow**: Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, etc.
- **Guards/Resolvers**: Use functional guards and resolvers instead of class-based ones
- **Lazy Loading**: Implement proper lazy loading with `loadComponent` and `loadChildren`
- **Change Detection**: Use OnPush change detection strategy for performance
- **Deferrable Views**: Leverage deferrable views for improved loading states

## Code Style and Conventions

### General Guidelines

- **Error Handling**: Handle errors and edge cases at the beginning of functions
- **Early Returns**: Use early returns for error conditions to avoid nested if statements
- **Guard Clauses**: Handle preconditions and invalid states early
- **Happy Path Last**: Place the happy path at the end of functions for readability
- **Avoid Else**: Use if-return pattern instead of unnecessary else statements
- **Error Logging**: Implement proper error logging with user-friendly messages
- **Linters**: Use feedback from linters when making changes

### Angular Specific

- **TypeScript Decorators**: Use explicit visibility modifiers (public, private, protected)
- **Angular CLI**: Leverage Angular CLI for schematics and code generation
- **Component Styling**: SCSS is configured as the default style format

### .NET Specific

- **Minimal APIs**: Use for simple endpoints in .NET 6+ to reduce boilerplate
- **Dependency Injection**: Use scoped lifetime for request-specific services, singleton for stateless
- **Exception Handling**: Use ExceptionFilter or middleware for consistent error responses
- **Response Caching**: Apply cache profiles and ETags for high-traffic endpoints

### SCSS Styling

- Use ThemeProvider for consistent theming
- Use `&` character for nesting selectors
- Leverage keyframes helper for animations
- Implement conditional styling within template literals
