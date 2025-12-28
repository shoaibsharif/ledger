import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { zodValidator } from "@tanstack/zod-adapter";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { validateSession } from "../auth";
import { getDb } from "../db";
import { debts, payments } from "../db/schema";

async function authCheck() {
  const d1 = env.DB;
  const token = getCookie("session_token");
  if (!token) throw new Error("Unauthorized");
  const session = await validateSession(d1, token);
  if (!session) throw new Error("Unauthorized");
  return { d1, session };
}

export const recordPayment = createServerFn()
  .inputValidator(zodValidator(z.object({
    debtId: z.string(),
    amount: z.number(),
    paidAt: z.date().optional(),
    notes: z.string().optional()
  })))
  .handler(async ({ data }) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payments.ts:recordPayment-handler',message:'Server handler entered',data:{receivedData:data,paidAtType:typeof data.paidAt,paidAtValue:String(data.paidAt)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D,E'})}).catch(()=>{});
    // #endregion
    const { d1 } = await authCheck();
    const db = getDb(d1);
    const id = crypto.randomUUID();

    // Insert the payment (no transaction - D1 has issues with db.transaction())
    await db.insert(payments).values({
      id,
      ...data,
    });

    // Update debt status
    const debt = await db.query.debts.findFirst({
      where: eq(debts.id, data.debtId),
      with: { payments: true }
    });

    if (debt) {
      const totalPaid = debt.payments.reduce((acc, p) => acc + p.amount, 0);
      let status: "pending" | "partial" | "settled" = "partial";
      if (totalPaid >= debt.amount) {
        status = "settled";
      } else if (totalPaid === 0) {
        status = "pending";
      }

      await db.update(debts).set({ status }).where(eq(debts.id, data.debtId));
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/17bb0030-c9b7-4ca8-8601-8dba0f964744',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payments.ts:recordPayment-success',message:'Payment recorded successfully',data:{paymentId:id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return { id };
  });

export const deletePayment = createServerFn()
  .inputValidator(zodValidator(z.string()))
  .handler(async ({ data: id }) => {
    const { d1 } = await authCheck();
    const db = getDb(d1);

    // Find the payment first (no transaction - D1 has issues with db.transaction())
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, id)
    });

    if (!payment) return { success: false };

    const debtId = payment.debtId;
    await db.delete(payments).where(eq(payments.id, id));

    // Update debt status
    const debt = await db.query.debts.findFirst({
      where: eq(debts.id, debtId),
      with: { payments: true }
    });

    if (debt) {
      const totalPaid = debt.payments.reduce((acc, p) => acc + p.amount, 0);
      let status: "pending" | "partial" | "settled" = "partial";
      if (totalPaid >= debt.amount) {
        status = "settled";
      } else if (totalPaid === 0) {
        status = "pending";
      }

      await db.update(debts).set({ status }).where(eq(debts.id, debtId));
    }

    return { success: true };
  });
