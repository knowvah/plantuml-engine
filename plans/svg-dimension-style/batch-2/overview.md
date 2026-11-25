# Batch 2: engines

Serial: every task edits the gate's `OPEN`/`EXACT` lists, and the write-sets in `src/` are disjoint.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2](T2-theme-engines.md) | Sequence (puma, teoz, newpage), state, activity, chromed description | orchestrator or `typescript-pro` | 4 renderers, the gate | T1 | [x] |
| [T3](T3-skinparam-a.md) | timing, gantt, mindmap, wbs, salt, nwdiag, activity-legacy | orchestrator or `typescript-pro` | 7 engines + their `SkinParam` ports and tests, the gate | T2 | [x] |
| [T4](T4-skinparam-b.md) | ebnf + regex, board, cheneer, wire, packetdiag, chart | orchestrator or `typescript-pro` | 6 ports, 7 engines, tests, the gate | T3 | [x] |

Rows per task (the `reason` each `OPEN` row carries in T1):

- **T2:** `seq`, `seq-title`, `seq-newpage`, `teoz`, `state`, `state-title`, `act`, `act-title`, `desc-title`.
- **T3:** `timing`, `gantt`, `mindmap`, `wbs`, `salt`, `nwdiag`, `actleg`.
- **T4:** `ebnf`, `regex`, `board`, `chen`, `wire`, `packet`, `chart`.

Close with the batch close in [task-contract.md](../task-contract.md).

Observability is N/A for every task. Rollback is Reversible (revert the task commit).
