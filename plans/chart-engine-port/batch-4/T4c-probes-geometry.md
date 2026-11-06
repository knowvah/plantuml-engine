# T4c — Probe past the rows: geometry

`.claude/memory/probe-past-authored-rows.md`: green rows hide families, and the corpus is not a ceiling. No row reaches an area, a left, top or bottom legend, or a stereotype on a line.

**Do:** author one `.puml` per item in `tests/fixtures/chart/cov-<name>.puml`, render with `scripts/oracle-render.sh tests/fixtures/chart <puml>`, compare with `probe.mts`, read the Java for every diff, and fix or end it by D8. Each ends in `oracle/goldens/svg-chart/authored-baseline.json` (T5 gates it). Anything needing a ruling goes on a `needs-ruling` issue.

- Series: `area` single, stacked to unequal lengths, `labels`; `line` and `scatter` `labels`; `scatter ... <<square>>` and `<<triangle>>` trailing; `line`, `area` and `scatter` under `v2`; a series longer than the categories; no series; no axes at all.
- Legends: `left`, `top`, `bottom`, each with mixed series types and with v2; a multi-line `\n` series name; no series.
- Axes: `spacing` with a fractional value, past-range values in `ticks`, v2 `ticks` and `spacing`, `label-top` on v2, autoscale above 100 and below 0, a range not containing zero both ways, `v-axis 5 --> 5`, a coordinate-pair chart with negative x, `h-axis ... grid` on both forms, a reversed range `10 --> 0`.
- Horizontal: title, `labels`, grouped, stacked, `line` and `scatter`, annotations numeric and categorical.

## Acceptance
- Given every item above, then a fixture exists with its oracle, and its diff count is in the journal.
- Given a nonzero fixture, then the journal names its mechanism with `file:line` and its end by D8.

Observability N/A. Rollback Reversible.
