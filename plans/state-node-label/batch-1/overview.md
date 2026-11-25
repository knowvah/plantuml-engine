# Batch 1: gate + clock normalisation

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | D2 normalisation, the 31 fixtures, the authored gate | orchestrator or `typescript-pro` | see T1 | T0 | [x] |

Close with the task contract's batch close. Stop condition 8 is checked here: the full survey after D2 must show every
row's diff count unchanged, not only its verdict.
