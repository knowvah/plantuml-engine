# Batch 2 — arrow labels

The largest family: `-> label;` text on an activity arrow inside a loop, around a fork, split or merge, or in a
branch. Most rows differ in canvas height and in every y below the label, so one fix moves many rows; and most
composite rows (T6a) carry labels. Upstream keeps the label on the arrow's `LinkRendering`
(`activitydiagram3/LinkRendering.java`), and each tile builder decides where it is drawn and how much room it
takes. Tasks are split by builder.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-loop-labels.md) | Labels in `while`, `repeat`, `backward` | orchestrator or `typescript-pro` | activity while/repeat tiles and connectors; tests | batch 1 | [x] |
| [T2b](T2b-parallel-labels-notes.md) | Labels around `fork`, `split`, `merge`; a note after `end split` (items 9, 10) | orchestrator or `typescript-pro` | activity parallel builders, note attachment; tests | T2a | [x] |
| [T2c](T2c-branch-labels.md) | Labels in `if`, `elseif`, `switch`; `skinparam arrow { MessageAlign }` | orchestrator or `typescript-pro` | activity if/switch tiles, label alignment; tests | T2b | [x] |

Rows per task: `measurements/planning-corpus.tsv`, column `task`.

Close: the task contract's batch close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
