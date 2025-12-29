# AGENTS.md - AI Agent Guidelines for Expense Tracker

This document provides essential context for AI coding agents working on this codebase.

## Tech Stack

- **Runtime**: Cloudflare Workers with D1 (SQLite)
- **Frontend**: React 19, TanStack Router/Start, TanStack Form
- **Database**: Drizzle ORM with SQLite
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Build**: Vite 7

## Build/Lint/Test Commands

```bash
# Development
bun run dev              # Start dev server on port 3000

# Build
bun run build            # Production build

# Linting and Formatting
bun run lint             # Run ESLint
bun run format           # Run Prettier
bun run check            # Auto-fix: prettier --write . && eslint --fix

# Testing
bun run test             # Run all tests (vitest run)
bun run test <pattern>   # Run specific test file (e.g., bun run test auth)

# Database
bun run db:push:local    # Apply migrations locally
bun run db:push:remote   # Apply migrations to production
bun run typegen          # Generate Cloudflare Workers types
```

## Code Style Guidelines

### Formatting (Prettier)

- No semicolons
- Single quotes
- Trailing commas everywhere
- Run `bun run check` before committing

### TypeScript

- Strict mode enabled
- No unused locals or parameters
- Target: ES2022
- Path alias: `@/*` maps to `./src/*`

### Import Order

1. React imports (`import * as React from 'react'`)
2. UI components (`@/components/ui/*`)
3. Feature components (`@/components/*`)
4. Utilities (`@/lib/*`)
5. Server functions (`@/server/functions/*`)
6. External libraries (tanstack, drizzle, zod, etc.)

```typescript
// Example
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddPaymentModal } from '@/components/AddPaymentModal'
import { formatCurrency } from '@/lib/currencies'
import { getDebt } from '@/server/functions/debts'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
```

### Naming Conventions

| Type             | Convention      | Example                               |
| ---------------- | --------------- | ------------------------------------- |
| Components       | PascalCase      | `AddPaymentModal`                     |
| Component files  | PascalCase.tsx  | `AddPaymentModal.tsx`                 |
| Route files      | lowercase/kebab | `index.tsx`, `$debtId.tsx`, `new.tsx` |
| Utility files    | kebab-case.ts   | `currencies.ts`                       |
| Functions        | camelCase       | `formatCurrency`, `getDebts`          |
| Server functions | camelCase       | `createDebt`, `recordPayment`         |
| Variables        | camelCase       | `totalPaid`, `remainingAmount`        |
| DB tables (JS)   | camelCase       | `debts`, `payments`                   |
| DB columns (JS)  | camelCase       | `personId`, `createdAt`               |
| DB columns (SQL) | snake_case      | `person_id`, `created_at`             |

### File Structure

```
src/
  components/
    ui/           # Reusable UI primitives (Shadcn-style)
    *.tsx         # Feature components
  lib/            # Utility functions
  routes/         # TanStack Router file-based routes
    __root.tsx    # Root layout
    index.tsx     # Home page
    [feature]/    # Feature routes
      index.tsx   # List view
      $paramId.tsx # Detail view
      new.tsx     # Create view
  server/
    db/           # Database schema and connection
    functions/    # Server functions (RPC endpoints)
    auth.ts       # Auth utilities
```

## Framework Patterns

### TanStack Router Routes

```typescript
export const Route = createFileRoute('/debts/$debtId')({
  loader: async ({ params: { debtId } }) => {
    return { debt: await getDebt({ data: { id: debtId } }) }
  },
  component: DebtDetails,
})

function DebtDetails() {
  const { debt } = Route.useLoaderData()
  // ...
}
```

### Server Functions

```typescript
export const createDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        personId: z.string(),
        amount: z.number(),
        // ...
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    // ... database operations
    return { id }
  })
```

### Auth Check Pattern

All server functions requiring auth should use the `authCheck` helper:

```typescript
async function authCheck() {
  const d1 = env.DB
  const token = getCookie('session_token')
  if (!token) throw new Error('Unauthorized')
  const session = await validateSession(d1, token)
  if (!session) throw new Error('Unauthorized')
  return { d1, session }
}
```

### TanStack Form

```typescript
const form = useForm({
  defaultValues: { email: '', password: '' },
  onSubmit: async ({ value }) => {
    await serverFn({ data: value })
  },
})

<form.Field
  name="email"
  validators={{ onChange: z.string().email() }}
  children={(field) => (
    <Input
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

### Drizzle ORM Queries

```typescript
const db = getDb(d1)

// Find many with relations
await db.query.debts.findMany({
  where: (debts, { eq }) => eq(debts.personId, id),
  with: { person: true, payments: true },
  orderBy: (debts, { desc }) => [desc(debts.createdAt)],
})

// Insert
await db.insert(debts).values({ id, ...data })

// Update
await db
  .update(debts)
  .set({ ...data })
  .where(eq(debts.id, id))
```

## Error Handling

- Throw errors in server functions: `throw new Error('Unauthorized')`
- Use try-catch in form submissions with user-friendly messages
- Provide fallback values for formatting functions

```typescript
// Server function
if (!debt) throw new Error('Debt not found')

// Form submission
try {
  await login({ data: value })
} catch (err) {
  setError('Invalid email or password')
}
```

## UI Components

- Uses Shadcn-style components in `@/components/ui/`
- Use `cn()` utility for conditional classes: `cn('base-class', condition && 'conditional-class')`
- Icons from `@hugeicons/react`
- Dark theme with zinc color palette

## Important Notes

1. **No barrel exports**: Import directly from files, never create `index.ts` with `export * from`
2. **Path aliases**: Always use `@/` for src imports
3. **File storage**: Use S3 filesystem for file storage
4. **No AI attribution**: Do not add AI-generated comments or attribution
