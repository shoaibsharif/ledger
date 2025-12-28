import * as React from 'react'

import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { checkUserExists, getSession } from '../server/functions/auth'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Debt Tracker',
      },
    ],
  }),

  beforeLoad: async ({ location }) => {
    const { exists } = await checkUserExists()
    const session = await getSession()

    const isAuthRoute =
      location.pathname === '/login' || location.pathname === '/register'

    // No user exists yet - redirect to register (unless already there)
    if (!exists && location.pathname !== '/register') {
      throw redirect({ to: '/register' })
    }

    // User exists but not logged in - redirect to login (unless on auth route)
    if (exists && !session && !isAuthRoute) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },

  component: () => (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  ),

  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-ink mb-4">404</h1>
        <p className="text-muted-foreground text-lg">Page not found</p>
      </div>
    </div>
  ),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
