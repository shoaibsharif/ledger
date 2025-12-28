import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currencies'
import { getPerson } from '@/server/functions/people'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/people/$personId')({
  loader: async ({ params }) => {
    const person = await getPerson({ data: params.personId })
    if (!person) {
      throw new Error('Person not found')
    }
    return { person }
  },
  component: PersonDetail,
})

function PersonDetail() {
  const { person } = Route.useLoaderData()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<
    (typeof person.debts)[0] | null
  >(null)

  const openPaymentModal = (debt: (typeof person.debts)[0]) => {
    setSelectedDebt(debt)
    setModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-zinc-800">
            <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-300">
              {person.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{person.name}</h1>
            <div className="text-zinc-500 flex gap-4 text-sm mt-1">
              {person.email && <span>{person.email}</span>}
              {person.phone && <span>{person.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link to="/people">Back</Link>
          </Button>
          <Button>
            <Link to={`/debts/new?personId=${person.id}`}>Add Debt</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle>Debts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {person.debts.length === 0 ? (
                <p className="text-zinc-500">No debts recorded.</p>
              ) : (
                person.debts.map((debt: any) => {
                  const totalPaid =
                    debt.payments?.reduce(
                      (acc: number, p: any) => acc + p.amount,
                      0,
                    ) || 0
                  const remaining = debt.amount - totalPaid

                  return (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-zinc-950"
                    >
                      <div>
                        <div className="font-medium">
                          {debt.description || 'Debt'}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {new Date(debt.createdAt!).toLocaleDateString()}
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
                          <div className="text-xs text-zinc-500">
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
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 h-fit">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 whitespace-pre-wrap">
              {person.notes || 'No notes'}
            </p>
          </CardContent>
        </Card>
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
