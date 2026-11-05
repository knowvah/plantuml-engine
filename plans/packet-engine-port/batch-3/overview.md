# Batch 3 — turn on, vega, probes

From here `renderSync` reaches the new engine; every task surveys.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-turn-on.md) | Rewrite `index.ts`, delete the old pipeline, take the 6 rows to zero | orchestrator | `packetdiag/index.ts`, old files deleted, `tests/unit/packetdiag/**`, shrink-only baselines | T1c, T2a | [x] |
| [T3b](T3b-vega-fixtures.md) | Bring in the 62 vega sources with oracles; take them to zero | orchestrator | `tests/fixtures/packet/vega-*`, fixes in `packetdiag/` | T3a | [x] |
| [T3c](T3c-authored-probes.md) | Authored probes past vega; fix what they expose | orchestrator | `tests/fixtures/packet/cov-*`, fixes | T3b | [x] |
