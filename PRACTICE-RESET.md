# Instructor and patrol practice reset

The reset is off by default. No existing environment has been enabled or reset by implementing this feature.

## Isolated setup

Run a separate server process using a verified test app key as both `PIEZAS_API_KEY` and `PIEZAS_TEST_API_KEY`. Keep the normal shared app process and its settings unchanged. Configure these server-only settings for the separate process:

```text
SAFETY_PRACTICE_ENABLED=true
SAFETY_PRACTICE_APP_ID=<the test key's verified bound app UUID>
SAFETY_PRACTICE_NAMESPACE=<a new private lowercase identifier, 16-40 characters>
```

Use a unique namespace for each developer or independent practice environment, for example `raakin_` followed by 24 random lowercase hexadecimal characters. Do not reuse a teammate's namespace. The expected app ID is an explicit operator choice, not a value taken from the browser or guessed from a key prefix. Verify it using the published SDK's `whoami()` method. The existing local manifest test-app ID and the current test key were found to disagree; do not copy that manifest ID without verifying it. This implementation does not rewrite the manifest's app identity or rotate keys.

Save those three non-secret settings in ignored `.env.practice`. After building, `npm run practice` starts the separate practice instance on port 3102. It reads the existing test key without copying it, verifies the app binding before starting, and switches only the child server process to the test key. Ordinary `npm run dev` and `npm start` do not load `.env.practice`. No reset runs on startup.

The server checks actual SDK identity: test mode, a bound app ID equal to the configured expected app, the active key equal to the explicitly supplied test key, and an app different from the normal deployment. An invalid or incomplete practice setup returns an error; it never falls back to ordinary workflow records. Live keys fail even if their environment variable is named TEST. Browser request flags cannot enable practice.

The existing test app needs the previously provisioned synthetic accounts, member mappings, and child profiles. This feature does not create, activate, edit, or delete users. Authentication and instructor assignment restrictions still apply. Practice uses a separate namespace-specific HttpOnly session cookie, so signing in or out does not replace the normal app cookie, even on localhost. The separate process also uses its own port.

## What reset does

Signed-in instructors and patrollers see an isolated-practice banner and a confirmation control. Confirmation creates an audited session boundary through the existing Piezas SDK. No record is deleted.

- Workflow records use separate `practice_<namespace>_<kind>` entity types and session-prefixed record keys. Ordinary `safety_*` incidents, revisions, attendance, and pickup records are untouched.
- A new session has no incidents, search actions, headcounts, attendance, or heartbeat history. Old session data remains in its private namespace, and old incident links are refused in the active session.
- The practice roster shows the canonical Ava/Owen group 14 and Lily group 5 assignments and December 12, 2026 lesson date, using existing synthetic account mappings. This is a practice-only read overlay; it does not edit child profiles or shared group records. Medical details and contacts still come from the persisted child profiles.
- Practice time starts at 10:00 a.m. for headcount exercises. The real app continues to use real time.
- Audit records span practice sessions and the platform audit trail is retained. Reset must be audited successfully before a fresh session is activated.
- Old browser tabs cannot submit mutations into a new session: the server checks the current practice session against the submitted version and asks stale tabs to refresh. Requests already in progress remain confined to their original session.
- Practice does not create real family-notice tasks: the external-disclosure action is refused with an explanation. Existing tasks remain intact. The normal app's task workflow is unchanged.

The state visible after reset is clean; historical practice records still exist for accountability. Reloading does not reset a session. Normal saving and permissions are unchanged when practice is disabled.

## Verification

The practice browser checks use the base Playwright fixture rather than `tests/safety-fixtures.ts`, whose older setup clears complete collections. They write only into their own random practice namespace. No broad collection cleanup is needed or performed. Keep the namespace when finished if audit retention is required.
