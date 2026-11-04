# T4 — re-measure every bucket

Commit: `chore(oracle): re-measure survey, census and dot parity for all buckets`.
Body says: no `src/` change; the numbers moved because the artifacts were stale.

## Task
From a clean tree on the T3 commit, with `uptime` below ~10 and nothing else running:

```sh
git merge-base HEAD main                # note the sha as <base>
npm run svg:survey                      # 28 parity-<type>.json + parity.json; ~20 min
node plans/parity-dashboard-repair/measurements/census-all.mjs   # 28 census files; ~2 min
npx tsx scripts/dot-sync-report.ts --json tests/oracle/svg-conformance/dot-parity.json
npm run svg:dashboard                   # PARITY-SVG.md, last generated 2026-09-20
npm run parity:dashboard                # docs/parity-report.md
node plans/parity-dashboard-repair/measurements/verdict-diff.mjs <base>   # 1 on loss/fault
node plans/parity-dashboard-repair/measurements/pins-vs-census.mjs        # 1 on nonzero pin
git status --short   # only tests/oracle/svg-conformance/ and docs/parity-report.md
```

A `timeout` or `errored` verdict is a measurement fault: rerun that bucket alone with
`npm run svg:survey -- <type> --out tests/oracle/svg-conformance/parity-<type>.json`.

## Write-set
`tests/oracle/svg-conformance/parity*.json`, `census-*.json`, `dot-parity.json`,
`PARITY-SVG.md`, `docs/parity-report.md`.

## Read-set
[README.md](../README.md) measurement commands, [D3](../decisions.md), [D5](../decisions.md).

## Expected, from the 2026-11-03 trial

A difference with no lost row is a journal row with its mechanism, not a stop. Never adjust
a value toward this table.

| Row | survey | census 0-diff | ratchet | diff-baseline |
|---|---|---|---|---|
| activity | 449 / 0 / 0 (14 error) | 434 | 434 | 0 · 0 |
| class | 723 / 0 / 0 (3 error) | 1003 | 1003 | n/a |
| component | 215 / 13 / 38 | 214 | 214 | 15 · 42 |
| files | 9 / 0 / 0 | 9 | 9 | n/a |
| gantt | 265 / 0 / 0 (11 error) | 254 | 254 | 11 · 154 |
| mindmap | 142 / 0 / 0 (3 error) | 139 | 137 | 5 · 432 |
| object | 64 / 8 / 8 | 64 | 35 | n/a |
| salt | 51 / 0 / 0 (1 error) | 50 | 50 | 1 · 337 |
| sequence | 1143 / 0 / 0 | 1143 | 1143 | 0 · 0 |
| state | 114 / 15 / 144 (4 error) | 110 | 110 | n/a |
| unknown | 572 / 19 / 234 (25 error) | 546 | 160 | 0 · 0 |
| usecase | 70 / 8 / 15 | 70 | 70 | 6 · 4 |
| wbs | 204 / 0 / 0 (28 error) | 176 | 176 | 28 · 1070 |

The trial read sequence 1141 and gantt 253, before T2; 1143 and 254 are what T2 must produce.

## Acceptance
- Given the run, then `verdict-diff.mjs` reports 0 lost, 0 timeouts and 0 errored.
- Given the run, then `pins-vs-census.mjs` reports 0 pinned rows nonzero.
- Given the report, then activity reads `449 / 0 / 0` and carries no `§`; census cells read
  a number for every bucket with an engine, plus `unknown`.
- Given the report, then no-engine rows and chronology still print their `n/a` reason.
- Given the report, then the `unknown` note's total equals that row's structural + diverged.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the commit).
