import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { zodValidator } from '@tanstack/zod-adapter'
import { env } from 'cloudflare:workers'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { parseLocalDate, todayDateString } from '@/lib/date'
import { validateSession } from '../auth'
import { getDb } from '../db'
import { debts, payments, people } from '../db/schema'

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

async function authCheck() {
  const d1 = env.DB
  const token = getCookie('session_token')
  if (!token) throw new Error('Unauthorized')
  const session = await validateSession(d1, token)
  if (!session) throw new Error('Unauthorized')
  return { d1, session }
}

export const getDebts = createServerFn()
  .inputValidator(
    zodValidator(
      z
        .object({
          personId: z.string().optional(),
          status: z.enum(['pending', 'partial', 'settled']).optional(),
          type: z.enum(['owed_to_me', 'i_owe']).optional(),
        })
        .optional(),
    ),
  )
  .handler(async ({ data: params }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)

    return await db.query.debts.findMany({
      where: (debts, { and, eq }) => {
        const conditions = []
        if (params?.personId)
          conditions.push(eq(debts.personId, params.personId))
        if (params?.status) conditions.push(eq(debts.status, params.status))
        if (params?.type) conditions.push(eq(debts.type, params.type))
        return and(...conditions)
      },
      with: {
        person: true,
        payments: true,
      },
      orderBy: (debts, { desc }) => [desc(debts.createdAt)],
    })
  })

export const getDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        id: z.string(),
      }),
    ),
  )
  .handler(async ({ data: { id } }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)

    const debt = await db.query.debts.findFirst({
      where: (debts, { eq }) => eq(debts.id, id),
      with: {
        person: true,
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.paidAt)],
        },
      },
    })

    if (!debt) throw new Error('Debt not found')
    return debt
  })

export const createDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        personId: z.string(),
        amount: z.number(),
        currency: z.string(),
        description: z.string().optional(),
        type: z.enum(['owed_to_me', 'i_owe']),
        dueDate: dateString.optional(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    const id = crypto.randomUUID()
    const now = new Date()

    // Check if person already has a currency locked
    const person = await db.query.people.findFirst({
      where: eq(people.id, data.personId),
    })

    // Use person's locked currency, or save new currency if this is first entry
    const currency = person?.currency || data.currency

    // If this is first debt for person, lock their currency
    if (!person?.currency) {
      await db
        .update(people)
        .set({ currency, updatedAt: now })
        .where(eq(people.id, data.personId))
    }

    await db.insert(debts).values({
      id,
      personId: data.personId,
      amount: data.amount,
      currency, // Use locked currency
      description: data.description,
      type: data.type,
      status: 'pending',
      dueDate: data.dueDate ? parseLocalDate(data.dueDate) : undefined,
      createdAt: now,
      updatedAt: now,
    })
    return { id }
  })

export const updateDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        id: z.string(),
        personId: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(['owed_to_me', 'i_owe']).optional(),
        status: z.enum(['pending', 'partial', 'settled']).optional(),
        dueDate: dateString.optional(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    const { dueDate, ...rest } = data
    await db
      .update(debts)
      .set({
        ...rest,
        ...(dueDate !== undefined && { dueDate: parseLocalDate(dueDate) }),
        updatedAt: new Date(),
      })
      .where(eq(debts.id, data.id))
    return { success: true }
  })

export const deleteDebt = createServerFn()
  .inputValidator(zodValidator(z.string()))
  .handler(async ({ data: id }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    await db.delete(debts).where(eq(debts.id, id))
    return { success: true }
  })

export const getDashboardSummary = createServerFn().handler(async () => {
  const { d1 } = await authCheck()
  const db = getDb(d1)

  const results = await db
    .select({
      currency: debts.currency,
      type: debts.type,
      totalAmount: sql<number>`SUM(${debts.amount})`,
      paidAmount: sql<number>`SUM(COALESCE((SELECT SUM(${payments.amount}) FROM ${payments} WHERE ${payments.debtId} = ${debts.id}), 0))`,
    })
    .from(debts)
    .groupBy(debts.currency, debts.type)
    .all()

  const summary: Record<string, { owedToMe: number; iOwe: number }> = {}

  results.forEach((row) => {
    if (!summary[row.currency]) {
      summary[row.currency] = { owedToMe: 0, iOwe: 0 }
    }
    const remaining = Number(row.totalAmount) - Number(row.paidAmount)
    if (row.type === 'owed_to_me') {
      summary[row.currency].owedToMe += remaining
    } else {
      summary[row.currency].iOwe += remaining
    }
  })

  return summary
})

export const getMonthlyTrend = createServerFn().handler(async () => {
  const { d1 } = await authCheck()
  const db = getDb(d1)

  const results = await db
    .select({
      month: sql<string>`strftime('%Y-%m', ${debts.createdAt}, 'unixepoch')`,
      currency: debts.currency,
      type: debts.type,
      totalAmount: sql<number>`SUM(${debts.amount})`,
    })
    .from(debts)
    .groupBy(
      sql`strftime('%Y-%m', ${debts.createdAt}, 'unixepoch')`,
      debts.currency,
      debts.type,
    )
    .orderBy(sql`strftime('%Y-%m', ${debts.createdAt}, 'unixepoch')`)
    .all()

  // Key: currency -> month -> { owed, iOwe }
  const grouped: Record<
    string,
    Record<string, { owedToMe: number; iOwe: number }>
  > = {}

  results.forEach((row) => {
    if (!grouped[row.currency]) {
      grouped[row.currency] = {}
    }
    if (!grouped[row.currency][row.month]) {
      grouped[row.currency][row.month] = { owedToMe: 0, iOwe: 0 }
    }
    if (row.type === 'owed_to_me') {
      grouped[row.currency][row.month].owedToMe += Number(row.totalAmount)
    } else {
      grouped[row.currency][row.month].iOwe += Number(row.totalAmount)
    }
  })

  // Flatten to: Array<{ month, currency, owedToMe, iOwe }>
  const flatList: Array<{
    month: string
    currency: string
    owedToMe: number
    iOwe: number
  }> = []

  Object.entries(grouped).forEach(([currency, months]) => {
    Object.entries(months).forEach(([month, data]) => {
      flatList.push({
        month,
        currency,
        ...data,
      })
    })
  })

  return flatList.sort((a, b) => a.month.localeCompare(b.month))
})

export const increaseDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        debtId: z.string(),
        amount: z.number().positive(),
        paidAt: dateString.optional(),
        notes: z.string().optional(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)

    const debt = await db.query.debts.findFirst({
      where: eq(debts.id, data.debtId),
    })

    if (!debt) throw new Error('Debt not found')

    const paymentId = crypto.randomUUID()
    const now = new Date()

    await db.insert(payments).values({
      id: paymentId,
      debtId: data.debtId,
      amount: data.amount,
      paidAt: parseLocalDate(data.paidAt ?? todayDateString()),
      notes: data.notes,
      paymentType: 'adjustment',
    })

    await db
      .update(debts)
      .set({
        amount: debt.amount + data.amount,
        updatedAt: now,
      })
      .where(eq(debts.id, data.debtId))

    return { paymentId }
  })
