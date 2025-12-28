import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import appCss from '../styles.css?url'

import { Outlet, redirect } from '@tanstack/react-router'
import * as React from 'react'
import { checkUserExists, getSession } from '../server/functions/auth'

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
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
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

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: '__root.tsx:RootDocument',
        message: 'RootDocument rendered/mounted',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'F',
      }),
    }).catch(() => {})
  })
  // #endregion
  return (
    <html lang="en">
      <head>
        <HeadContent />
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
