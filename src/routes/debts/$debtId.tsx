import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { getDebt } from '@/server/functions/debts'
import {
  ArrowLeft02Icon,
  Calendar02Icon,
  Note01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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

  const totalPaid = debt.payments.reduce((acc, p) => acc + p.amount, 0)
  const remaining = debt.amount - totalPaid
  const progress = Math.min((totalPaid / debt.amount) * 100, 100)

  const isOwedToMe = debt.type === 'owed_to_me'
  const themeClass = isOwedToMe ? 'bg-metric text-ink' : 'bg-accent text-white'

  return (
    <div className="fixed inset-0 bg-canvas overflow-auto md:overflow-hidden flex flex-col md:flex-row font-sans">
      {/* Floating Back Button */}
      <div className="absolute top-6 left-6 z-50 mix-blend-difference text-surface">
        <Link
          to="/debts"
          className="rounded-full w-14 h-14 bg-transparent border-2 border-current hover:bg-surface/20 inline-flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            strokeWidth={2.5}
            className="w-6 h-6"
          />
        </Link>
      </div>

      {/* ZONE 1: HERO (Left/Top) */}
      <div
        className={cn(
          'relative w-full md:w-[50%] h-[50vh] md:h-full flex flex-col justify-center items-center px-12 py-8 md:p-12 transition-colors duration-500',
          themeClass,
        )}
      >
        <div className="flex flex-col items-center gap-2 max-w-xl text-center">
          <span className="font-mono text-sm uppercase tracking-[0.3em] opacity-60 mb-4">
            {isOwedToMe ? 'Asset Value' : 'Liability'}
          </span>

          <div className="relative px-4">
            <h1 className="text-[12vw] md:text-[8vw] font-display font-black leading-none tracking-tighter">
              {formatCurrency(remaining, debt.currency).replace(
                /[^0-9.,]/g,
                '',
              )}
            </h1>
            <span className="absolute -top-4 -left-8 md:-left-12 text-4xl md:text-6xl font-display font-bold opacity-50">
              {formatCurrency(0, debt.currency).replace(/[0-9.,\s]/g, '')}
            </span>
          </div>

          <p className="text-xl md:text-2xl font-medium opacity-80 mt-4">
            {debt.person?.name}
          </p>

          <div className="mt-8 w-64 h-1 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-current opacity-80"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between w-64 text-xs font-mono uppercase opacity-60">
            <span>Paid: {formatCurrency(totalPaid, debt.currency)}</span>
            <span>Total: {formatCurrency(debt.amount, debt.currency)}</span>
          </div>
        </div>

        {/* Action Button positioned within Hero for mobile */}
        {debt.status !== 'settled' && (
          <Button
            onClick={() => setModalOpen(true)}
            className="md:hidden mt-8 rounded-full h-14 px-8 bg-surface text-ink hover:bg-white border-none shadow-lg font-bold uppercase tracking-widest"
          >
            Add Payment
          </Button>
        )}
      </div>

      {/* ZONE 2: HISTORY (Right/Bottom) */}
      <div className="w-full md:w-[50%] h-auto md:h-full bg-surface relative flex flex-col">
        {/* Header */}
        <div className="p-8 md:p-12 pb-4 border-b border-muted">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-display font-bold">History</h2>
              <p className="text-muted-foreground mt-1 text-sm font-mono uppercase tracking-wider">
                {debt.description || 'No description provided'}
              </p>
            </div>

            {/* Desktop Action Button */}
            {debt.status !== 'settled' && (
              <Button
                onClick={() => setModalOpen(true)}
                className="hidden md:flex rounded-full h-14 w-14 p-0 bg-ink text-surface hover:scale-105 shadow-xl transition-all items-center justify-center"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={3}
                  className="w-6 h-6"
                />
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-8 md:p-12 space-y-8">
          {debt.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
              <Calendar02Icon className="w-12 h-12 mb-4" />
              <p className="font-mono text-sm uppercase tracking-widest">
                No payments recorded
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
              {debt.payments.map((payment) => (
                <div key={payment.id} className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-surface border-4 border-muted group-hover:border-ink transition-colors" />
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-display font-bold">
                      {formatCurrency(payment.amount, debt.currency)}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                      {new Date(payment.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {payment.note && (
                    <div className="flex gap-2 items-start text-muted-foreground text-sm">
                      <Note01Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="leading-snug">{payment.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
