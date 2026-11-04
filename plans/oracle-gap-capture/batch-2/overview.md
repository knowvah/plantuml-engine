# Batch 2 — capture and pin

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3](T3-capture.md) | Render every gap to the stage, alone | orchestrator | `test-results/ogc-stage/` (gitignored) | T2 | [x] |
| [T4a](T4-ledger.md) | Excuses: legacy activity and timing | any | `unknown-ledger/ogc-T4a.json` | T3 | [x] |
| [T4b](T4-ledger.md) | Excuses: activity3, class, object, sequence | any | `unknown-ledger/ogc-T4b.json` | T3 | [x] |
| [T4c](T4-ledger.md) | Excuses: unknown | any | `unknown-ledger/ogc-T4c.json` | T3 | [x] |
| [T5](T5-pin-install.md) | Pin routing and refusal, install, wire the gate | orchestrator | cache, two baselines, gates | T4a–c | [x] |
| [T6](T6-activity-baselines.md) | Grow the activity baselines | orchestrator | four baselines, count tests | T5 | [x] |
| [T7](T7-json-stock.md) | json-family pins, hcl rename, stock record | orchestrator | pins, fixtures, record | T5 | [x] |

T3 takes about 50 minutes and runs alone. T4a–c may run in parallel: read-only against the Java and three
different ledger files. Baselines are orchestrator-only (`scripts/repin-sequence-baselines.ts:3-8`).

Red between T5 and T7 is expected, and the batch closes green. **Close:** the four gates, then
`chore(ogc-b2): close batch 2`. A gate red here that the trial did not predict is a finding: name its mechanism
before changing anything.
