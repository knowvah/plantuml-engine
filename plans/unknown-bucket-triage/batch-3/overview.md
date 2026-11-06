# Batch 3 — names, probes, pins

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-names-and-moves.md) | Name the HCL and sudoku rows; comment the moved rows on #121 and #123 | orchestrator | `DIVERGENCES.md`, issue comments | T0 | [x] |
| [T3b](T3b-probes.md) | Probe past the rows: authored sources for each fixed mechanism, beside the jar | orchestrator | `tests/fixtures/ubt-T3b/`, fixes it finds, tests | T2c | [x] |
| [T3c](T3c-pins.md) | An `unknown` source in the activity, sequence and state ratchets, then pin | orchestrator | the three ratchet tests and their `ratchet.json`, goldens, pin tools | T3b | [x] |

T3a has no code and may run any time after T0; T3c runs last, so it pins the final output.

Exit: every row in D1's 18 ends per D7; every conformant `unknown` row the three ratchets reach is pinned or
journaled with why not. Close per [task-contract.md](../task-contract.md).
