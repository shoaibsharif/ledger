import { useEffect } from 'react'
import { z } from 'zod'

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
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { formatCurrency } from '@/lib/currencies'
import { recordPayment } from '@/server/functions/payments'

interface AddPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: {
    id: string
    amount: number
    currency: string
    description?: string | null
  }
  remainingAmount: number
}

export function AddPaymentModal({
  open,
  onOpenChange,
  debt,
  remainingAmount,
}: AddPaymentModalProps) {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      amount: remainingAmount,
      paidAt: new Date().toISOString().split('T')[0],
      notes: '',
    },
    onSubmit: async ({ value }) => {
      const payloadData = {
        debtId: debt.id,
        amount: Number(value.amount),
        paidAt: value.paidAt ? new Date(value.paidAt) : undefined,
        notes: value.notes,
      }
      try {
        await recordPayment({
          data: payloadData,
        })
        await router.invalidate()
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to record payment', error)
        throw error
      }
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: remainingAmount,
        paidAt: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
  }, [open, remainingAmount])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {formatCurrency(debt.amount, debt.currency)} -{' '}
            {debt.description || 'Debt'}
          </DialogDescription>
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
              Amount (Remaining:{' '}
              {formatCurrency(remainingAmount, debt.currency)})
            </Label>
            <form.Field
              name="amount"
              validators={{
                onChange: z.number().min(0.01, 'Amount must be greater than 0'),
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
                  placeholder="Payment method, etc."
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
              {form.state.isSubmitting ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
