# Batch 3 — close the ratchet, verify, hand over

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T8](T8-close-and-verify.md) | Delete `PENDING`, full verification, draft PR body, mission close | executor | `tests/architecture/legacy-name.test.ts`, `docs/catalog.md` (if drifted), `plans/rename-plantuml-engine/{pr-body.md,decision-journal.md}`, `.claude/memory/` status entry | T7b | [x] |

Close: every check in T8 green; README batch table ticked; journal close row. Do not push.
