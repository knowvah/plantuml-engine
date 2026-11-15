# Batch 1: pin the 7 hcl rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-pin.md) | Build the hcl pin tool and a ratchet floor; pin the 7 zero-diff rows | orchestrator or one `typescript-pro` | `plans/hcl-yaml-oracle-gap-rows/tools/*`, `svg-hcl/` goldens + `ratchet.json`, the two baselines, `json-family-positional.json`, `json-family-ratchet.ts`, the routing/refusal counts, `svg-hcl/README.md` | T0 | [x] |

Close the batch per the task contract, including `npm run parity:dashboard` (the hcl row's pinned count moves 1 -> 8).
No `src/` file changes here, so a survey is not needed to close batch 1.
