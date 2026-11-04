# T5 — every note matches what was measured

Commit: `docs(dashboard): correct the parity notes against the fresh numbers`.

## Context
`scripts/parity-dashboard-notes.ts` says every reason "was checked against the cached jar
output or DIVERGENCES.md". The issue asks to re-read the `network` row and the `¶` note
once `unknown` is re-measured. CLAUDE.md applies: a sentence saying *why* a row differs
needs a Java quote or jar output, and "not yet diagnosed" is an honest answer.

## Task
1. Write `measurements/note-audit.md` with one row for every `ROW_NOTES` entry, including the
   class texts: claim, evidence (a command and its output, jar output or a `file:line`
   quote), verdict (holds / corrected). Useful sources:
   `svg-conformance-census.ts <type> --families`, the survey's `parity-<type>.json`, the
   cached `in.svg`/`in.puml`, and `grep` over cached sources for counted claims.
2. Claims needing a specific check: `ditaa` writes a PNG; `network` is 1 description + 2
   legacy activity, with real nwdiag under `unknown`; `component` has four LaTeX fixtures;
   `usecase` has one malformed oracle; `board` fills `#D3D3D3` vs `#C0C0C0`; `c4`'s first
   difference; `state` layout matching "most" (T4's layoutEqual).
3. Correct every sentence that fails. Delete `ROW_NOTES.activity`: the row is conformant, so
   its entry is dead, as gantt, sequence and mindmap already have none. Update the tests
   that name it only if they break for that reason.
4. Preamble (`parity-dashboard.ts:267-298`): "the ratchet and census render through the
   low-level `renderFixture*` helpers" is stale: class, description, gantt, mindmap, salt,
   wbs and files reach `renderSync`. State which is which, from the helpers' own code. Add
   that class's ratchet and census also cover the 287 CLASS-routed `unknown` rows, which is
   why they exceed its oracle count.
5. Freshness section: add D5's sentence on measurement dates (DOT, survey, census) versus
   pin dates (ratchet, diff-baseline, routing, refusal, re-verified by `npm test`). No-engine
   rows show `—` by design.
6. `.agent-notes/pdg-T5.md`: object 35 pins vs 64 census (#115); oracle above corpus for files
   and json; anything else the audit turned up. Do not fix them here (D6).

## Write-set
`scripts/parity-dashboard-notes.ts`, `scripts/parity-dashboard.ts`,
`tests/unit/scripts/parity-dashboard.test.ts`, `docs/parity-report.md` (regenerated),
`plans/parity-dashboard-repair/measurements/note-audit.md`, `.agent-notes/pdg-T5.md`.

## Read-set
`scripts/parity-dashboard-notes.ts`, `scripts/parity-dashboard.ts:267-298,329-331`,
`tests/oracle/svg-conformance/render-fixture*.ts` (entry-point lines only), `DIVERGENCES.md`,
[D4](../decisions.md), [D5](../decisions.md), [D6](../decisions.md).

## Acceptance
- Given `note-audit.md`, then every `ROW_NOTES` entry and class text has a row with evidence
  and a verdict, and no verdict is blank.
- Given the regenerated report, then no sentence states a count disagreeing with its row:
  the activity note is gone and `unknown` reads its generated total.
- Given the Freshness section, then it states which dates are pins.
- Given `git diff --stat main -- src/`, then it is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
