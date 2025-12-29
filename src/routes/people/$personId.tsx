import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from "@/components/ui/loading"
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
  pendingComponent: LoadingSpinner,
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

  const totalOwedToMe = person.debts
    .filter((d: any) => d.type === 'owed_to_me')
    .reduce((acc: number, d: any) => {
      const paid =
        d.payments?.reduce((a: number, p: any) => a + p.amount, 0) || 0
      return acc + (d.amount - paid)
    }, 0)

  const totalIOwe = person.debts
    .filter((d: any) => d.type === 'i_owe')
    .reduce((acc: number, d: any) => {
      const paid =
        d.payments?.reduce((a: number, p: any) => a + p.amount, 0) || 0
      return acc + (d.amount - paid)
    }, 0)

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="heavy-border-b p-6">
        <Link
          to="/people"
          className="font-mono text-xs opacity-60 hover:opacity-100 inline-block mb-4"
        >
          ← BACK TO CONTACTS
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-3 border-ink">
              <AvatarFallback className="text-3xl font-black font-mono bg-paper text-ink">
                {person.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-black font-display tracking-tighter">
                {person.name}
              </h1>
              <div className="font-mono text-sm opacity-60 mt-2 space-x-4">
                {person.email && <span>{person.email}</span>}
                {person.phone && <span>{person.phone}</span>}
              </div>
            </div>
          </div>
          <Button className="heavy-border font-bold uppercase tracking-widest text-xs py-4 px-6">
            <Link to="/debts/new" search={{ personId: person.id }}>
              New Entry
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 heavy-border mb-8">
            <div className="p-6 heavy-border-b md:heavy-border-b-0 md:heavy-border-r border-ink bg-forest text-paper">
              <div className="font-mono text-xs opacity-70 mb-2">
                THEY OWE YOU
              </div>
              <div className="text-3xl font-black font-mono-tight">
                {formatCurrency(totalOwedToMe, 'USD')}
              </div>
            </div>
            <div className="p-6 heavy-border-b md:heavy-border-b-0 md:heavy-border-r border-ink bg-crimson text-paper">
              <div className="font-mono text-xs opacity-70 mb-2">
                YOU OWE THEM
              </div>
              <div className="text-3xl font-black font-mono-tight">
                {formatCurrency(totalIOwe, 'USD')}
              </div>
            </div>
            <div className="p-6 bg-ink text-paper">
              <div className="font-mono text-xs opacity-70 mb-2">
                NET POSITION
              </div>
              <div
                className={`text-3xl font-black font-mono-tight ${totalOwedToMe - totalIOwe >= 0 ? '' : ''
                  }`}
              >
                {totalOwedToMe - totalIOwe >= 0 ? '+' : ''}
                {formatCurrency(totalOwedToMe - totalIOwe, 'USD')}
              </div>
            </div>
          </div>

          <div className="heavy-border">
            <div className="heavy-border-b border-ink bg-ink p-4">
              <h2 className="font-mono text-xs font-bold text-paper">
                ENTRIES
              </h2>
            </div>
            {person.debts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="font-mono text-sm opacity-60 mb-2">
                  NO ENTRIES
                </div>
                <p className="text-muted-foreground text-sm">
                  No debt records with this contact.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-12 heavy-border-b border-ink bg-ink/10">
                  <div className="col-span-4 p-3 font-mono text-xs font-bold">
                    DESCRIPTION
                  </div>
                  <div className="col-span-2 p-3 font-mono text-xs font-bold">
                    TYPE
                  </div>
                  <div className="col-span-2 p-3 font-mono text-xs font-bold text-right">
                    AMOUNT
                  </div>
                  <div className="col-span-2 p-3 font-mono text-xs font-bold text-right">
                    REMAINING
                  </div>
                  <div className="col-span-2 p-3 font-mono text-xs font-bold text-center">
                    STATUS
                  </div>
                </div>
                {person.debts.map((debt: any, index: number) => {
                  const totalPaid =
                    debt.payments?.reduce(
                      (acc: number, p: any) => acc + p.amount,
                      0,
                    ) || 0
                  const remaining = debt.amount - totalPaid

                  return (
                    <div
                      key={debt.id}
                      className={`grid grid-cols-12 heavy-border-b border-ink ${index % 2 === 0 ? 'bg-white/30' : 'bg-ink/5'
                        } group`}
                    >
                      <div className="col-span-4 p-4">
                        <Link
                          to="/debts/$debtId"
                          params={{ debtId: debt.id }}
                          className="hover:underline"
                        >
                          <div className="font-bold truncate">
                            {debt.description || 'Unspecified'}
                          </div>
                          <div className="font-mono text-xs opacity-60 mt-1">
                            {new Date(debt.createdAt!).toLocaleDateString()}
                          </div>
                        </Link>
                      </div>
                      <div className="col-span-2 p-4 flex items-center">
                        <span
                          className={`font-mono text-xs uppercase px-2 py-1 ${debt.type === 'owed_to_me'
                            ? 'bg-forest/20 text-forest'
                            : 'bg-crimson/20 text-crimson'
                            }`}
                        >
                          {debt.type === 'owed_to_me'
                            ? 'Receivable'
                            : 'Payable'}
                        </span>
                      </div>
                      <div className="col-span-2 p-4 flex items-center justify-end font-mono-tight font-bold">
                        {debt.type === 'owed_to_me' ? '+' : '-'}
                        {formatCurrency(debt.amount, debt.currency)}
                      </div>
                      <div className="col-span-2 p-4 flex items-center justify-end font-mono text-sm">
                        {formatCurrency(remaining, debt.currency)}
                      </div>
                      <div className="col-span-2 p-4 flex items-center justify-center">
                        {debt.status === 'settled' ? (
                          <span className="font-mono text-xs uppercase bg-ink text-paper px-2 py-1">
                            Settled
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="font-mono text-xs uppercase py-1 px-2 hover:bg-ink hover:text-paper"
                            onClick={() => openPaymentModal(debt)}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {person.notes && (
            <div className="heavy-border mt-8">
              <div className="heavy-border-b border-ink bg-ink p-4">
                <h2 className="font-mono text-xs font-bold text-paper">
                  NOTES
                </h2>
              </div>
              <div className="p-6 bg-white/30">
                <p className="font-mono text-sm whitespace-pre-wrap">
                  {person.notes}
                </p>
              </div>
            </div>
          )}
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
