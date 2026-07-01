import { useState } from 'react'

import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Add01Icon, Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AddPaymentModal } from '@/components/AddPaymentModal'
import { EditDebtModal } from '@/components/EditDebtModal'
import { Button } from '@/components/ui/button'
import { LoadingIcon, LoadingSpinner } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { useAlertDialog } from '@/lib/alert-dialog'
import { getDebt } from '@/server/functions/debts'
import { getPeople } from '@/server/functions/people'
import { deletePayment } from '@/server/functions/payments'

export const Route = createFileRoute('/debts/$debtId')({
  loader: async ({ params: { debtId } }) => {
    return {
      debt: await getDebt({ data: { id: debtId } }),
      people: await getPeople(),
    }
  },
  component: DebtDetails,
  pendingComponent: LoadingSpinner,
})

function DebtDetails() {
  const { debt, people } = Route.useLoaderData()
  const isFetching = Route.useMatch({
    select: (m) => m.isFetching === 'loader',
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { alert } = useAlertDialog()
  const router = useRouter()

  const paymentsOnly = debt.payments.filter((p) => p.paymentType !== 'adjustment')
  const totalPaid = paymentsOnly.reduce((acc, p) => acc + p.amount, 0)
  const remaining = debt.amount - totalPaid
  const progress = debt.amount > 0 ? (totalPaid / debt.amount) * 100 : 0

  const isOwedToMe = debt.type === 'owed_to_me'
  const theme = isOwedToMe
    ? { bg: 'bg-forest', text: 'text-paper', accent: 'text-forest-20' }
    : { bg: 'bg-crimson', text: 'text-paper', accent: 'text-crimson-20' }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className={cn(
          'relative min-h-[60vh] flex flex-col justify-center items-center',
          theme.bg,
          'md:fixed md:inset-y-0 md:left-0 md:w-1/2 md:h-screen p-8 md:p-12',
        )}
      >
        <Link
          to="/debts"
          className={cn(
            'absolute top-6 left-6 z-50 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100',
            theme.text,
          )}
        >
          ← BACK
        </Link>
        <div className="max-w-xl w-full text-center">
          <div
            className={cn(
              'font-mono text-xs uppercase tracking-[0.3em] opacity-60 mb-6',
              theme.text,
            )}
          >
            {isOwedToMe ? 'Receivable' : 'Payable'}
          </div>
          <h1
            className={cn(
              'text-[12vw] md:text-[8vw] font-black font-display leading-none tracking-tighter inline-flex items-baseline justify-center',
              theme.text,
            )}
          >
            <span className="text-[0.35em] font-bold opacity-40 -translate-y-[0.5em] mr-1">
              {formatCurrency(0, debt.currency).replace(/[0-9.,\s]/g, '')}
            </span>
            {formatCurrency(remaining, debt.currency).replace(/[^0-9.,]/g, '')}
          </h1>
          <p
            className={cn(
              'text-xl md:text-2xl font-medium opacity-80 mt-6',
              theme.text,
            )}
          >
            {debt.person.name || 'Unknown'}
          </p>
          <p className={cn('font-mono text-sm opacity-60 mt-2', theme.text)}>
            {debt.description || 'No description'}
          </p>
          <div className="mt-8 w-64 h-1 bg-white/20 mx-auto rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', theme.text, 'bg-current')}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            className={cn(
              'mt-2 flex justify-between w-64 mx-auto font-mono text-xs uppercase opacity-60',
              theme.text,
            )}
          >
            <span>
              {isOwedToMe ? 'Received' : 'Paid'}:{' '}
              {formatCurrency(totalPaid, debt.currency)}
            </span>
            <span>Total: {formatCurrency(debt.amount, debt.currency)}</span>
          </div>
          {debt.status !== 'settled' && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setPaymentModalOpen(true)}
                className={cn(
                  'rounded-full h-14 px-8 font-bold uppercase tracking-widest text-sm border-2 border-current hover:bg-white hover:text-ink transition-colors',
                  theme.text,
                  'bg-transparent w-full sm:w-auto',
                )}
              >
                Record Payment
              </Button>
              <Button
                onClick={() => setAdjustmentModalOpen(true)}
                className={cn(
                  'rounded-full h-14 px-8 font-bold uppercase tracking-widest text-sm border-2 border-current hover:bg-white hover:text-ink transition-colors',
                  theme.text,
                  'bg-transparent w-full sm:w-auto',
                )}
              >
                Increase Amount
              </Button>
              <Button
                onClick={() => setEditModalOpen(true)}
                variant="ghost"
                className={cn(
                  'rounded-full h-14 px-8 font-bold uppercase tracking-widest text-sm border-2 border-current hover:bg-white hover:text-ink transition-colors',
                  theme.text,
                  'bg-transparent w-full sm:w-auto',
                )}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          'relative z-10 bg-paper min-h-[50vh] md:ml-[50%] md:w-1/2 md:h-screen overflow-auto',
          'border-t md:border-t-0 md:border-l-3 border-ink',
        )}
      >
        <div className="p-6 md:p-12">
          <h2
            className={cn(
              'text-3xl font-black font-display tracking-tighter mb-2 flex items-center gap-2',
            )}
          >
            HISTORY
            {isFetching && <LoadingIcon className="w-5 h-5 opacity-60" />}
          </h2>
          <div className="font-mono text-xs opacity-60 uppercase tracking-wider mb-8">
            {debt.payments.length} payment
            {debt.payments.length !== 1 ? 's' : ''} recorded
          </div>

          {debt.payments.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center py-12 border-2 border-dashed border-ink/20',
              )}
            >
              <div className="font-mono text-sm opacity-60 mb-2">
                NO PAYMENTS
              </div>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                No payments have been recorded for this entry.
              </p>
            </div>
          ) : (
            <div className="relative pl-8">
              <div
                className={cn('absolute left-0 top-0 bottom-0 w-px bg-ink/20')}
              />
              {debt.payments.map((payment) => {
                const isAdjustment = payment.paymentType === 'adjustment'
                return (
                  <div key={payment.id} className="relative pb-8 last:pb-0">
                    <div
                      className={cn(
                        'absolute -left-[37px] top-2 w-3 h-3 rounded-full border-2 border-ink bg-paper',
                        isAdjustment && 'bg-forest border-forest',
                      )}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          {isAdjustment && (
                            <HugeiconsIcon
                              icon={Add01Icon}
                              className="w-4 h-4 text-forest"
                            />
                          )}
                          {formatCurrency(payment.amount, debt.currency)}
                        </div>
                        <div
                          className={cn(
                            'font-mono text-xs text-muted-foreground mt-1 flex items-center gap-2',
                          )}
                        >
                          <span>
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  },
                                )
                              : 'N/A'}
                          </span>
                          {isAdjustment && (
                            <>
                              <span>·</span>
                              <span className="text-forest font-mono uppercase tracking-wider">
                                Adjustment
                              </span>
                            </>
                          )}
                        </div>
                        {payment.notes && (
                          <div
                            className={cn(
                              'mt-2 text-sm opacity-80 pl-4 border-l-2 border-ink/20',
                            )}
                          >
                            {payment.notes}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert({
                            title: 'Delete Entry',
                            description:
                              'Are you sure you want to delete this entry?',
                            onConfirm: async () => {
                              await deletePayment({ data: payment.id })
                              router.invalidate()
                            },
                          })
                        }}
                        className="opacity-50 hover:opacity-100 hover:text-crimson hover:bg-crimson/10 transition-all p-1 h-auto"
                        title="Delete entry"
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          className="w-5 h-5"
                        />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className={cn('mt-12 p-6 heavy-border', 'bg-ink text-paper')}>
            <h3 className="font-mono text-xs font-bold uppercase mb-4">
              ENTRY DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <div className="opacity-60 text-xs">Created</div>
                <div>
                  {debt.createdAt
                    ? new Date(debt.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="opacity-60 text-xs">Type</div>
                <div className="uppercase">
                  {debt.type === 'owed_to_me' ? 'Receivable' : 'Payable'}
                </div>
              </div>
              <div>
                <div className="opacity-60 text-xs">Original Amount</div>
                <div>{formatCurrency(debt.amount, debt.currency)}</div>
              </div>
              <div>
                <div className="opacity-60 text-xs">Status</div>
                <div className="uppercase">{debt.status}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        debt={debt}
        remainingAmount={remaining}
        mode="payment"
      />
      <AddPaymentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        debt={debt}
        remainingAmount={remaining}
        mode="adjustment"
      />
      <EditDebtModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        debt={debt}
        people={people}
      />
    </div>
  )
}
