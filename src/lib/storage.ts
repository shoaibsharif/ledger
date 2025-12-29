import type { Person, Debt, Payment } from './db'

const STORAGE_KEY = 'ledger-data'

export type LedgerData = {
  people: Record<string, Person>
  debts: Record<string, Debt>
  payments: Record<string, Payment>
  lastSync: string | null
}

function getStorage(): LedgerData {
  if (typeof window === 'undefined') {
    return { people: {}, debts: {}, payments: {}, lastSync: null }
  }
  const storage = localStorage.getItem(STORAGE_KEY)
  if (!storage) {
    return { people: {}, debts: {}, payments: {}, lastSync: null }
  }
  try {
    return JSON.parse(storage)
  } catch {
    return { people: {}, debts: {}, payments: {}, lastSync: null }
  }
}

function saveStorage(data: LedgerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const storage = {
  get(): LedgerData {
    return getStorage()
  },

  set(data: LedgerData) {
    saveStorage(data)
  },

  getPeople(): Record<string, Person> {
    return getStorage().people
  },

  getDebts(): Record<string, Debt> {
    return getStorage().debts
  },

  getPayments(): Record<string, Payment> {
    return getStorage().payments
  },

  setPeople(people: Record<string, Person>) {
    const storage = getStorage()
    storage.people = people
    saveStorage(storage)
  },

  setDebts(debts: Record<string, Debt>) {
    const storage = getStorage()
    storage.debts = debts
    saveStorage(storage)
  },

  setPayments(payments: Record<string, Payment>) {
    const storage = getStorage()
    storage.payments = payments
    saveStorage(storage)
  },

  addPerson(person: Person) {
    const storage = getStorage()
    storage.people[person.id] = person
    saveStorage(storage)
  },

  updatePerson(id: string, updates: Partial<Person>) {
    const storage = getStorage()
    if (storage.people[id]) {
      storage.people[id] = { ...storage.people[id], ...updates }
      saveStorage(storage)
    }
  },

  deletePerson(id: string) {
    const storage = getStorage()
    delete storage.people[id]
    saveStorage(storage)
  },

  addDebt(debt: Debt) {
    const storage = getStorage()
    storage.debts[debt.id] = debt
    saveStorage(storage)
  },

  updateDebt(id: string, updates: Partial<Debt>) {
    const storage = getStorage()
    if (storage.debts[id]) {
      storage.debts[id] = { ...storage.debts[id], ...updates }
      saveStorage(storage)
    }
  },

  deleteDebt(id: string) {
    const storage = getStorage()
    delete storage.debts[id]
    saveStorage(storage)
  },

  addPayment(payment: Payment) {
    const storage = getStorage()
    storage.payments[payment.id] = payment
    saveStorage(storage)
  },

  updatePayment(id: string, updates: Partial<Payment>) {
    const storage = getStorage()
    if (storage.payments[id]) {
      storage.payments[id] = { ...storage.payments[id], ...updates }
      saveStorage(storage)
    }
  },

  deletePayment(id: string) {
    const storage = getStorage()
    delete storage.payments[id]
    saveStorage(storage)
  },

  setLastSync(date: string) {
    const storage = getStorage()
    storage.lastSync = date
    saveStorage(storage)
  },

  getLastSync(): string | null {
    return getStorage().lastSync
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
