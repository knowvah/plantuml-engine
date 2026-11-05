# T4d — Probe past the rows: text and style

**Do:** author one `.puml` per item in `tests/fixtures/chart/cov-<name>.puml`, render with `scripts/oracle-render.sh tests/fixtures/chart <puml>`, compare with `probe.mts`, read the Java for every diff, and fix or end it by D8. Each ends in `oracle/goldens/svg-chart/authored-baseline.json` (T5 gates it). Anything needing a ruling goes on a `needs-ruling` issue.

- Text: creole in a category, a tick label, a legend name and an annotation; a sprite in a label; a `%.2e` axis; a `%.1f` numeric h-axis; a huge value past 2^63. A v-axis title stays plain (`UText`, not `Display`).
- Style: `chartDiagram { axis grid legend annotation bar line area scatter }` selectors, `hAxis` and `vAxis` apart, `BarWidth` inside and outside `(0, 1]`, a `.stereo` on a line, an area and a scatter, `MarkerColor` both ways, `skinparam backgroundColor`, a gradient back colour, `!theme`, `mode dark`, `monochrome true`, `handwritten true`, `shadowing`.

## Acceptance
- Given every item above, then a fixture exists with its oracle, and its diff count is in the journal.
- Given a nonzero fixture, then the journal names its mechanism with `file:line` and its end by D8.

Observability N/A. Rollback Reversible.
