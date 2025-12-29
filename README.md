<p align="center">
   <img src="./public/logo.svg" width="120" alt="LEDGER logo" />
 </p>
 
 <h1 align="center">LEDGER</h1>
 
 <p align="center">
   A personal debt/expense ledger for tracking who owes what, recording payments, and seeing your net position.
 </p>
 
 ## What this is
 
 LEDGER is a small web app for tracking shared expenses and informal debts.
 
 You can record entries like:
 
 - **Receivable**: someone owes you money
 - **Payable**: you owe someone money
 
 Each entry can have one or more payments recorded against it until it is settled.
 
 ## What it does
 
 - **Dashboard**: summarizes assets, liabilities, and net position (grouped by currency)
 - **Entries**: create, view, update, and delete debt entries
 - **Payments**: record payments against an entry and track remaining balance
 - **Contacts**: manage people you track debts with
 - **Authentication**: simple session cookie auth with a single-user first-time registration flow
 
 ## Tech stack
 
 - **Runtime**: Cloudflare Workers + D1 (SQLite)
 - **Frontend**: React 19 + TanStack Router/Start + TanStack Form
 - **DB/ORM**: Drizzle ORM (SQLite)
 - **Styling**: Tailwind CSS v4
 - **Validation**: Zod
 - **Build**: Vite 7
 
 ## Local development
 
 ### Prerequisites
 
 - **Bun**: https://bun.sh
 - **Cloudflare Wrangler** (for D1 locally/remote): https://developers.cloudflare.com/workers/wrangler/
 
 ### Install
 
 ```bash
 bun install
 ```
 
 ### Apply migrations (local)
 
 ```bash
 bun run db:push:local
 ```
 
 ### Start dev server
 
 ```bash
 bun run dev
 ```
 
 App runs on `http://localhost:3000`.
 
 ## Tests, linting, formatting
 
 ```bash
 bun run test
 bun run lint
 bun run format
 bun run check
 ```
 
 ## Database (D1)
 
 This project uses a D1 binding named `DB` (see `wrangler.jsonc`).
 
 - **Apply migrations locally**: `bun run db:push:local`
 - **Apply migrations to production**: `bun run db:push:remote`
 
 Note: remote operations require a configured Cloudflare account and Wrangler authentication.
