import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { createDebt } from '@/server/functions/debts'
import { createPerson, getPeople } from '@/server/functions/people'
import { ArrowLeft02Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/debts/new')({
  validateSearch: (search) =>
    z
      .object({
        personId: z.string().optional(),
      })
      .parse(search),
  loader: async () => {
    return { people: await getPeople() }
  },
  component: AddDebt,
})

function AddDebt() {
  const { people } = Route.useLoaderData()
  const router = useRouter()

  const [isCreatingPerson, setIsCreatingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [isSubmittingPerson, setIsSubmittingPerson] = useState(false)

  const form = useForm({
    defaultValues: {
      personId: '',
      amount: undefined as unknown as number,
      currency: 'USD',
      description: '',
      type: 'owed_to_me' as 'owed_to_me' | 'i_owe',
      dueDate: '',
    },
    onSubmit: async ({ value }) => {
      await createDebt({
        data: {
          ...value,
          amount: Number(value.amount),
          dueDate: value.dueDate ? new Date(value.dueDate) : undefined,
        },
      })
      router.invalidate()
      await router.navigate({ to: '/' })
    },
  })

  const handleCreatePerson = async (setFieldValue: (val: string) => void) => {
    if (!newPersonName.trim()) return
    setIsSubmittingPerson(true)
    try {
      const { id } = await createPerson({ data: { name: newPersonName } })
      await router.invalidate()
      setFieldValue(id)
      setIsCreatingPerson(false)
      setNewPersonName('')
    } catch (error) {
      console.error('Failed to create person', error)
    } finally {
      setIsSubmittingPerson(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-canvas overflow-auto md:overflow-hidden flex flex-col md:flex-row">
      {/* Nav: Floating "Back" Button - Absolute to be non-intrusive */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14 bg-surface border-transparent shadow-xl hover:scale-105 transition-transform"
        >
          <Link to="/">
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              strokeWidth={2.5}
              className="w-6 h-6"
            />
          </Link>
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="w-full h-full flex flex-col md:flex-row"
      >
        {/* ZONE 1: THE VALUE (Left/Top) */}
        <form.Field
          name="type"
          children={(typeField) => (
            <div
              className={cn(
                'relative w-full md:w-[55%] h-[50vh] md:h-full flex flex-col justify-center items-center p-8 transition-colors duration-700 ease-out',
                typeField.state.value === 'owed_to_me'
                  ? 'bg-metric text-ink'
                  : 'bg-accent text-white',
              )}
            >
              {/* Type Toggle - Stylized */}
              <div className="absolute top-8 right-8 flex flex-col gap-2 items-end">
                <button
                  type="button"
                  onClick={() => typeField.handleChange('owed_to_me')}
                  className={cn(
                    'text-sm font-bold tracking-widest uppercase transition-opacity',
                    typeField.state.value === 'owed_to_me'
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-70',
                  )}
                >
                  Asset (In)
                </button>
                <button
                  type="button"
                  onClick={() => typeField.handleChange('i_owe')}
                  className={cn(
                    'text-sm font-bold tracking-widest uppercase transition-opacity',
                    typeField.state.value === 'i_owe'
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-70',
                  )}
                >
                  Liability (Out)
                </button>
              </div>

              {/* Massive Amount Input */}
              <div className="w-full max-w-xl relative">
                <form.Field
                  name="amount"
                  children={(field) => (
                    <div className="relative group">
                      <span className="absolute -left-8 top-[10%] text-6xl md:text-8xl font-display opacity-50 select-none">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                        placeholder="0"
                        className={cn(
                          'w-full bg-transparent border-none p-0 text-[20vw] md:text-[12vw] font-display font-black leading-none focus:outline-none placeholder:opacity-30 appearance-none',
                          typeField.state.value === 'owed_to_me'
                            ? 'text-ink placeholder:text-ink'
                            : 'text-white placeholder:text-white',
                        )}
                        autoFocus
                      />
                    </div>
                  )}
                />
                <p
                  className={cn(
                    'mt-4 font-mono text-lg uppercase tracking-widest opacity-60',
                    typeField.state.value === 'owed_to_me'
                      ? 'text-ink'
                      : 'text-white',
                  )}
                >
                  {typeField.state.value === 'owed_to_me'
                    ? 'To be received'
                    : 'To be paid'}
                </p>
              </div>
            </div>
          )}
        />

        {/* ZONE 2: THE CONTEXT (Right/Bottom) */}
        <div className="w-full md:w-[45%] h-auto md:h-full bg-surface p-8 md:p-16 flex flex-col justify-center shadow-2xl relative z-10 rounded-t-3xl md:rounded-none -mt-8 md:mt-0">
          <div className="max-w-md mx-auto w-full space-y-12">
            <div className="space-y-8">
              {/* Counterparty */}
              <div className="space-y-4 group">
                <Label className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold pl-1">
                  Counterparty
                </Label>
                <form.Field
                  name="personId"
                  children={(field) => (
                    <>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => {
                          if (val === 'create_new') setIsCreatingPerson(true)
                          else field.handleChange(val)
                        }}
                      >
                        <SelectTrigger className="w-full h-auto py-4 px-0 border-0 border-b-2 border-muted bg-transparent rounded-none text-3xl font-display font-bold hover:bg-transparent shadow-none focus:ring-0 focus:border-ink transition-colors data-[placeholder]:text-muted-foreground/50">
                          <SelectValue placeholder="Who is this?" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {people.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="py-3 text-lg font-medium"
                            >
                              {p.name}
                            </SelectItem>
                          ))}
                          <div className="p-2 border-t mt-2">
                            <SelectItem
                              value="create_new"
                              className="justify-center text-accent font-bold py-3 bg-accent/5"
                            >
                              + Create New
                            </SelectItem>
                          </div>
                        </SelectContent>
                      </Select>

                      <Dialog
                        open={isCreatingPerson}
                        onOpenChange={setIsCreatingPerson}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>New Profile</DialogTitle>
                          </DialogHeader>
                          <div className="py-6">
                            <Input
                              autoFocus
                              value={newPersonName}
                              onChange={(e) => setNewPersonName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleCreatePerson(field.handleChange)
                                }
                              }}
                              placeholder="Name..."
                              className="text-lg py-6"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() =>
                                handleCreatePerson(field.handleChange)
                              }
                            >
                              Create Profile
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                />
              </div>

              {/* Date */}
              <div className="space-y-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold pl-1">
                  Due Date
                </Label>
                <form.Field
                  name="dueDate"
                  children={(field) => (
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full h-auto py-3 px-0 border-0 border-b-2 border-muted bg-transparent rounded-none text-xl font-mono text-ink shadow-none focus:ring-0 focus:border-ink hover:border-muted-foreground transition-colors"
                    />
                  )}
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold pl-1">
                  Description
                </Label>
                <form.Field
                  name="description"
                  children={(field) => (
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="What's the story?"
                      className="w-full h-auto py-3 px-0 border-0 border-b-2 border-muted bg-transparent rounded-none text-xl font-body text-ink shadow-none focus:ring-0 focus:border-ink hover:border-muted-foreground transition-colors placeholder:text-muted-foreground/40"
                    />
                  )}
                />
              </div>
            </div>

            {/* Submit Button - Floating Action */}
            <div className="pt-8">
              <Button
                type="submit"
                disabled={form.state.isSubmitting}
                className="w-full h-20 text-xl font-display font-bold uppercase tracking-widest rounded-full bg-ink text-surface hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50"
              >
                {form.state.isSubmitting ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <span className="flex items-center gap-3">
                    Confirm Record{' '}
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={3}
                      className="w-6 h-6"
                    />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
