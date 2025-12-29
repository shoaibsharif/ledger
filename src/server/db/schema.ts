import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table (single user for now)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Sessions table (for auth)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").unique().notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// People table
export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Debts table
export const debts = sqliteTable("debts", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  description: text("description"),
  type: text("type", { enum: ["owed_to_me", "i_owe"] }).notNull(),
  status: text("status", { enum: ["pending", "partial", "settled"] })
    .notNull()
    .default("pending"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Payments table
export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  debtId: text("debt_id")
    .notNull()
    .references(() => debts.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Relations
export const peopleRelations = relations(people, ({ many }) => ({
  debts: many(debts),
}));

export const debtsRelations = relations(debts, ({ one, many }) => ({
  person: one(people, {
    fields: [debts.personId],
    references: [people.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  debt: one(debts, {
    fields: [payments.debtId],
    references: [debts.id],
  }),
}));
