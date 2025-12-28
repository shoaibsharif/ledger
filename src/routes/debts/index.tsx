import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currencies'
import { getDebts } from '@/server/functions/debts'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/debts/')({
  validateSearch: (search) =>
    z
      .object({
        status: z.enum(['pending', 'partial', 'settled']).optional(),
        type: z.enum(['owed_to_me', 'i_owe']).optional(),
      })
      .parse(search),
  loader: async ({ deps: { status, type } }) => {
    return {
      debts: await getDebts({ data: { status, type } }),
    }
  },
  loaderDeps: ({ search: { status, type } }) => ({ status, type }),
  component: DebtsList,
})

function DebtsList() {
  const { debts } = Route.useLoaderData()
  const { status, type } = Route.useSearch()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<(typeof debts)[0] | null>(
    null,
  )

  const openPaymentModal = (debt: (typeof debts)[0]) => {
    setSelectedDebt(debt)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debts</h1>
        <Button>
          <Link to="/debts/new">Add Debt</Link>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link
          to="/debts"
          search={{}}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${!status && !type ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 border-zinc-800'}`}
        >
          All
        </Link>
        <Link
          to="/debts"
          search={{ status: 'pending' }}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${status === 'pending' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 border-zinc-800'}`}
        >
          Pending
        </Link>
        <Link
          to="/debts"
          search={{ type: 'owed_to_me' }}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${type === 'owed_to_me' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 border-zinc-800'}`}
        >
          Owed to Me
        </Link>
        <Link
          to="/debts"
          search={{ type: 'i_owe' }}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${type === 'i_owe' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 border-zinc-800'}`}
        >
          I Owe
        </Link>
      </div>

      <div className="space-y-4">
        {debts.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No debts found.</p>
        ) : (
          debts.map((debt: any) => {
            const totalPaid =
              debt.payments?.reduce(
                (acc: number, p: any) => acc + p.amount,
                0,
              ) || 0
            const remaining = debt.amount - totalPaid

            return (
              <Link
                key={debt.id}
                to="/debts/$debtId"
                params={{ debtId: debt.id }}
                className="block transition-transform hover:scale-[1.01]"
              >
                <Card
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 h-full hover:border-zinc-700 transition-colors"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg">
                        {debt.person?.name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {debt.description}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(debt.createdAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div
                        className={`font-bold text-lg ${
                          debt.type === 'owed_to_me'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {debt.type === 'owed_to_me' ? '+' : '-'}
                        {formatCurrency(debt.amount, debt.currency)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs border-zinc-700 capitalize ${
                            debt.status === 'settled'
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {debt.status}
                        </Badge>
                        {debt.status !== 'settled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs hover:bg-zinc-800"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openPaymentModal(debt)
                            }}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                      {debt.status !== 'settled' && (
                        <span className="text-xs text-zinc-500">
                          Rem: {formatCurrency(remaining, debt.currency)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
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
