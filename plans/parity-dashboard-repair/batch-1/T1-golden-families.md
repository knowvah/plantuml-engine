# T1 — every golden family is shown, and a new one cannot be missed

Commit: `fix(dashboard): show gantt, files and all unknown pins`.

## Context
`scripts/parity-dashboard-goldens.ts:14-43` maps a bucket to one family. gantt and files
are absent, so they print `n/a (no ratchet yet)`. `unknown` reads only `svg-utility` (15
pins) while `svg-description/ratchet.json` holds 145 more with `type: 'unknown'`.

## Task
Implement [D1](../decisions.md) and [D2](../decisions.md):
- Change both maps to `Readonly<Record<string, readonly string[]>>`. Add
  `gantt: ['svg-gantt']` and `files: ['svg-files']` to the ratchet map,
  `gantt: ['svg-gantt']` to the diff-baseline map, and
  `unknown: ['svg-utility', 'svg-description']` to both. svg-files has no diff-baseline.
- `loadRatchetByType`/`loadDiffBaselineByType` sum the per-family summaries and keep the
  newest date. `ratchetPinsOf`/`diffBaselineStatsOf` stay per-family and unchanged.
- A missing `diff-baseline.json` is still skipped (`existsSync`, line 112). Return
  `undefined` for a bucket whose families have none, so the cell stays `no diff-baseline yet`.
- Export `NON_BUCKET_FAMILIES` (family→reason) and `unmappedGoldenFamilies(goldensDir)`.

## Write-set
`scripts/parity-dashboard-goldens.ts`, `tests/unit/scripts/parity-dashboard-goldens.test.ts`
(new), `docs/parity-report.md` (regenerated).

## Read-set
`scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-matrix.ts:158-166`,
`tests/unit/scripts/parity-dashboard.test.ts:449-484`, [decisions.md](../decisions.md) D1, D2.

## Interface contract (T3 and T4 consume)
`loadRatchetByType` and `loadDiffBaselineByType` keep their return types:
`Record<string, RatchetSummary>` and `Record<string, DiffBaselineSummary>`.

## Acceptance
Build goldens in a temp directory; do not assert on-disk counts, which later missions move.
- Given a type mapped to two families, when `loadRatchetByType` runs, then `count` is the
  sum and `addedAt` the newest.
- Given a shared family, then only rows of that `type` count; given an untyped family, all do.
- Given `svg-newtype/ratchet.json` in a temp goldens dir, then `unmappedGoldenFamilies`
  returns `['svg-newtype']`; the same for a family holding only a `diff-baseline.json` or
  only an `authored-baseline.json`.
- Given a mapped ratchet family that gains a `diff-baseline.json` absent from the
  diff-baseline map, then it is returned.
- Given the real `oracle/goldens`, then `unmappedGoldenFamilies` returns `[]`.
- After regeneration, the report reads gantt `254` and `11 · 154`, files `9`, unknown `160`.

Observability: N/A — no new observable operations. Rollback: Reversible.
