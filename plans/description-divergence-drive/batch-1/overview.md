# Batch 1 — lines we refuse or send to the wrong engine

First, because a refused row hides every other diff: 19 rows draw our error page or another engine's drawing. The Java for each is in the row's `reason` in
`tests/oracle/svg-conformance/unknown-ledger/ogc-T4c.json`; those citations are *leads* from #109, so open each one again. After a row draws, expect more diffs: hand them to the task that owns them.

Serial, because all three touch the description command tables.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `CommandCreateElementFull`'s DISPLAY2 and CODE1 forms | orchestrator | `command-table-shorthand.ts`, `element-grammar*.ts`, gate baselines, ledger | T0b | [x] |
| T1b | A class refusal falls through to description | orchestrator | `src/diagrams/class` parser, `src/registered-plugins.ts`, gate baselines, ledger | T1a | [x] |
| T1c | The missing commands | orchestrator | `command-table-*.ts`, `note-grammar.ts`, `core/annotations/commands.ts`, gate baselines, ledger | T1b | [x] |

Each task finishes with `node plans/description-divergence-drive/measurements/flip-gate-rows.mjs <yyyy-mm-dd> <slug> ...` for the rows it cleaned, then runs the routing and refusal gates (D4).

Close: [task-contract.md](../task-contract.md).
