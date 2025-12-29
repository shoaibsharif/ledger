import { AddPaymentModal } from '@/components/AddPaymentModal'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
  loader: async ({
    deps,
  }: {
    deps: {
      status?: 'pending' | 'partial' | 'settled'
      type?: 'owed_to_me' | 'i_owe'
    }
  }) => {
    return {
      debts: await getDebts({ data: { status: deps.status, type: deps.type } }),
    }
  },
  loaderDeps: ({ search: { status, type } }) => ({ status, type }),
  component: DebtsList,
})

function DebtsList() {
  const { debts } = Route.useLoaderData()
  const search = Route.useSearch()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<(typeof debts)[0] | null>(
    null,
  )

  const openPaymentModal = (debt: (typeof debts)[0]) => {
    setSelectedDebt(debt)
    setModalOpen(true)
  }

  const filterTabs = [
    { key: undefined, label: 'ALL' },
    { key: 'pending' as const, label: 'PENDING' },
    { key: 'partial' as const, label: 'PARTIAL' },
    { key: 'settled' as const, label: 'SETTLED' },
  ]

  const typeTabs = [
    { key: undefined, label: 'ALL TYPES' },
    { key: 'owed_to_me' as const, label: 'RECEIVABLE' },
    { key: 'i_owe' as const, label: 'PAYABLE' },
  ]

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="heavy-border-b p-6 flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="font-mono text-xs opacity-60 hover:opacity-100"
          >
            ← BACK
          </Link>
          <h1 className="text-4xl font-black font-display tracking-tighter mt-2">
            ENTRIES
          </h1>
        </div>
        <Button className="heavy-border font-bold uppercase tracking-widest text-xs py-4 px-6">
          <Link to="/debts/new">New Entry</Link>
        </Button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="font-mono text-xs mb-3 border-b border-ink pb-2">
              STATUS
            </div>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <Link
                  key={tab.key ?? 'all'}
                  to="/debts"
                  search={tab.key ? { status: tab.key } : {}}
                  className={`px-4 py-2 font-mono text-xs uppercase heavy-border transition-all ${
                    search.status === tab.key
                      ? 'bg-ink text-paper'
                      : 'hover:bg-ink hover:text-paper'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="font-mono text-xs mb-3 border-b border-ink pb-2">
              TYPE
            </div>
            <div className="flex flex-wrap gap-2">
              {typeTabs.map((tab) => (
                <Link
                  key={tab.key ?? 'all'}
                  to="/debts"
                  search={tab.key ? { type: tab.key } : {}}
                  className={`px-4 py-2 font-mono text-xs uppercase heavy-border transition-all ${
                    search.type === tab.key
                      ? 'bg-forest text-paper'
                      : 'hover:bg-forest hover:text-paper'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="heavy-border bg-paper">
            <Table>
              <TableHeader className="bg-ink hover:bg-ink">
                <TableRow className="hover:bg-ink border-b-0">
                  <TableHead className="w-[300px] text-paper">PARTY</TableHead>
                  <TableHead className="text-paper">TYPE</TableHead>
                  <TableHead className="text-right text-paper">AMOUNT</TableHead>
                  <TableHead className="text-right text-paper">STATUS</TableHead>
                  <TableHead className="text-center text-paper">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="p-12 text-center">
                        <div className="font-mono text-sm opacity-60 mb-2">
                          NO ENTRIES FOUND
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {search.status || search.type
                            ? 'Try adjusting your filters.'
                            : 'Your ledger is empty.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  debts.map((debt: any, index: number) => {
                    const totalPaid =
                      debt.payments?.reduce(
                        (acc: number, p: any) => acc + p.amount,
                        0,
                      ) || 0
                    const remaining = debt.amount - totalPaid

                    return (
                      <TableRow
                        key={debt.id}
                        className={`group ${
                           index % 2 === 0 ? 'bg-white/30' : 'bg-ink/5'
                        } hover:bg-ink/10 border-ink`}
                      >
                        <TableCell className="font-medium">
                          <Link
                            to="/debts/$debtId"
                            params={{ debtId: debt.id }}
                            className="hover:underline block"
                          >
                            <div className="font-bold truncate max-w-[200px] md:max-w-[300px]">
                              {debt.person?.name || 'Unknown'}
                            </div>
                            <div className="font-mono text-xs opacity-60 truncate max-w-[200px] md:max-w-[300px] mt-1">
                              {debt.description || '—'}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-mono text-xs uppercase px-2 py-1 ${
                              debt.type === 'owed_to_me'
                                ? 'bg-forest/20 text-forest'
                                : 'bg-crimson/20 text-crimson'
                            }`}
                          >
                            {debt.type === 'owed_to_me'
                              ? 'Receivable'
                              : 'Payable'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-mono-tight font-bold whitespace-nowrap">
                            {debt.type === 'owed_to_me' ? '+' : '-'}
                            {formatCurrency(debt.amount, debt.currency)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <div className="font-mono text-xs uppercase">
                              {debt.status}
                            </div>
                            {debt.status !== 'settled' && (
                              <div className="font-mono text-xs opacity-60 whitespace-nowrap">
                                {formatCurrency(remaining, debt.currency)} due
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {debt.status !== 'settled' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="font-mono text-xs uppercase py-1 px-2 hover:bg-ink hover:text-paper"
                              onClick={(e) => {
                                e.preventDefault()
                                openPaymentModal(debt)
                              }}
                            >
                              Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
