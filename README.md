# Kestrel Kids Safety

Instructor/patrol practice reset is optional and disabled in normal mode. See [safe practice setup](PRACTICE-RESET.md) for the separate test instance and preserved history.

> This branch contains Raakin's instructor/patrol experiences and shared backend setup. Parent, desk, pickup, and admin workflows described below belong to the final integrated team app and are not included in this branch. See [the handoff](INSTRUCTOR-PATROL-HANDOFF.md) for scope, recovery backups, and integration guidance.

Next.js application backed by the published Piezas SDK. Business records, accounts, audit events, background jobs, emails, and follow-up tasks live in Piezas. No local business database is used.

## Run locally

Use Node 24 or newer, install dependencies with `npm ci`, and link the existing application with `npx piezas init`. The ignored `.env` file needs `PIEZAS_API_KEY`, `PIEZAS_API_URL`, and `PIEZAS_USERS_URL` (`https://api.piezas.ai/users`). Keys stay on the server.

Run `node --experimental-strip-types scripts/setup-safety.ts --live` once to provision fictional demo accounts and records. It is safe to repeat and does not overwrite saved child details. The generated demo password stays in ignored `.env.demo-users`; no credentials are stored in entity records. Accounts are `parent@example.test`, `parent-lily@example.test`, `parent-owen@example.test`, `instructor@example.test`, `instructor-other@example.test`, `desk@example.test`, `patrol@example.test`, and `admin@example.test`. These are fictional accounts, not working email inboxes.

Run `npm run dev` and open http://localhost:3000. Sign in as the appropriate fictional account. There is no role switcher. Use the lesson day December 12, 2026 for the fictional roster. Headcounts follow the actual Vancouver lesson time; the production app has no browser-controlled clock.

## Safety workflows

- Parents edit only their own linked children, including emergency contacts, medical answers, pickup adults, clothing, address, and consent. Blank medical answers remain incomplete.
- Instructors see their assigned roster and limited safety alerts, confirm headcounts, and report a missing child.
- Desk staff search names and groups, record check-in and bibs, refuse unauthorized pickup, and release once after checking an authorized adult's photo ID. Open incidents block release.
- Patrol can create incidents from radio calls, open audited emergency packets, record actions, locate children, and close incidents. Emergency disclosure creates Hana's mailing task.
- Hana sees missing fields and operational counts, assigns groups of at most six, adds corrections, and opens private details only with a recorded reason.
- One-day pickup links expose only first name, pickup place/time, and the named adult. Cancellation and expiry prevent pickup authorization.

Check-in/release emails run after the desk response using durable records and Piezas jobs. Delivery uses an idempotency key, and subsequent staff activity recovers interrupted work and refreshes delivery status. Failed alerts appear for Hana. Reports of missing children do not send family messages. Staff still make emergency calls themselves.

## Verification

`node --experimental-strip-types scripts/setup-safety.ts` prepares only the separate test app, using `PIEZAS_TEST_API_KEY`. Test credentials stay in ignored `.env.test-users`. Browser fixtures reset fictional records in that test app only. A test clock is read from test-app records only when the active key exactly matches the separate test key; it is unavailable through the application API.

Run `npm run typecheck`, `npm run build`, `npx piezas doctor`, the quality scan, and finally `npx piezas test`. On PowerShell systems that block scripts, use `npm.cmd`/`npx.cmd`. Playwright uses installed Chrome by default; `PW_BROWSER_CHANNEL` selects another installed browser. The previous unauthenticated design-only tests are retained separately and replaced in the working app's suite by signed-in checks for every approved journey.

Actual receipt of check-in/release messages still needs a real parent test inbox. A successful send response alone is not proof that mail arrived. The email-failure test uses a genuine unavailable parent account lookup, with no SDK or network mocks.

The production build uses Next's standalone output. Never deploy real child data based solely on this fictional demonstration; follow the launch requirements in SPEC.md.
