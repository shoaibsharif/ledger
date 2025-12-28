import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { sessions, users } from "./db/schema";

export async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function createSession(d1: D1Database) {
  const db = getDb(d1);
  const token = crypto.randomUUID();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

  await db.insert(sessions).values({
    id,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function validateSession(d1: D1Database, token: string) {
  const db = getDb(d1);
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function deleteSession(d1: D1Database, token: string) {
  const db = getDb(d1);
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getUserByEmail(d1: D1Database, email: string) {
  const db = getDb(d1);
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function createUser(d1: D1Database, email: string, password: string) {
  const db = getDb(d1);
  const id = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id,
    email,
    password: hashedPassword,
  });

  return { id, email };
}

export async function userExists(d1: D1Database) {
  const db = getDb(d1);
  const user = await db.query.users.findFirst();
  return !!user;
}
