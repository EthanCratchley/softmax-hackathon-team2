# Kestrel Kids Safety — Team 2

Next.js App Router, React, TypeScript and Tailwind CSS. This checkout is a frontend starter; role cards are build placeholders, not working business features. No credentials or account are needed to develop the frontend.

## Quick start

Install Node.js 24 LTS (the version in `.nvmrc`), then from your cloned repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Edits reload automatically. Commit `package-lock.json` whenever dependencies change so everyone installs the same versions.

On Windows PowerShell, if script execution is blocked, use `npm.cmd ci` and `npm.cmd run dev` (and `npx.cmd` in place of `npx`). No execution-policy changes are necessary.

## Team layout

- `app/page.tsx`: starter home page. Add role pages in `app/parent`, `app/instructor`, `app/desk`, `app/patrol` and `app/admin` as the team builds them.
- `app/layout.tsx`: shared page shell and metadata.
- `app/globals.css`: Tailwind import and shared styles.
- `components/`: create shared UI components here as needed.
- `lib/`: create frontend helpers and fictional fixtures here as needed.
- `tests/frontend.spec.ts`: independent frontend startup and phone layout check.
- `SPEC.md`: agreed product scope; business features are still to be built.

Use short feature branches and agree on shared components before editing the same files. The `@/` alias points to the repository root.

## Checks

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:frontend
```

The frontend test starts its own server on port 3100. The existing full-app smoke checks also expect backend features that are not implemented in this frontend starter; the focused frontend command does not claim those features work.

## Data and secrets

Use fictional data only. Do not add real child information, browser secrets, a local business database or provider credentials. Future backend work uses Piezas after the design is approved. Keep local secrets in ignored `.env.local`; no environment file is required for this starter. Never commit secrets or put the Piezas key in a public frontend setting.

## Updating your checkout

Pull your team's latest changes, run `npm ci` when the lockfile changes, then `npm run dev`. If port 3000 is busy, use `npm run dev -- --port 3001`.
