import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/currencies'
import { recordPayment } from '@/server/functions/payments'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { z } from 'zod'

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
      await recordPayment({
        data: payloadData,
      })
      await router.invalidate()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="heavy-border bg-paper max-w-md">
        <DialogHeader className="heavy-border-b border-ink pb-4">
          <DialogTitle className="font-display font-bold text-xl">
            Record Payment
          </DialogTitle>
          <div className="font-mono text-xs opacity-60">
            {formatCurrency(debt.amount, debt.currency)} ·{' '}
            {debt.description || 'Debt'}
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6 pt-4"
        >
          <div className="space-y-3">
            <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
              Amount
            </Label>
            <div className="font-mono text-xs opacity-60 mb-2">
              Remaining: {formatCurrency(remainingAmount, debt.currency)}
            </div>
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono text-lg focus:ring-0"
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

          <div className="space-y-3">
            <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
              Date
            </Label>
            <form.Field
              name="paidAt"
              children={(field) => (
                <Input
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-12 border-0 border-b-2 border-ink bg-transparent rounded-none font-mono focus:ring-0"
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <Label className="font-mono text-xs uppercase tracking-widest opacity-60">
              Notes (optional)
            </Label>
            <form.Field
              name="notes"
              children={(field) => (
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-0 border-b-2 border-ink bg-transparent rounded-none font-mono resize-none h-20 focus:ring-0"
                  placeholder="Payment method, etc."
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="font-mono text-xs uppercase hover:bg-ink/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.state.isSubmitting}
              className="heavy-border font-bold uppercase text-xs bg-ink text-paper hover:bg-ink/90"
            >
              {form.state.isSubmitting ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
