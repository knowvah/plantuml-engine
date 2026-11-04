# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Scope is the 174 rows of `parity-state.json`, by the survey's verdict
**Decision:** a row is done at `conformant`, the survey's `compareSvg` verdict. **Rejected:** the census's zero count as the bar (it
differs only on 4 error-page rows); the `unknown` bucket's state rows (#119 owns them); comment and `data-*` bytes (`compareSvg` ignores
them in every engine, and no drive has targeted them). **Evidence:** fresh survey, 0 moves against the committed file.

### D2 — Mirror `SvekResult#drawU` inside the state renderer
**Question:** T1c needs clusters, then nodes, then lines per svek level. **Option A:** restructure `renderer.ts` to build those three
lists, keeping state's geometry. **Option B:** move state onto a shared svek drawing port. **Decision: A.** **Evidence:**
`src/core/svek/SvekResult.ts` is 92 lines of constants: there is no shared drawing loop to move onto, and description draws through its
own renderer. B would be a rewrite of 16,820 lines with 125 conformant rows at risk and no port to land on. A still mirrors upstream's
structure: the order lives in one function with `SvekResult.java:72-100` cited. `InnerStateAutonom` keeps its nested group, because
upstream's inner `SvekResult` draws inside it.

### D3 — Serial, main checkout, one commit per task
**Rejected:** parallel worktrees: the tasks overlap in `renderer*.ts` and `state-composite-*.ts`, a worktree needs symlinked stdlib and
oracle assets, skips git hooks, and Serena agents write the main checkout anyway (`.claude/memory/agents-write-main-via-serena.md`).

### D4 — Pin at census zero, through `pin-state.mjs`
The ratchet renders through `renderFixtureState`, the survey through `renderSync`. A row is pinned only where the census reads zero and
the survey says `dotEqual`. **Rejected:** pinning on survey verdict alone: the ratchet would go red where the two paths differ, and
error-page rows are already held by `oracle/goldens/stock-error-pages.json`.

### D5 — Scale through the exporter, as description does
`state-commands.ts:136` stops dropping `scale`; the parser uses `core/scale-command.ts`; the plugin returns `scaleSpec` and `dpi` on its
fragment, with `withDeferredFormat` when `isExportScaled`, following `description/index.ts:138-168`. `renderFixtureState` must stay on
the same path. **Rejected:** multiplying coordinates in state's layout: `TextBlockExporter.java:205-209` scales at export, and rounding
happens once after the scale (`SvgGraphics.java:468-475`).

### D6 — Colours through the ported `core/abel/Colors`
`CommandCreateState.java:216-228` and `Link#applyStyle` build `Colors`; `core/abel/Colors.ts` is the port. State stops storing raw strings
for what it draws. **Rejected:** a state-local parser for `##[dashed]`: it would be a fourth copy of a ported class. Keep the existing raw
fields only until the last reader moves, then delete them.

### D7 — Rows #120 and #122 also name
#120 and #122 list `somuke-94`, `sugico-41`, `xefuma-94`, `xeziki-47`, `fikuga-98`. Those state rows are in this issue's done-when, so
they are fixed here, and T7 comments on both issues saying so. **Rejected:** leaving them, which would fail #112.

### D8 — `xetase-70-zaza808` and math rows
`.agent-notes/xetase-embedded-diagram-label.md` finds the `{{` label needs edge-label measurement through the creole parser in four
engines. **Decision:** T5c re-measures. If it holds, it is "genuinely large and separable": a `queue:ready` issue chained on #136, row
named, not a state fix. `corumi-91-mizo869`'s `<math>` stays on the KaTeX divergence
(`.claude/memory/latex-math-is-permanent-divergence.md`), but its `scale 5` is fixed by T4a. **Rejected:** special-casing `{{` as 42x42:
that is the exception arm, and a well-formed label would be wrong.

### D9 — What ends a row
In order: conformant; a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue
chained on #136, with the measurement that proves it separable. **No row ends unnamed.** A row with only "hard" against it is not ended.
New issues get a "Blocked by" line on #136, because the lowest number runs first.

### D10 — Geometry on real-graphviz paths is a target
State shells out to graphviz, so the jar's geometry IS a target and `dotEqual` false is a defect in our DOT input. Before blaming
dot-engine, run `dot -Tdot` on the cached `svek-N.dot` (`.claude/memory/dot-engine-blame-needs-real-dot.md`). A verified finding is filed in
`docs/graphviz-issues/` and `TRACKER.md` before the iteration closes, and dot-engine is never edited. **Rejected:** a tolerance on `@d`.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchet are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and `scripts/parity-dashboard-notes.ts`'s state note is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Renderer output only, and `scale` multiplies at export. Survey wall clock is unchanged in kind. The ratchet grows by up to 164 fixtures of in.puml plus golden.svg, so routing and CI time rise with it: name that in T7's summary. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-module change (`Colors`, `svg-format`) moving another engine: `verdict-diff` names it. A pinned `tests/unit/state/` value encoding our old order: move the test with a Java quote, never the reverse. |
| Compatibility | No public API change. `dist/*.d.ts` must stay identical; `RenderFragment` already carries `scaleSpec`. SVG for state diagrams changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |
