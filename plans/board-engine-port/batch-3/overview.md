# Batch 3 — turn on, probes

From here `renderSync` reaches the new engine; every task surveys.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-turn-on.md) | Rewrite `index.ts`, delete the old pipeline, take the 4 rows to zero | orchestrator | `board/index.ts`, old files deleted, `tests/unit/board/**`, `core/assemble-svg.ts`, shrink-only baselines | T1b, T2 | [x] |
| [T3b](T3b-authored-probes.md) | Authored probes; fix what they expose | orchestrator | `tests/fixtures/board/cov-*`, fixes | T3a | [x] |
