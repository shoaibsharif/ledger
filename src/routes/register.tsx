import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingIcon } from '@/components/ui/loading'
import { checkUserExists, register } from '@/server/functions/auth'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const { exists } = await checkUserExists()
    if (exists) {
      throw redirect({ to: '/login' })
    }
  },
  component: Register,
})

function Register() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null)

        if (value.password !== value.confirmPassword) {
          setError('Passwords do not match')
          return
        }

        await register({
          data: { email: value.email, password: value.password },
        })
        router.invalidate()
        await router.navigate({ to: '/' })
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Registration failed')
        }
      }
    },
  })

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black font-display tracking-tighter">
            LEDGER
          </h1>
          <p className="font-mono text-sm opacity-60 mt-2">
            DEBT TRACKING SYSTEM
          </p>
        </div>

        <div className="heavy-border bg-paper">
          <div className="heavy-border-b border-ink bg-ink p-4">
            <h2 className="font-mono text-sm font-bold text-paper uppercase tracking-widest">
              Initialize
            </h2>
          </div>
          <div className="p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Email
                </Label>
                <form.Field
                  name="email"
                  children={(field) => (
                    <Input
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                      placeholder="you@example.com"
                    />
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Password
                </Label>
                <form.Field
                  name="password"
                  children={(field) => (
                    <Input
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                      placeholder="At least 8 characters"
                    />
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Confirm Password
                </Label>
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <Input
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                    />
                  )}
                />
              </div>
              {error && (
                <div className="p-3 bg-crimson/10 border border-crimson text-crimson font-mono text-sm">
                  {error}
                </div>
              )}
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 font-bold uppercase tracking-widest text-sm heavy-border bg-ink text-paper hover:bg-ink/90"
                  >
                    <span className="inline-grid size-4 place-items-center">
                      {isSubmitting && <LoadingIcon />}
                    </span>
                    <span>Create Account</span>
                    <span className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-xs opacity-60">
            Already have an account?{' '}
            <a href="/login" className="underline hover:no-underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
