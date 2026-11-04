# T8 — measure the buckets

Commit: `chore(oracle): measure the buckets the capture grew`. Body: no `src/` change; the rows are new, not regressions.

## Task
From a clean tree, `uptime` below ~10, nothing else running. `<base>` is the mission base sha in the execution prompt.

```sh
node plans/oracle-gap-capture/measurements/measure-buckets.mjs survey
node plans/oracle-gap-capture/measurements/measure-buckets.mjs census
npm run svg:dashboard
npm run parity:dashboard
node plans/oracle-gap-capture/measurements/verdict-diff.mjs <base>
node plans/oracle-gap-capture/measurements/pins-vs-census.mjs
node plans/oracle-gap-capture/measurements/new-rows.mjs <base> tests/oracle/svg-conformance plans/oracle-gap-capture/measurements/new-rows.json
```

Save the last command's table as `measurements/new-rows.md`. A `timeout` or `errored` verdict is a measurement fault:
rerun that bucket alone with `npm run svg:survey -- <type> --out tests/oracle/svg-conformance/parity-<type>.json`.

Then correct the page:

- **Notes:** the hand-written row notes in `scripts/parity-dashboard-notes.ts` for activity, class, sequence, state, object,
  dot, hcl, yaml and timing, against measured numbers (`unknown`'s is generated). Evidence goes in `measurements/note-audit.md`.
  The activity note must say the fall is 429 newly measured rows, not a regression.
- **Corpus against oracle:** one sentence in the report's matrix preamble: `corpus` counts manifest rows, which
  `classify-corpus.ts` guessed, while `oracle` counts cached rows, placed by the jar's type, so they differ. A count line for
  manifest rows with an oracle and with a recorded reason, from `oracleCoverage`. Tests in
  `tests/unit/scripts/parity-dashboard.test.ts` move with it.
- `npm run parity:dashboard` again.

## Expected, from the 2026-11-03 trial, new rows only

A difference with no lost row is a journal row with its mechanism, not a stop. Never adjust a value toward this table. `xobebi-29-jilu859`
is not in it.

| Cohort | conformant | of which error page | structural | diverged | total |
|---|---:|---:|---:|---:|---:|
| activity, legacy `(*)` | 0 | 0 | 0 | 114 | 114 |
| activity, other | 145 | 0 | 37 | 133 | 315 |
| class | 108 | 0 | 20 | 23 | 151 |
| dot | 55 | 8 | 2 | 0 | 57 |
| hcl | 7 | 0 | 5 | 0 | 12 |
| object | 1 | 0 | 0 | 0 | 1 |
| sequence | 84 | 0 | 5 | 4 | 93 |
| state | 11 | 0 | 0 | 15 | 26 |
| timing | 0 | 0 | 0 | 19 | 19 |
| unknown, DESCRIPTION | 77 | 0 | 2 | 52 | 131 |
| unknown, jar errors | 66 | 66 | 0 | 26 | 92 |
| yaml | 0 | 0 | 4 | 0 | 4 |
| **Total** | **554** | **74** | **75** | **386** | **1015** |

## Write-set
`tests/oracle/svg-conformance/parity-*.json`, `census-*.json`, `PARITY-SVG.md`, `docs/parity-report.md`,
`scripts/parity-dashboard*.ts`, `tests/unit/scripts/parity-dashboard.test.ts`, `measurements/new-rows.{json,md}`, `measurements/note-audit.md`.

## Read-set
[D2, D7](../decisions.md), `scripts/parity-dashboard-notes.ts`, `plans/parity-dashboard-repair/measurements/note-audit.md` for the shape.

## Interface contracts
Output to T9: `measurements/new-rows.json`, `{bucket, slug, cohort, verdict, firstDiff}[]`.

## Acceptance
- Given the survey, when `verdict-diff.mjs <base>` runs, then it exits 0: no row left conformant, no timeout or errored verdict.
- Given the census, when `pins-vs-census.mjs` runs, then it exits 0.
- Given `new-rows.mjs`, then no cohort reads `UNOWNED`, and the total equals the capture report's fixture count.
- Given the report, then each note matches its measured numbers, with evidence in `note-audit.md`.

Observability: N/A — no new observable operations. Rollback: Reversible.
