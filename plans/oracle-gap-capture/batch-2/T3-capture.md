# T3 — capture to the stage

No commit: `test-results/ogc-stage/` is gitignored (`test-results/*`). Journal the result.

## Task
With `uptime` below ~10 and nothing else running:

```sh
npx jiti scripts/capture-missing-oracles.ts --stage test-results/ogc-stage
node plans/oracle-gap-capture/measurements/check-route.mjs test-results/ogc-stage/capture-report.json
git status --short   # must show nothing new; a stray svek.* means the cwd handling is wrong
```

About 50 minutes: 825 rows took 30 in 2026-09. A killed run resumes from the report.

`check-route.mjs` exiting 1 is a push-forward, not a stop, unless the jar stopped working. The jar is
deterministic under `PLANTUML_DETERMINISTIC_TEXT`, so a moved row has a mechanism: find it and journal it.

## Expected, from the 2026-11-03 trial

Never adjust a value toward this table.

| Bucket | rows | jar type in the trial |
|---|---:|---|
| activity | 429 | all ACTIVITY |
| unknown | 223 | 131 DESCRIPTION, 68 error pages, 24 no type |
| class | 151 | all CLASS |
| sequence | 94 | 93 SEQUENCE plus `xobebi-29-jilu859`, first page expected SEQUENCE |
| dot | 57 | 49 no type, 8 error pages |
| state | 26 | all STATE |
| timing | 19 | all TIMING |
| hcl | 12 | all HCL |
| yaml | 4 | all YAML |
| object | 1 | CLASS |

If `xobebi-29-jilu859` is SEQUENCE, the row counts in later tables rise by 1 in `sequence`.

## Write-set
`test-results/ogc-stage/` only.

## Read-set
[D2, D4](../decisions.md), `measurements/trial-rows.json`.

## Acceptance
- Given the run, when `check-route.mjs` finishes, then its count of differing rows is journaled with each
  mechanism, and every differing row is either placed by D2 or in `oracle/no-oracle-reasons.json`.
- Given the stage, then each of the 10 bucket directories holds the rows the report assigns it.

Observability: N/A — no new observable operations. Rollback: Reversible (delete the stage).
