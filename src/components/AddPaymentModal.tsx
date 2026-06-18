import { useEffect } from 'react'
import { z } from 'zod'

import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingIcon } from '@/components/ui/loading'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/currencies'
import { todayDateString } from '@/lib/date'
import { cn } from '@/lib/utils'
import { increaseDebt } from '@/server/functions/debts'
import { recordPayment } from '@/server/functions/payments'

type ModalMode = 'payment' | 'adjustment'

interface AddPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: {
    id: string
    amount: number
    currency: string
    description?: string | null
    type: 'owed_to_me' | 'i_owe'
  }
  remainingAmount: number
  mode?: ModalMode
}

export function AddPaymentModal({
  open,
  onOpenChange,
  debt,
  remainingAmount,
  mode = 'payment',
}: AddPaymentModalProps) {
  const router = useRouter()

  const isAdjustment = mode === 'adjustment'

  const form = useForm({
    defaultValues: {
      amount: isAdjustment ? 0 : remainingAmount,
      paidAt: todayDateString(),
      notes: '',
    },
    onSubmit: async ({ value }) => {
      const commonData = {
        debtId: debt.id,
        amount: Number(value.amount),
        paidAt: value.paidAt || undefined,
        notes: value.notes || undefined,
      }

      try {
        if (isAdjustment) {
          await increaseDebt({ data: commonData })
        } else {
          await recordPayment({ data: commonData })
        }
        await router.invalidate()
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to record', error)
        throw error
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: isAdjustment ? 0 : remainingAmount,
        paidAt: todayDateString(),
        notes: '',
      })
    }
  }, [open, remainingAmount, isAdjustment])

  const title = isAdjustment ? 'Increase Amount' : 'Record Payment'
  const description = isAdjustment
    ? `Increase the amount for ${debt.description || 'Debt'}`
    : `Record a payment for ${formatCurrency(debt.amount, debt.currency)} - ${debt.description || 'Debt'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            <Label htmlFor="amount">
              Amount{' '}
              {isAdjustment &&
                `(Current: ${formatCurrency(debt.amount, debt.currency)})`}
            </Label>
            <form.Field
              name="amount"
              validators={{
                onChange: z.number().positive('Amount must be greater than 0'),
              }}
              children={(field) => (
                <>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className="border-zinc-700 bg-zinc-950"
                    placeholder="0.00"
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
            <Label htmlFor="paidAt">Date</Label>
            <form.Field
              name="paidAt"
              children={(field) => (
                <Input
                  id="paidAt"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-zinc-700 bg-zinc-950"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <form.Field
              name="notes"
              children={(field) => (
                <Textarea
                  id="notes"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-zinc-700 bg-zinc-950 resize-none h-20"
                  placeholder={
                    isAdjustment
                      ? 'Why is the amount increasing?'
                      : 'Payment method, etc.'
                  }
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(isAdjustment && 'bg-forest hover:bg-forest/80')}
                  >
                    <span className="inline-grid size-4 place-items-center">
                      {isSubmitting && <LoadingIcon />}
                    </span>
                    <span>{title}</span>
                    <span className="size-4" aria-hidden="true" />
                  </Button>
                </>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
