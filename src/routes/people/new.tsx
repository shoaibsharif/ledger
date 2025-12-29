import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPerson } from '@/server/functions/people'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/people/new')({
  component: AddPerson,
})

function AddPerson() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      await createPerson({ data: value })
      router.invalidate()
      await router.navigate({ to: '/people' })
    },
  })

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="max-w-xl mx-auto">
        <Link
          to="/people"
          className="font-mono text-xs opacity-60 hover:opacity-100 mb-6 inline-block"
        >
          ← BACK
        </Link>

        <div className="heavy-border bg-paper">
          <div className="heavy-border-b border-ink bg-ink p-4">
            <h1 className="font-mono text-sm font-bold text-paper uppercase tracking-widest">
              New Contact
            </h1>
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
                  Name *
                </Label>
                <form.Field
                  name="name"
                  validators={{
                    onChange: z.string().min(1, 'Name is required'),
                  }}
                  children={(field) => (
                    <>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                        placeholder="John Doe"
                      />
                      {field.state.meta.errors ? (
                        <em className="text-crimson text-xs font-mono">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      ) : null}
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="john@example.com"
                      />
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                    Phone
                  </Label>
                  <form.Field
                    name="phone"
                    children={(field) => (
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                        placeholder="+1 555-1234"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Notes
                </Label>
                <form.Field
                  name="notes"
                  children={(field) => (
                    <Textarea
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-0 border-b-2 border-ink bg-transparent rounded-none font-mono resize-none h-24 focus:ring-0"
                      placeholder="How you met, relationship context..."
                    />
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Link
                  to="/people"
                  className="font-mono text-xs uppercase px-4 py-3 hover:bg-ink/10"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  disabled={form.state.isSubmitting}
                  className="heavy-border font-bold uppercase text-xs bg-ink text-paper hover:bg-ink/90"
                >
                  {form.state.isSubmitting ? 'Saving...' : 'Create Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
