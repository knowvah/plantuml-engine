# T3 — version string (maintainer ruling 2026-11-11)

**Context.** Our version string is our own text, not a jar mirror (issue #173). It prints on the `version`,
`about` and `authors` pages and as the error-page banner (`tests/helpers/error-diagram.ts` `ERROR_BANNER`).
`plantuml-engine` is 4 characters longer than `plantuml-ts`, so on those pages its `textLength` grows and, where it
is the widest line, page geometry can move. That is the ruling's consequence, not a regression — but only on pages
that print the string (README STOP 2).

**Task.**
1. `src/core/version.ts:18` (doc) and `:38` (`fullDescription`) → `plantuml-engine version …`.
2. `src/diagrams/version/PSystemVersion.ts:6,121-123,207` — strings and the ufp journal-row-24a comment (keep the
   citation; change the quoted name).
3. `tests/unit/version/PSystemVersion.test.ts`, `tests/helpers/error-diagram.ts` (`ERROR_BANNER`),
   `tests/oracle/svg-conformance/class-usecase-actor.test.ts:162`.
4. `oracle/goldens/svg-utility/authored-baseline.json` `fixtures[2]`, `[5]`, `[45]` reasons: the quoted
   `plantuml-ts version 0.2.0` / `plantuml-ts / 0.2.0` → the new text. If a row's measured score moved, re-measure
   it with the family's own tool (`build-authored-baseline` precedent:
   `plans/listsprite-factory-port/measurements/build-authored-baseline.mts`), and write before/after in the journal.
5. `DIVERGENCES.md:2030-2040` — the quoted output becomes `plantuml-engine version 0.2.0 / unknown [Unknown compile
   time]` (it also corrects the stale `0.1.0`).
6. Full `npm test`. For every red pin: confirm the fixture's own output contains the version string (STOP 2 if
   not), re-pin it, cite "issue #173 ruling 2026-11-11" in the pin's reason/comment. Never loosen a comparison.
7. Survey net: `npm run svg:survey` (alone, ~20 min, check `uptime` first), then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs b7ff5f5da` (copy into
   `plans/rename-plantuml-engine/measurements/` if paths need re-pointing). Lost conformant rows must be 0; any
   moved row must be a version-string page. Journal the counts.

**Write-set.** The files above; any baseline/pin whose fixture prints the version string; the survey's
`tests/oracle/svg-conformance/parity*.json` if rows moved (only version-string pages; restore stamp-only changes);
`PENDING`;
`docs/catalog.md` if drifted. `oracle/accepted-divergences.json` is **not** written (its two mentions are D2
`retired[]` records).
**Read-set.** `src/core/version.ts`; `src/diagrams/version/PSystemVersion.ts:100-210`;
`tests/oracle/svg-conformance/refusal-coverage-gate.ts` (uses `ERROR_BANNER`); `DIVERGENCES.md:2025-2045`.

**Acceptance criteria.**
- Given `@startuml\nversion\n@enduml`, when rendered through `renderSync`, then the SVG contains
  `plantuml-engine version 0.2.0` and no `plantuml-ts`.
- Given any syntax-error input, when rendered, then the banner starts `plantuml-engine version`, and every test that
  imports `ERROR_BANNER` passes.
- Given the full suite and the survey, then both are green / lost 0, and every changed pin belongs to a fixture whose
  output prints the version string (journal lists them).
- Given `git diff -- oracle/accepted-divergences.json`, then it is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
