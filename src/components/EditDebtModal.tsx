import { useEffect, useState } from 'react'
import { z } from 'zod'

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
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { currencies } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { updateDebt } from '@/server/functions/debts'
import { createPerson } from '@/server/functions/people'

interface EditDebtModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: {
    id: string
    personId: string
    amount: number
    currency: string
    description: string | null
    type: 'owed_to_me' | 'i_owe'
    dueDate: Date | null
  }
  people: Array<{ id: string; name: string }>
}

export function EditDebtModal({
  open,
  onOpenChange,
  debt,
  people,
}: EditDebtModalProps) {
  const router = useRouter()
  const [isCreatingPerson, setIsCreatingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')

  const form = useForm({
    defaultValues: {
      personId: debt.personId,
      amount: debt.amount,
      currency: debt.currency as 'USD' | 'EUR' | 'GBP' | 'JPY',
      description: debt.description || '',
      type: debt.type,
      dueDate: debt.dueDate
        ? new Date(debt.dueDate).toISOString().split('T')[0]
        : '',
    },
    onSubmit: async ({ value }) => {
      await updateDebt({
        data: {
          id: debt.id,
          personId: value.personId,
          amount: Number(value.amount),
          currency: value.currency,
          description: value.description || undefined,
          type: value.type,
          dueDate: value.dueDate ? new Date(value.dueDate) : undefined,
        },
      })
      await router.invalidate()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        personId: debt.personId,
        amount: debt.amount,
        currency: debt.currency as 'USD' | 'EUR' | 'GBP' | 'JPY',
        description: debt.description || '',
        type: debt.type,
        dueDate: debt.dueDate
          ? new Date(debt.dueDate).toISOString().split('T')[0]
          : '',
      })
    }
  }, [open, debt])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => form.setFieldValue('type', 'owed_to_me')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md font-mono text-xs uppercase tracking-widest transition-all',
                  form.state.values.type === 'owed_to_me'
                    ? 'bg-forest text-paper'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                )}
              >
                Receivable
              </button>
              <button
                type="button"
                onClick={() => form.setFieldValue('type', 'i_owe')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md font-mono text-xs uppercase tracking-widest transition-all',
                  form.state.values.type === 'i_owe'
                    ? 'bg-crimson text-paper'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                )}
              >
                Payable
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <form.Field
              name="amount"
              validators={{
                onChange: z.number().min(0.01, 'Amount must be greater than 0'),
              }}
              children={(field) => (
                <>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className="border-zinc-700 bg-zinc-950"
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <em className="text-red-500 text-xs">
                      {field.state.meta.errors.join(', ')}
                    </em>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Counterparty</Label>
            <form.Field
              name="personId"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value || ''}
                    onValueChange={(val) => {
                      if (val === 'create_new') {
                        setIsCreatingPerson(true)
                      } else if (val) {
                        field.handleChange(val)
                      }
                    }}
                  >
                    <SelectTrigger className="border-zinc-700 bg-zinc-950">
                      <SelectValue>
                        {people.find((p) => p.id === field.state.value)?.name ||
                          'Select a person'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="create_new">+ Create New</SelectItem>
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
                          onClick={() => handleCreatePerson(field.handleChange)}
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
            <div className="space-y-2">
              <Label>Currency</Label>
              <form.Field
                name="currency"
                children={(field) => (
                  <Select
                    value={field.state.value ?? ''}
                    onValueChange={(val) =>
                      field.handleChange(val as 'USD' | 'EUR' | 'GBP' | 'JPY')
                    }
                  >
                    <SelectTrigger className="border-zinc-700 bg-zinc-950">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <form.Field
                name="dueDate"
                children={(field) => (
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-zinc-700 bg-zinc-950"
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <form.Field
              name="description"
              children={(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Optional notes..."
                  className="border-zinc-700 bg-zinc-950"
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
