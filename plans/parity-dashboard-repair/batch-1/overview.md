# Batch 1 — repair the inputs

Run in order, in the main checkout. Each commit that changes the report regenerates
it (`npm run parity:dashboard`), or the D9 drift gate goes red.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-golden-families.md) | Map gantt, files and both `unknown` families; add the guard | typescript-pro | `parity-dashboard-goldens.ts`, its test, report | T0 | [x] |
| [T2](T2-census-repair.md) | Repair census argv, sequence options, gantt clock | typescript-pro | `svg-conformance-census{,-json}.ts`, its test | T0 | [x] |
| [T3](T3-generated-unknown-note.md) | Generate the `unknown` note; clear dead labels | typescript-pro | dashboard scripts, tests, report | T1 | [x] |

**Close:** the four gates, then `chore(pdg-b1): close batch 1`. T2 alone needs no report
regeneration: the census JSON is not rewritten until T4.
