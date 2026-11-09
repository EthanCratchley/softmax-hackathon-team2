# Raakin: instructor and patrol handoff

This branch is scoped to instructor and patrol, plus shared backend initialization. It is a partial team build, not the final integrated application.

## Included

- Instructor roster, assigned-group alerts, headcounts, and missing-child reports.
- Patrol incident list, radio reports, audited emergency packets, action timeline, and located/closed transitions.
- Shared Piezas client, models, sign-in/session handling, role checks, synthetic account and record setup, and incident persistence.
- Existing shared assignment reader and heartbeat data remain compatible with platform integration.
- Patrol's emergency-disclosure action still creates the required family-notice task; this is part of the incident workflow.

## Other developers' work

Parent, desk, pickup, and admin screens are excluded from this branch. Their backend mutations and email delivery implementation are also excluded. Other roles can sign in but see a team-integration notice; this branch does not implement their workflows.

Two local Git stashes preserve the previous implementation, including untracked files:

- `d928e6fd658e47789168ba2bd491ef011412350b`: parent/desk/admin/pickup screens and the original combined workspace component.
- `1da3c7ab6299e488c2e3eab6e11e03bf67de505e`: full shared workflow service and email delivery module.

These backups are local, not on the remote. Do not apply the whole stash over this branch: recover individual files into a separate integration checkout and reconcile them with Ethan, Anthony, and Noah. The original service and workspace were untracked files, so they are in the stash's third parent (`<stash hash>^3:<path>`).

## Team integration

Ethan owns the final shared service contract, schema, authentication, account setup, and deployment. Reconcile the shared initialization with his platform branch before merging. Keep the instructor/patrol handlers when composing the final shared API; do not replace teammates' parent/desk/admin handlers with this scoped service.

The complete team specification and its tests are retained unchanged. Tests requiring parent, desk, or admin screens will need the corresponding branches integrated. Run the full safety suite and quality scan after integration, before publishing. No existing acceptance check has been removed or weakened.

Useful focused check for this branch:

```powershell
node --env-file=.env node_modules/@playwright/test/cli.js test --grep 'S-006|S-015|S-018|S-021|S-022|S-037|S-038|scoped build|scoped services'
```

This focused check is not a replacement for the team's full acceptance run.

Verification during scope isolation: production build and TypeScript checks passed; eight existing instructor/patrol browser checks passed. The existing combined lunch check passed its instructor assertions and then failed when it reached the intentionally excluded desk workspace. A separate scoped lunch check retains the instructor assertions without changing that team acceptance test.
