import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/currencies'
import { getDashboardSummary, getDebts } from '@/server/functions/debts'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const summary = await getDashboardSummary()
    const recentDebts = await getDebts({ data: { status: 'pending' } })
    return { summary, recentDebts }
  },
  component: Dashboard,
  pendingComponent: LoadingSpinner,
})

function Dashboard() {
  const { summary, recentDebts } = Route.useLoaderData()
  const currencies = Object.keys(summary)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<
    (typeof recentDebts)[0] | null
  >(null)

  const openPaymentModal = (debt: (typeof recentDebts)[0]) => {
    setSelectedDebt(debt)
    setModalOpen(true)
  }

  const totalOwedToMe = currencies.reduce(
    (acc, c) => acc + summary[c].owedToMe,
    0,
  )
  const totalIOwe = currencies.reduce((acc, c) => acc + summary[c].iOwe, 0)
  const netPosition = totalOwedToMe - totalIOwe

  if (currencies.length === 0) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <header className="heavy-border-b p-6">
          <h1 className="text-4xl font-black font-display tracking-tighter">
            LEDGER
          </h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="font-mono text-sm mb-4">NO TRANSACTIONS</div>
            <p className="text-muted-foreground mb-8">
              Your financial ledger is empty. Begin recording debts to track
              your financial relationships.
            </p>
            <Button className="w-full heavy-border font-bold uppercase tracking-widest text-sm py-6">
              <Link to="/debts/new">New Entry</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="heavy-border-b p-6 flex items-center justify-between">
        <h1 className="text-4xl font-black font-display tracking-tighter">
          LEDGER
        </h1>
        <Button className="heavy-border font-bold uppercase tracking-widest text-xs py-4 px-6">
          <Link to="/debts/new">New Entry</Link>
        </Button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <section className="mb-12">
            <div className="font-mono text-xs mb-4 border-b border-ink pb-2">
              POSITION SUMMARY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 heavy-border">
              <div className="p-6 heavy-border-b md:heavy-border-b-0 md:heavy-border-r border-ink bg-forest text-paper">
                <div className="font-mono text-xs opacity-70 mb-2">ASSETS</div>
                <div className="text-4xl font-black font-mono-tight">
                  {formatCurrency(totalOwedToMe, currencies[0] || 'USD')}
                </div>
              </div>
              <div className="p-6 heavy-border-b md:heavy-border-b-0 md:heavy-border-r border-ink bg-crimson text-paper">
                <div className="font-mono text-xs opacity-70 mb-2">
                  LIABILITIES
                </div>
                <div className="text-4xl font-black font-mono-tight">
                  {formatCurrency(totalIOwe, currencies[0] || 'USD')}
                </div>
              </div>
              <div
                className={`p-6 ${netPosition >= 0
                  ? 'bg-ink text-paper'
                  : 'bg-crimson text-paper'
                  }`}
              >
                <div className="font-mono text-xs opacity-70 mb-2">NET</div>
                <div className="text-4xl font-black font-mono-tight">
                  {netPosition >= 0 ? '+' : ''}
                  {formatCurrency(netPosition, currencies[0] || 'USD')}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="font-mono text-xs mb-4 border-b border-ink pb-2 flex justify-between items-end">
              <span>RECENT ACTIVITY</span>
              <span className="normal-case opacity-60">
                {recentDebts.length} pending
              </span>
            </div>
            <div className="space-y-0">
              {recentDebts.slice(0, 5).map((debt: any, index: number) => {
                const totalPaid =
                  debt.payments?.reduce(
                    (acc: number, p: any) => acc + p.amount,
                    0,
                  ) || 0
                const remaining = debt.amount - totalPaid
                const progress = (totalPaid / debt.amount) * 100

                return (
                  <div
                    key={debt.id}
                    className={`group block heavy-border-b border-ink ${index % 2 === 0 ? 'bg-white/30' : 'bg-ink/5'
                      } hover:bg-ink hover:text-paper transition-colors`}
                  >
                    <Link
                      to="/debts/$debtId"
                      params={{ debtId: debt.id }}
                      className="block p-4 md:p-6"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-lg truncate">
                            {debt.person?.name || 'Unknown'}
                          </div>
                          <div className="font-mono text-xs opacity-60 mt-1">
                            {debt.type === 'owed_to_me'
                              ? 'RECEIVABLE'
                              : 'PAYABLE'}{' '}
                            · {debt.description || 'No description'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-mono-tight text-xl font-bold ${debt.type === 'owed_to_me'
                              ? 'text-forest'
                              : 'text-crimson'
                              } group-hover:text-inherit`}
                          >
                            {debt.type === 'owed_to_me' ? '+' : '-'}
                            {formatCurrency(debt.amount, debt.currency)}
                          </div>
                          {debt.status !== 'settled' && (
                            <div className="font-mono text-xs opacity-60 mt-1">
                              {formatCurrency(remaining, debt.currency)} due
                            </div>
                          )}
                        </div>
                      </div>
                      {debt.status !== 'settled' && (
                        <div className="mt-3 h-1 bg-ink/20 group-hover:bg-white/30">
                          <div
                            className="h-full bg-ink group-hover:bg-paper transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </Link>
                    {debt.status !== 'settled' && (
                      <div className="px-4 md:px-6 pb-4 md:pb-6 md:hidden">
                        <Button
                          size="sm"
                          className="w-full heavy-border font-bold uppercase text-xs py-3"
                          onClick={(e) => {
                            e.preventDefault()
                            openPaymentModal(debt)
                          }}
                        >
                          Record Payment
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {recentDebts.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" className="font-mono text-xs uppercase">
                  <Link to="/debts">View All Entries →</Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedDebt && (
        <AddPaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          debt={selectedDebt}
          remainingAmount={
            selectedDebt.amount -
            (selectedDebt.payments?.reduce(
              (acc: number, p: any) => acc + p.amount,
              0,
            ) || 0)
          }
        />
      )}
    </div>
  )
}
