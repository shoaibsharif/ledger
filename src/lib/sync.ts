import { storage } from './storage'
import type { Person, Debt, Payment } from './db'

const SYNC_INTERVAL = 5 * 60 * 1000

let syncIntervalId: ReturnType<typeof setInterval> | null = null
let isSyncing = false

export function startAutoSync() {
  if (typeof window === 'undefined') return

  if (syncIntervalId) {
    clearInterval(syncIntervalId)
  }

  syncIntervalId = setInterval(() => {
    syncAll()
  }, SYNC_INTERVAL)

  window.addEventListener('focus', onFocus)
  window.addEventListener('online', onReconnect)
}

export function stopAutoSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId)
    syncIntervalId = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', onFocus)
    window.removeEventListener('online', onReconnect)
  }
}

async function onFocus() {
  await syncAll()
}

async function onReconnect() {
  await syncAll()
}

export async function syncAll() {
  if (isSyncing) return
  isSyncing = true

  try {
    await Promise.all([syncPeople(), syncDebts(), syncPayments()])
    storage.setLastSync(new Date().toISOString())
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    isSyncing = false
  }
}

async function syncPeople() {
  try {
    const data = storage.get()
    const people = Object.values(data.people)
    storage.setPeople(people.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}))
  } catch (error) {
    console.error('Failed to sync people:', error)
  }
}

async function syncDebts() {
  try {
    const data = storage.get()
    const debts = Object.values(data.debts)
    const payments = Object.values(data.payments)

    const debtsMap = debts.reduce(
      (acc, d) => ({ ...acc, [d.id]: d }),
      {} as Record<string, Debt>,
    )
    const paymentsMap = payments.reduce(
      (acc, p) => ({ ...acc, [p.id]: p }),
      {} as Record<string, Payment>,
    )

    storage.setDebts(debtsMap)
    storage.setPayments(paymentsMap)
  } catch (error) {
    console.error('Failed to sync debts:', error)
  }
}

async function syncPayments() {
  try {
    const data = storage.get()
    const payments = Object.values(data.payments)
    storage.setPayments(
      payments.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
    )
  } catch (error) {
    console.error('Failed to sync payments:', error)
  }
}

export function getLocalPeople(): Person[] {
  return Object.values(storage.getPeople())
}

export function getLocalDebts(): Debt[] {
  return Object.values(storage.getDebts())
}

export function getLocalPayments(): Payment[] {
  return Object.values(storage.getPayments())
}

export function getLocalDebtWithDetails(
  debtId: string,
): (Debt & { person?: Person; payments: Payment[] }) | null {
  const debts = storage.getDebts()
  const people = storage.getPeople()
  const payments = storage.getPayments()

  const debt = debts[debtId]
  if (!debt) return null

  const person = debt.personId ? people[debt.personId] : undefined
  const debtPayments = Object.values(payments).filter(
    (p) => p.debtId === debtId,
  )

  return {
    ...debt,
    person,
    payments: debtPayments,
  }
}

export function getLocalPersonWithDebts(
  personId: string,
): (Person & { debts: Debt[] }) | null {
  const people = storage.getPeople()
  const debts = storage.getDebts()

  const person = people[personId]
  if (!person) return null

  const personDebts = Object.values(debts).filter(
    (d) => d.personId === personId,
  )

  return {
    ...person,
    debts: personDebts,
  }
}

export function isDataStale(): boolean {
  const lastSync = storage.getLastSync()
  if (!lastSync) return true

  const lastSyncDate = new Date(lastSync)
  const now = new Date()
  const hoursSinceSync =
    (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60)

  return hoursSinceSync > 24
}

export async function forceSync(): Promise<void> {
  await syncAll()
}
