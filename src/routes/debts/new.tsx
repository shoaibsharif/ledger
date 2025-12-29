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
import { Tick02Icon } from '@hugeicons/core-free-icons'
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
    try {
      const { id } = await createPerson({ data: { name: newPersonName } })
      await router.invalidate()
      setFieldValue(id)
      setIsCreatingPerson(false)
      setNewPersonName('')
    } catch (error) {
      console.error('Failed to create person', error)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="w-full flex flex-col md:flex-row min-h-screen"
      >
        <form.Field
          name="type"
          children={(typeField) => (
            <div
              className={cn(
                'relative w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-center items-center p-8 md:p-12',
                typeField.state.value === 'owed_to_me'
                  ? 'bg-forest text-paper'
                  : 'bg-crimson text-paper',
              )}
            >
              <Link
                to="/debts"
                className="absolute top-6 left-6 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 text-paper"
              >
                ← CANCEL
              </Link>
              <div className="absolute top-6 right-6 flex flex-col gap-2 items-end font-mono text-xs">
                <button
                  type="button"
                  onClick={() => typeField.handleChange('owed_to_me')}
                  className={cn(
                    'uppercase tracking-widest transition-opacity',
                    typeField.state.value === 'owed_to_me'
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-70',
                  )}
                >
                  Receivable
                </button>
                <button
                  type="button"
                  onClick={() => typeField.handleChange('i_owe')}
                  className={cn(
                    'uppercase tracking-widest transition-opacity',
                    typeField.state.value === 'i_owe'
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-70',
                  )}
                >
                  Payable
                </button>
              </div>

              <div className="w-full max-w-xl">
                <div className="font-mono text-xs uppercase tracking-[0.3em] opacity-60 mb-4">
                  Amount
                </div>
                <form.Field
                  name="amount"
                  children={(field) => (
                    <div className="relative flex items-baseline">
                      <span className="text-[clamp(1rem,5vw,2.5rem)] font-display opacity-50 mr-2">
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
                          'w-full bg-transparent border-none p-0 font-black font-mono leading-none focus:outline-none placeholder:opacity-30 appearance-none',
                          'text-paper placeholder:text-paper',
                          'text-[clamp(3rem,15vw,8rem)] md:text-[clamp(3rem,10vw,6rem)]',
                        )}
                        autoFocus
                      />
                    </div>
                  )}
                />
                <p className="font-mono text-sm opacity-60 mt-4 uppercase tracking-wider">
                  {typeField.state.value === 'owed_to_me'
                    ? 'To be received'
                    : 'To be paid'}
                </p>
              </div>
            </div>
          )}
        />

        <div
          className={cn(
            'w-full md:w-1/2 min-h-[60vh] md:min-h-screen bg-paper p-8 md:p-12',
            'border-t-3 md:border-t-0 md:border-l-3 border-ink',
          )}
        >
          <div className="max-w-md mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-black font-display tracking-tighter mb-1">
                NEW ENTRY
              </h1>
              <div className="font-mono text-xs opacity-60 uppercase tracking-wider">
                Create a ledger entry
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Counterparty
                </Label>
                <form.Field
                  name="personId"
                  children={(field) => (
                    <>
                      <Select
                        value={field.state.value || ''}
                        onValueChange={(val) => {
                          if (val === 'create_new') {
                            setIsCreatingPerson(true)
                          } else {
                            field.handleChange(val as 'owed_to_me' | 'i_owe')
                          }
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full h-auto py-4 px-0 border-0 border-b-2 border-ink bg-transparent rounded-none text-2xl font-display font-bold',
                            'focus:ring-0 focus:border-ink transition-colors',
                            !field.state.value && 'text-muted-foreground',
                          )}
                        >
                          <SelectValue>
                            {people.find((p) => p.id === field.state.value)
                              ?.name ?? 'Select a person'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {people.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="create_new">
                            + Create New
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Dialog
                        open={isCreatingPerson}
                        onOpenChange={setIsCreatingPerson}
                      >
                        <DialogContent className="heavy-border bg-paper">
                          <DialogHeader>
                            <DialogTitle className="font-display font-bold">
                              New Contact
                            </DialogTitle>
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
                              className="h-12 font-mono"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() =>
                                handleCreatePerson(field.handleChange)
                              }
                              className="heavy-border font-bold uppercase text-xs"
                            >
                              Create
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                    Currency
                  </Label>
                  <form.Field
                    name="currency"
                    children={(field) => (
                      <Select
                        value={field.state.value || ''}
                        onValueChange={(val) =>
                          field.handleChange(
                            val as 'USD' | 'EUR' | 'GBP' | 'JPY',
                          )
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            'h-10 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono',
                            'focus:ring-0',
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                    Due Date
                  </Label>
                  <form.Field
                    name="dueDate"
                    children={(field) => (
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn(
                          'h-10 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono',
                          'focus:ring-0',
                        )}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
                  Description
                </Label>
                <form.Field
                  name="description"
                  children={(field) => (
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Optional notes..."
                      className={cn(
                        'border-0 border-b-2 border-ink bg-transparent rounded-none',
                        'focus:ring-0 font-mono',
                      )}
                    />
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={form.state.isSubmitting}
                className={cn(
                  'w-full h-14 font-bold uppercase tracking-widest text-sm heavy-border',
                  'bg-ink text-paper hover:bg-ink/90 transition-colors',
                  'disabled:opacity-50',
                )}
              >
                {form.state.isSubmitting ? (
                  <span className="animate-pulse font-mono">Processing...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Record Entry
                    <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" />
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
