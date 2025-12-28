import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>
          <Link to="/debts/new">Add Debt</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currencies.length === 0 && (
          <Card className="col-span-full bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 text-center text-zinc-400">
              No debts recorded yet.
            </CardContent>
          </Card>
        )}
        {currencies.map((currency) => {
          const { owedToMe, iOwe } = summary[currency]
          const net = owedToMe - iOwe
          return (
            <Card
              key={currency}
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {currency}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(net, currency)}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  You are owed: {formatCurrency(owedToMe, currency)}
                  <br />
                  You owe: {formatCurrency(iOwe, currency)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="link" className="text-zinc-400">
            <Link to="/debts">View All</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {recentDebts.length === 0 ? (
            <p className="text-zinc-500">No recent activity.</p>
          ) : (
            recentDebts.slice(0, 5).map((debt: any) => {
              const totalPaid =
                debt.payments?.reduce(
                  (acc: number, p: any) => acc + p.amount,
                  0,
                ) || 0
              const remaining = debt.amount - totalPaid

              return (
                <Card key={debt.id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-semibold text-zinc-100">
                        {debt.person?.name || 'Unknown Person'}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {debt.description || 'No description'}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div
                          className={`font-bold ${
                            debt.type === 'owed_to_me'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {debt.type === 'owed_to_me' ? '+' : '-'}
                          {formatCurrency(debt.amount, debt.currency)}
                        </div>
                        <div className="text-xs text-zinc-500 uppercase">
                          {debt.status === 'settled' ? (
                            <span className="text-green-400">Settled</span>
                          ) : (
                            <span>
                              Rem: {formatCurrency(remaining, debt.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                      {debt.status !== 'settled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPaymentModal(debt)}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

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
