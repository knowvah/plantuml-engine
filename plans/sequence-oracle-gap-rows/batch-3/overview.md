# Batch 3: anchors, newpage, self `++--`

Serial: one task at a time, each one commit, in this order. These three rows touch teoz geometry shared with
hundreds of pinned rows, so each task runs the sequence golden ratchet before it commits.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | anchor duration next to a `note right` | orchestrator or `typescript-pro` | [T3a-anchor-note.md](T3a-anchor-note.md) | batch 2 | [x] |
| T3b | page 1 of a `newpage` diagram with activations and anchors | orchestrator or `typescript-pro` | [T3b-newpage-page1.md](T3b-newpage-page1.md) | T3a | [x] |
| T3c | `mainframe`, `box` and `C -> C ++--` | orchestrator or `typescript-pro` | [T3c-mainframe-self.md](T3c-mainframe-self.md) | batch 2 | [x] |

T3b follows T3a because both rows use `{start} <-> {end}`; T3a's fix may move T3b.

Batch 3 closes as the task contract says, with the every-engine survey and `verdict-diff`.
