import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { validateSession } from "../auth";
import { getDb } from "../db";
import { people } from "../db/schema";

async function authCheck() {
  const d1 = env.DB;
  const token = getCookie("session_token");
  if (!token) throw new Error("Unauthorized");
  const session = await validateSession(d1, token);
  if (!session) throw new Error("Unauthorized");
  return { d1, session };
}

export const getPeople = createServerFn()
  .handler(async () => {
    const { d1 } = await authCheck();
    const db = getDb(d1);
    return await db.query.people.findMany({
      orderBy: (people, { desc }) => [desc(people.createdAt)],
    });
  });

export const getPerson = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const { d1 } = await authCheck();
    const db = getDb(d1);
    return await db.query.people.findFirst({
      where: eq(people.id, id),
      with: {
        debts: {
          with: {
            payments: true
          }
        },
      },
    });
  });

export const createPerson = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    name: z.string(),
    email: z.email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { d1 } = await authCheck();
    const db = getDb(d1);
    const id = crypto.randomUUID();
    await db.insert(people).values({
      id,
      ...data,
    });
    return { id };
  });

export const updatePerson = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string(),
    name: z.string(),
    email: z.email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { d1 } = await authCheck();
    const db = getDb(d1);
    await db.update(people).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(people.id, data.id));
    return { success: true };
  });

export const deletePerson = createServerFn({ method: 'POST' })
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const { d1 } = await authCheck();
    const db = getDb(d1);
    await db.delete(people).where(eq(people.id, id));
    return { success: true };
  });
