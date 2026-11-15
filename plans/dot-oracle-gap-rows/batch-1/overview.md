# Batch 1: pin the 47, pin the 8 error pages

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-pin.md) | Build the dot pin tool; pin the 47 zero-diff rows | orchestrator or one `typescript-pro` | `plans/dot-oracle-gap-rows/tools/*`, `svg-dot/` goldens + `ratchet.json`, the two baselines, the dot ratchet test, the routing/refusal counts, `svg-dot/README.md` | T0 | [x] |
| [T1b](T1b-error-pages.md) | Pin the 8 error-page rows under the 2026-10-10 rule (D3) | orchestrator or one `typescript-pro` | the same files, plus the tool's `jarError` path | T1 | [x] |

Serial: both tasks write `ratchet.json`, the two baselines and the dot ratchet test (D6).

Close the batch per the task contract. The survey and `verdict-diff` start at batch 2, but no `src/` file changes
here, so a survey is not needed to close batch 1.
