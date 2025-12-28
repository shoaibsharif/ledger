import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { zodValidator } from '@tanstack/zod-adapter'
import { env } from 'cloudflare:workers'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { validateSession } from '../auth'
import { getDb } from '../db'
import { debts, payments } from '../db/schema'

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
        dueDate: z.date().optional(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    const id = crypto.randomUUID()
    await db.insert(debts).values({
      id,
      ...data,
      status: 'pending',
    })
    return { id }
  })

export const updateDebt = createServerFn()
  .inputValidator(
    zodValidator(
      z.object({
        id: z.string(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(['owed_to_me', 'i_owe']).optional(),
        status: z.enum(['pending', 'partial', 'settled']).optional(),
        dueDate: z.date().optional(),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const { d1 } = await authCheck()
    const db = getDb(d1)
    await db
      .update(debts)
      .set({
        ...data,
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

  // Group by currency and type
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

  // Format into a more usable structure
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
