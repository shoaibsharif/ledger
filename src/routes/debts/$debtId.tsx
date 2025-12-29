import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { getDebt } from '@/server/functions/debts'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/debts/$debtId')({
  loader: async ({ params: { debtId } }) => {
    return {
      debt: await getDebt({ data: { id: debtId } }),
    }
  },
  component: DebtDetails,
})

function DebtDetails() {
  const { debt } = Route.useLoaderData()
  const [modalOpen, setModalOpen] = useState(false)

  const totalPaid = debt.payments?.reduce((acc, p) => acc + p.amount, 0) || 0
  const remaining = debt.amount - totalPaid
  const progress = (totalPaid / debt.amount) * 100

  const isOwedToMe = debt.type === 'owed_to_me'
  const theme = isOwedToMe
    ? { bg: 'bg-forest', text: 'text-paper', accent: 'text-forest-20' }
    : { bg: 'bg-crimson', text: 'text-paper', accent: 'text-crimson-20' }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className={cn(
          'fixed inset-0 z-0',
          theme.bg,
          'md:relative md:w-1/2 md:h-screen md:flex md:flex-col md:justify-center md:items-center p-8 md:p-12',
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
          <div className="relative">
            <h1
              className={cn(
                'text-[12vw] md:text-[8vw] font-black font-display leading-none tracking-tighter',
                theme.text,
              )}
            >
              {formatCurrency(remaining, debt.currency).replace(
                /[^0-9.,]/g,
                '',
              )}
            </h1>
            <span
              className={cn(
                'absolute -top-4 -left-6 md:-left-8 text-3xl md:text-5xl font-display font-bold opacity-40',
                theme.text,
              )}
            >
              {formatCurrency(0, debt.currency).replace(/[0-9.,\s]/g, '')}
            </span>
          </div>
          <p
            className={cn(
              'text-xl md:text-2xl font-medium opacity-80 mt-6',
              theme.text,
            )}
          >
            {debt.person?.name || 'Unknown'}
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
            <div className="mt-8">
              <Button
                onClick={() => setModalOpen(true)}
                className={cn(
                  'rounded-full h-14 px-8 font-bold uppercase tracking-widest text-sm border-2 border-current hover:bg-white hover:text-ink transition-colors',
                  theme.text,
                  'bg-transparent',
                )}
              >
                Record Payment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 bg-paper md:w-1/2 min-h-[50vh] md:h-screen overflow-auto',
          'border-t md:border-t-0 md:border-l-3 border-ink',
        )}
      >
        <div className="p-6 md:p-12">
          <h2
            className={cn(
              'text-3xl font-black font-display tracking-tighter mb-2',
            )}
          >
            HISTORY
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
              {debt.payments.map((payment: any) => (
                <div key={payment.id} className="relative pb-8 last:pb-0">
                  <div
                    className={cn(
                      'absolute -left-[35px] top-1 w-3 h-3 rounded-full border-2 border-ink bg-paper',
                    )}
                  />
                  <div className="font-bold text-lg">
                    {formatCurrency(payment.amount, debt.currency)}
                  </div>
                  <div
                    className={cn(
                      'font-mono text-xs text-muted-foreground mt-1 flex items-center gap-2',
                    )}
                  >
                    <span>
                      {new Date(payment.paidAt!).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(payment.paidAt!).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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
              ))}
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
                  {new Date(debt.createdAt!).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
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
        open={modalOpen}
        onOpenChange={setModalOpen}
        debt={debt}
        remainingAmount={remaining}
      />
    </div>
  )
}
