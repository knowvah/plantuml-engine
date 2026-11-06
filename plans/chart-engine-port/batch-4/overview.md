# Batch 4 — turn on, residuals, probes

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-turn-on.md) | Rewrite the plugin, delete the old engine, clear the gate fallout | orchestrator | `chart/index.ts`, deletions, tests, baselines | T3c | [x] |
| [T4b](T4b-rows-to-zero.md) | Drive every row to zero | typescript-pro | wherever the mechanism is | T4a | [x] |
| [T4c](T4c-probes-geometry.md) | Probes: series, legends, axes, horizontal | orchestrator | `tests/fixtures/chart/**`, any fix | T4b | [x] |
| [T4d](T4d-probes-text-style.md) | Probes: text and style | orchestrator | `tests/fixtures/chart/**`, any fix | T4c | [x] |
| [T4e](T4e-probes-chrome-errors.md) | Probes: chrome, embedding, errors | orchestrator | `tests/fixtures/chart/**`, any fix | T4d | [x] |
