# Batch 2: rows and accounting

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | Re-pin the three license rows with a reason true today | orchestrator | `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts`, `oracle/goldens/svg-utility/authored-baseline.json` | T1 | [x] |
| T2b | Sign the rows in the ledger; add the `DIVERGENCES.md` entry | orchestrator | `oracle/accepted-divergences.json`, `DIVERGENCES.md` | T2a | [x] |

Run T2a then T2b, serially (T2b quotes T2a's numbers). Specs: [T2a-authored-rows.md](T2a-authored-rows.md),
[T2b-ledger-divergences.md](T2b-ledger-divergences.md). Close with the task contract's "Batch close".
