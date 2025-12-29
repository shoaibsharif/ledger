import * as React from 'react'

import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { Logo } from '../components/ui/logo'
import { checkUserExists, getSession, logout } from '../server/functions/auth'
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
        title: 'LEDGER · Debt Tracker',
      },
    ],
    links: [
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/logo.svg',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/logo192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        href: '/logo512.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '192x192',
        href: '/logo192.png',
      },
    ],
  }),

  beforeLoad: async ({ location }) => {
    const { exists } = await checkUserExists()
    const session = await getSession()

    const isAuthRoute =
      location.pathname === '/login' || location.pathname === '/register'

    if (!exists && location.pathname !== '/register') {
      throw redirect({ to: '/register' })
    }

    if (exists && !session && !isAuthRoute) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },

  component: () => (
    <div className="min-h-screen bg-paper flex flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  ),

  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center">
        <h1 className="text-9xl font-black font-display tracking-tighter text-ink">
          404
        </h1>
        <p className="text-lg mt-4 font-mono text-muted-foreground">
          PAGE NOT FOUND
        </p>
      </div>
    </div>
  ),

  shellComponent: RootDocument,
})


// ... inside Nav component ...
// ... existing imports ...

// ... inside Nav component ...
function Nav() {
  const router = useRouter()
  const location = router.state.location.pathname
  const isAuthPage = location === '/login' || location === '/register'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isAuthPage) return null

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/debts', label: 'Entries' },
    { to: '/people', label: 'Contacts' },
  ]

  return (
    <>
      <header className="heavy-border-b border-ink bg-paper sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a
                href="/"
                className="flex items-center gap-3 hover:opacity-70 transition-opacity group"
              >
                <Logo className="w-8 h-8" />
                <span className="text-2xl font-black font-display tracking-tighter">
                  LEDGER
                </span>
              </a>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    active={location === link.to}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/debts/new"
                className="hidden md:inline-flex items-center justify-center h-10 px-6 font-bold uppercase tracking-widest text-xs heavy-border bg-ink text-paper hover:bg-ink/90 transition-colors"
              >
                + New Entry
              </a>
              <div className="hidden md:block">
                <LogoutButton />
              </div>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-ink/5"
              >
                <HugeiconsIcon icon={Menu01Icon} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-100 bg-paper flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 flex justify-between items-center border-b-3 border-ink">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-2xl font-black font-display tracking-tighter">
                LEDGER
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-ink/5"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-4xl font-black font-display uppercase tracking-tighter ${location === link.to ? 'text-crimson' : 'text-ink'
                    }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <a
                href="/debts/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-14 flex items-center justify-center font-bold uppercase tracking-widest text-sm heavy-border bg-ink text-paper hover:bg-ink/90 transition-colors"
              >
                + New Entry
              </a>
              <div className="py-4 border-t-2 border-ink/10 flex justify-between items-center">
                <span className="font-mono text-xs uppercase opacity-60">Session</span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function NavLink({
  to,
  active,
  children,
  onClick,
}: {
  to: string
  active: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <a
      href={to}
      onClick={onClick}
      className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all ${active
        ? 'bg-ink text-paper'
        : 'opacity-60 hover:opacity-100 hover:bg-ink/10'
        }`}
    >
      {children}
    </a>
  )
}

function LogoutButton() {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await logout()
        router.invalidate()
        await router.navigate({ to: '/login' })
      }}
      className="font-mono text-xs uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-crimson transition-colors"
    >
      Logout
    </button>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-paper text-ink">
      <head>
        <HeadContent />
        <link rel="stylesheet" href={appCss} />
      </head>
      <body className="min-h-screen">
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
