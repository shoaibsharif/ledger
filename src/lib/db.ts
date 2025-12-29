import { z } from 'zod'

export type Person = {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Debt = {
  id: string
  personId: string
  amount: number
  currency: string
  description?: string
  type: 'owed_to_me' | 'i_owe'
  status: 'pending' | 'partial' | 'settled'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type Payment = {
  id: string
  debtId: string
  amount: number
  paidAt: string
  notes?: string
  createdAt: string
}

export const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const debtSchema = z.object({
  id: z.string(),
  personId: z.string(),
  amount: z.number(),
  currency: z.string(),
  description: z.string().optional(),
  type: z.enum(['owed_to_me', 'i_owe']),
  status: z.enum(['pending', 'partial', 'settled']),
  dueDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const paymentSchema = z.object({
  id: z.string(),
  debtId: z.string(),
  amount: z.number(),
  paidAt: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
})

export type PersonInput = z.infer<typeof personSchema>
export type DebtInput = z.infer<typeof debtSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
