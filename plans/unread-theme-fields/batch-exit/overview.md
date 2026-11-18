# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | d.ts check, CHANGELOG, next-missions, final measure, summary | orchestrator | `CHANGELOG.md`, `planning/next-missions.md`, reports, README | T1a | [x] |

## T2

1. Run `npm run build` and `diff /tmp/utf-base-dts/plantuml-engine.d.ts dist/plantuml-engine.d.ts` (and
   `image-providers.d.ts`). It must show only the two removed members, plus comment lines attached to them (stop 5).
   Journal the diff.
2. Add the `CHANGELOG.md` entry under `## [Unreleased]` → `### Removed` (D3).
3. In `planning/next-missions.md:302`, strike follow-on 1 the way earlier items are struck (`~~…~~ — **done by utf
   (date, `unread-theme-fields/pre-squash`, #156)**`). Add a short "unread-theme-fields (utf)" section: what landed and
   any issue filed.
4. Run the batch close, including the every-engine survey and `verdict-diff.mjs <base>`. Then write the README's
   `## Summary` (tasks, gates, verdicts base → exit, d.ts diff, follow-ons, CI risk), following
   `plans/version-builtin/README.md`.

## Acceptance
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 movers in every engine.
- Given the d.ts snapshot, when diffed, then the only removed lines are the two members (and their comments) and no
  line is added.
- Given `CHANGELOG.md`, then `### Removed` under `[Unreleased]` names both members and #156.

Observability is N/A. Rollback is Reversible.
