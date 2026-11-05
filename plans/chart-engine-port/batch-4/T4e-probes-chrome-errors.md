# T4e — Probe past the rows: chrome, embedding, errors

**Do:** author one `.puml` per item in `tests/fixtures/chart/cov-<name>.puml`, render with `scripts/oracle-render.sh tests/fixtures/chart <puml>`, compare with `probe.mts`, read the Java for every diff, and fix or end it by D8. Each ends in `oracle/goldens/svg-chart/authored-baseline.json` (T5 gates it). Anything needing a ruling goes on a `needs-ruling` issue.

- Chrome and page: `title`, `header`, `footer`, `caption`, a bare `legend` block beside `legend right`, `mainframe`, `scale 2`, `scale 200 width`, `rotate`, `page 2x2`.
- Embedding: `{{chart ... }}` in a class note and in a sequence note, which `EmbeddedDiagram.ts:288` routes.
- Errors, under the error-page rule (`.claude/memory/error-page-conformance-rule.md`): `grid v-axis`, `bar [1] v2`, `bar [x]`, `bar [1] #nosuch`, `line [(1,2)]` with no h-axis range, an out-of-range x, mixed coordinate and index series, `annotation "a" at (A, b)`, `h-axis [A] spacing 0`.

## Acceptance
- Given every item above, then a fixture exists with its oracle, and its diff count is in the journal.
- Given a nonzero fixture, then the journal names its mechanism with `file:line` and its end by D8.

Observability N/A. Rollback Reversible.
