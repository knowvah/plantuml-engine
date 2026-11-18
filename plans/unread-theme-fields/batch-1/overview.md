# Batch 1: delete the fields

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-drop-fields.md) | Delete both members, their defaults and writers; rewrite the tests (D1, D2) | orchestrator | see T1a | T0 | [x] |

One task: a type change and every one of its call sites must land together or `tsc` fails (one unit per
`parallelism.md`). Close the batch per `task-contract.md` after T1a (gates only; the survey runs at exit).

**Interface T1a → T2:** the commit sha, and the description-pin count after T1a, journalled.

Observability is N/A. Rollback is Reversible: revert the task commit.
