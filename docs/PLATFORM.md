# Platform handoff (Dev 1 → Parent, Instructor/Patrol, Desk/Admin)

## The rule

Pages and server actions get the user from `requireUser()` and call `services.*`.
Never read a role, user id, parent id or instructor id from the browser.

```tsx
// app/desk/page.tsx (server component)
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';

export default async function DeskPage() {
  const user = await requireUser('desk');            // redirects if not signed in / wrong role
  const roster = await services.getDeskRoster(DEMO_LESSON_DATE, user);
  if (!roster.ok) return <p role="alert">{roster.error.message}</p>;
  return <ul>{roster.data.map((c) => <li key={c.childId} data-testid={`desk-row-${c.childId}`}>{c.firstName}</li>)}</ul>;
}
```

```ts
// a server action (writes)
'use server';
export async function releaseChild(childId: string, adultId: string, idChecked: boolean) {
  const user = await requireUser('desk');
  return services.recordPickup(childId, adultId, idChecked, DEMO_LESSON_DATE, user);
  // → { ok: true, data } | { ok: false, error: { code, message, fields? } }
}
```

Error codes: `not_found` (missing, or not yours — show "Not found"), `forbidden`,
`invalid` (show `error.fields[path]` beside the input), `blocked` (business rule —
show `error.message`, e.g. "Release blocked: call patrol").

## Files

| File | What |
| --- | --- |
| `lib/services/contract.ts` | Every service function and its types. **The contract.** |
| `lib/domain/types.ts` | Entities and role-specific view types. |
| `lib/domain/rules.ts` | Phone validation, completeness, escalation time, safety alerts. Reuse in forms for instant feedback; the server re-checks. |
| `lib/fixtures.ts` | Seed data and stable IDs (`CHILD_IDS.ava`, `USER_IDS.desk`, …). |
| `lib/services/mock.ts` | The authorization and business logic. Runs over records loaded from Piezas (`lib/services/record-store.ts`); only changed records are written back. |
| `app/globals.css` | Shared classes: `.page .card .field .button(.primary/.danger) .alert(.warn/.ok) .badge`. Tap targets are 48px. |

Want a change to the contract? Ask Ethan first — don't edit `lib/` on your branch.

## Demo accounts (all fictional)

Each account has its own password. Ask Ethan for the `.env` values (`PIEZAS_API_KEY`,
`PIEZAS_API_URL`, `PIEZAS_TEST_API_KEY`, `DEMO_ACCOUNT_SECRET`), then run
`npm run demo:accounts` to print every account's password. Never commit `.env`.

| Email | Role | Notes |
| --- | --- | --- |
| priya.shah@example.test | Parent | Ava (Story A) |
| dana.whitfield@example.test | Parent | Lily (Story B) |
| ngozi.okafor@example.test | Parent | Owen (Story C) |
| leila.haddad@example.test | Parent | Noor, Mateo, Ella |
| jordan.lee@example.test | Instructor | Group 14: Ava, Owen, Ella |
| sam.rivera@example.test | Instructor | Group 9: Lily, Noor, Mateo (the "unrelated instructor" for Ava) |
| casey.morgan@example.test | Desk | |
| rob.fournier@example.test | Patrol | |
| hana.sato@example.test | Admin | |

Lesson day for every story: `DEMO_LESSON_DATE` = 2026-12-12. Lily is already checked in;
her uncle Mark Whitfield (`ADULT_IDS.lilyUncle`) is on her list but inactive.

Data lives in Piezas. Local dev (`npm run dev`) uses the TEST copy (`PIEZAS_TEST_API_KEY`), never live data.
`npm run seed` resets the TEST copy to these fixtures. No key yet? Put
`KESTREL_DATA=mock` in `.env` to work on screens against in-memory data
(resets on restart; never used in production).

## Tests

`npm run test:unit` — service authorization and rules (no network).
`npx playwright test tests/integration` — saves and reads through the Piezas test copy.
Scenario tests go in `tests/scenarios/S-xxx-<name>.spec.ts`, selecting by `data-testid`.
