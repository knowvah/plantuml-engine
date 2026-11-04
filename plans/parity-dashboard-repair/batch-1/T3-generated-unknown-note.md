# T3 — generate the `unknown` note; clear dead labels

Commit: `fix(dashboard): generate the unknown shortfall from the survey`.

## Context
`scripts/parity-dashboard-notes.ts:111-117` hard-codes 260/109/96/49/6, and the survey now
measures 253. Nothing gates prose, and #113, #119 and #124 all move this row (D4).

## Task
- `parity-dashboard-inputs.ts`: `jarTagOf(head)`, pure, returning the `data-diagram-type`
  value, `'unsupported'` for `isJarUnsupportedPage`, or `'none'`. A loader tallies the
  tags of `unknown` survey rows whose verdict is not `conformant`, reading each `in.svg` by
  `readHead`. Rows with a missing or unreadable cache entry count as `none`.
- `parity-dashboard-notes.ts`: `unknownDetail(tally, registeredEngines)`, pure. Four groups:
  drawn imperfectly (lowercase tag in `registeredEngines`), no engine, no type tag,
  declined by PlantUML. Keep the note's wording, with the tags in each group listed
  count-descending, then by name. Omit an empty group.
- `notesSection` receives the generated detail. `RawInputs` and `ReportModel` carry what they
  need, and `ROW_NOTES.unknown` loses its hard-coded sentence. Keep the mark and class.
- Dead labels: delete `mindmap` and `gantt` from `NO_ENGINE_D_ID`
  (`parity-dashboard-matrix.ts:35-44`, both registered; grep first), and correct the comments
  saying "10 buckets", "none committed yet" (`parity-dashboard-inputs.ts:204`), and "all 14
  current registrations" (`:55`). Keep the `activity` entry until T5: it is cleared after T4
  re-measures the row.

## Write-set
`scripts/parity-dashboard.ts`, `scripts/parity-dashboard-inputs.ts`,
`scripts/parity-dashboard-notes.ts`, `scripts/parity-dashboard-matrix.ts`,
`tests/unit/scripts/parity-dashboard.test.ts`, `docs/parity-report.md` (regenerated).

## Read-set
The four scripts above, `tests/unit/scripts/parity-dashboard-jar-unsupported.test.ts`,
`tests/unit/scripts/parity-dashboard.test.ts:45-97,560-615`, [D4](../decisions.md).

## Interface contract (T5 consumes)
`notesSection` still returns the `### Why a row falls short` block, in the same class order.

## Acceptance
- Given `{DESCRIPTION: 2, NWDIAG: 3, none: 1, unsupported: 1}` and engines `['description']`,
  then the sentence states 7 in total, 2 drawn (DESCRIPTION 2), 3 no engine (NWDIAG 3),
  1 untagged and 1 declined, exactly.
- Given an empty tally, then no sentence is produced and the row's class text still renders.
- Given a head carrying `data-diagram-type="NWDIAG"`, then `jarTagOf` returns `'NWDIAG'`;
  the unsupported banner gives `'unsupported'`; neither gives `'none'`.
- Given the committed survey, then the regenerated sentence's total equals the row's
  structural + diverged count (asserted on disk, computed in the test, never a literal).

Observability: N/A — no new observable operations. Rollback: Reversible.
