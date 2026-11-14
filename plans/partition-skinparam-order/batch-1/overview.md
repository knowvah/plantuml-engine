# Batch 1: the 43 rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | Add the planning rows and their jar oracles to `diagram-style-scope`, pinned at today's counts | orchestrator | `tests/fixtures/diagram-style-scope/*__frameorder-*`, `oracle/goldens/diagram-style-scope.json` | T0 | [x] |

Task file: [T1-rows.md](T1-rows.md). Close with [the batch close](../task-contract.md#batch-close), step 1 and step
3. The survey waits for batch 2, because no `src/` changes here.
