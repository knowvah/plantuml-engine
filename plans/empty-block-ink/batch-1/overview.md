# Batch 1: the LimitFinder port and its ceilings

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-ink-port.md) | Port K, tighten 9 ceilings, pin 2 authored rows | orchestrator or `typescript-pro` | `src/diagrams/json/document-dimensions.ts`, `tests/unit/json/document-dimensions.test.ts`, `oracle/goldens/json-family-positional.json` | T0 | [x] |

One task, so nothing runs in parallel. The batch closes per [task-contract.md](../task-contract.md#batch-close).

**Interface output (consumed by T2):** the post-K residue of the 11 rows, as `/tmp/ebi-t1.txt` and journal row
values. T2 copies the two hcl rows' numbers into the DIVERGENCES table from there, not from the README.
