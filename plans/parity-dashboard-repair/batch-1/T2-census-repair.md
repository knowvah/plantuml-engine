# T2 — the census agrees with the ratchets

Commit: `fix(census): measure what the sequence and gantt ratchets measure`.

## Context
Three measured defects, D3:
1. `scripts/svg-conformance-census.ts:399` filters only `--` tokens, so the `--json` value
   counts as a type. Every committed file reads `"type": "yaml+tests/oracle/...json"`.
2. The sequence case passes `classOptions()`. The ratchet passes `sequenceFixtureOptions()`
   (`render-fixture-sequence.ts:99-112`), which adds `filename: 'in.puml'` and
   `remoteImageFixtureStore()`. `tifube-59-tezo313` uses `%filename()` (21 diffs);
   `fifasu-62-pipo979` uses `<img:http://...>` (44 diffs).
3. gantt falls through `helperFor` to `description`, whose `renderFixtureDescription` takes
   no clock. `sakibi-88-zuci243` has a recorded clock (`oracle/capture-clock.json`; 640 diffs).
   The ratchet uses `renderFixtureGantt(..., ganttRenderOptions(slug))`.

Mechanisms 2 and 3 come from reading the code and fixture sources. The acceptance run
below is what confirms them.

## Task
- `censusTypeArgs(argv)`, pure, in `scripts/svg-conformance-census-json.ts`: positional
  types, excluding `--json` and its value. `main` uses it.
- Sequence case: spread `sequenceFixtureOptions()`, keeping the `clock` override.
- `helperFor('gantt') === 'gantt'`, with a case mirroring `gantt.golden.ratchet.test.ts:28`.
  `renderFixtureFor` needs the slug; pass it. The complexity hook caps CCN at 10 and params
  at 5: split the dispatch if it blocks, and do not change any other case.
- Bring the file's `Usage:` comment up to date. Do not add helpers for other types (D3).

## Write-set
`scripts/svg-conformance-census.ts`, `scripts/svg-conformance-census-json.ts`,
`tests/unit/scripts/svg-conformance-census.test.ts`.

## Read-set
`scripts/svg-conformance-census.ts:165-265,396-430`,
`tests/oracle/svg-conformance/render-fixture-sequence.ts:95-112`,
`tests/oracle/svg-conformance/render-fixture-gantt.ts:45-70`,
`tests/oracle/svg-conformance/gantt.golden.ratchet.test.ts:20-45`.

## Interface contract (T4 consumes)
`svg-conformance-census.ts <type> --json <path>` writes `{ type: '<type>', ... }`, other keys unchanged.

## Acceptance
- Given `['sequence', '--json', '/x/y.json']`, then `censusTypeArgs` returns `['sequence']`;
  given `['--json', '/x']`, then `[]`, so the default types apply.
- Given `'gantt'`, then `helperFor` returns `'gantt'`; all existing mappings are unchanged.
- Given a real census to a scratch directory
  (`node plans/parity-dashboard-repair/measurements/census-all.mjs /tmp/pdg-t2`), when
  `node plans/parity-dashboard-repair/measurements/pins-vs-census.mjs /tmp/pdg-t2` runs, then
  it reports **0 pinned rows nonzero**, with sequence zero-diff 1143 and gantt 254, and `type`
  is the plain bucket name.
- If any pin still reads nonzero, stop condition 3 applies.

Observability: N/A — no new observable operations. Rollback: Reversible.
