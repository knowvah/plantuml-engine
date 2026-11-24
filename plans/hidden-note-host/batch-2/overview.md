# Batch 2: the rule in three engines

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-class.md) | Class and object: a note draws under its own hidden flag | orchestrator or `typescript-pro` | `src/diagrams/class/` renderer and note geo, unit test, gate | T1 | [x] |
| [T2b](T2b-description.md) | Description: `isNoteWithSingleLinkAttachedTo` in the hidden and removed sets | orchestrator or `typescript-pro` | `src/diagrams/description/element-grammar.ts` + callers, unit test, gate | T1 | [x] |
| [T2c](T2c-state.md) | State: the delegation, and a hidden note draws nothing | orchestrator or `typescript-pro` | `src/diagrams/state/` directives, hidden, note renderer, unit test, gate | T1 | [x] |

The three write-sets do not overlap apart from the gate file, which each task edits for its own rows. Run them
**serially** in the main checkout (README "Branch"), in the order T2a, T2b, T2c, one commit each.

Batch 2 closes with the task contract's "Batch close". Expect verdict-diff gains in class, object, component,
usecase or state, wherever a corpus row carries `hide` and a note. Expect no losses.

Observability is N/A. Rollback is Reversible.
