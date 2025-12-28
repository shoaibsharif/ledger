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
      // #region agent log
      const payloadData = {
        debtId: debt.id,
        amount: Number(value.amount),
        paidAt: value.paidAt ? new Date(value.paidAt) : undefined,
        notes: value.notes,
      }
      fetch(
        'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AddPaymentModal.tsx:onSubmit-entry',
            message: 'onSubmit handler called',
            data: {
              rawValue: value,
              parsedPayload: payloadData,
              amountIsNaN: isNaN(Number(value.amount)),
              dateIsValid: value.paidAt
                ? !isNaN(new Date(value.paidAt).getTime())
                : 'undefined',
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'D,E',
          }),
        },
      ).catch(() => {})
      // #endregion
      try {
        const result = await recordPayment({
          data: payloadData,
        })
        // #region agent log
        fetch(
          'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AddPaymentModal.tsx:onSubmit-success',
              message: 'recordPayment succeeded',
              data: { result },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'E',
            }),
          },
        ).catch(() => {})
        // #endregion
        // #region agent log
        fetch(
          'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AddPaymentModal.tsx:before-invalidate',
              message: 'About to call router.invalidate()',
              data: {},
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'F,G,H',
            }),
          },
        ).catch(() => {})
        // #endregion
        await router.invalidate()
        // #region agent log
        fetch(
          'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AddPaymentModal.tsx:after-invalidate',
              message: 'router.invalidate() completed',
              data: {},
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'F,G,H',
            }),
          },
        ).catch(() => {})
        // #endregion
        onOpenChange(false)
        // #region agent log
        fetch(
          'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AddPaymentModal.tsx:after-close',
              message: 'onOpenChange(false) called',
              data: {},
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'G,I',
            }),
          },
        ).catch(() => {})
        // #endregion
      } catch (error) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AddPaymentModal.tsx:onSubmit-error',
              message: 'recordPayment threw error',
              data: {
                error: String(error),
                errorName: (error as Error)?.name,
                errorMessage: (error as Error)?.message,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'E',
            }),
          },
        ).catch(() => {})
        // #endregion
        throw error
      }
    },
  })

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
            // #region agent log
            fetch(
              'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'AddPaymentModal.tsx:onSubmit',
                  message: 'Form submit triggered',
                  data: {
                    formValues: form.state.values,
                    isValid: form.state.isValid,
                    canSubmit: form.state.canSubmit,
                    isSubmitting: form.state.isSubmitting,
                    errors: form.state.errors,
                    fieldMeta: form.state.fieldMeta,
                  },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  hypothesisId: 'A,B,C',
                }),
              },
            ).catch(() => {})
            // #endregion
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      // #region agent log
                      fetch(
                        'http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            location: 'AddPaymentModal.tsx:amount-onChange',
                            message: 'Amount field changed',
                            data: {
                              rawValue: e.target.value,
                              valueAsNumber: e.target.valueAsNumber,
                              isNaN: isNaN(e.target.valueAsNumber),
                              fieldErrors: field.state.meta.errors,
                            },
                            timestamp: Date.now(),
                            sessionId: 'debug-session',
                            hypothesisId: 'A,B',
                          }),
                        },
                      ).catch(() => {})
                      // #endregion
                      field.handleChange(e.target.valueAsNumber)
                    }}
                    className="border-zinc-700 bg-zinc-950"
                  />
                  {field.state.meta.errors ? (
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
