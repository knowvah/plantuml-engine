# Batch 2: diagnose and name the 9

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-empty-container-rows.md) | `hcl/function-call`, `hcl/for-expression-empty-array`: D4 proof; fix or name | orchestrator or one `typescript-pro` | `DIVERGENCES.md`; `src/diagrams/{json,hcl}/*` + tests only if a port defect | T1 | [x] |
| [T2b](T2b-subpixel-rows.md) | `hcl/array-values`, `hcl/multiple-top-level-blocks`, `hcl/nested-object-value`: D4 proof; fix or name | orchestrator or one `typescript-pro` | the same | T2a | [x] |
| [T3](T3-yaml-twins.md) | The 4 yaml rows: prove they are twins of named rows; name them | orchestrator | `DIVERGENCES.md` | T2b | [x] |

Serial: all three write `DIVERGENCES.md`, and a T2a fix in `src/diagrams/json/` would change T2b's and T3's numbers
(D7). T2a runs first because it is the only task with a plausible port defect.

Close the batch per the task contract: gates, the every-engine survey, `verdict-diff`, and the dashboards.
