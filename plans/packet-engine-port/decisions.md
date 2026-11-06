# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Rewrite file for file, delete the old pipeline
`CLAUDE.md`: "A structural divergence IS the bug: re-mirror rather than patch", and "Rewriting a never-faithful local file is allowed." Upstream draws through `UGraphic` from `PacketDiagram#getTextBlock`, `PacketBlock#getShapeTextBlock` and `PacketIndicator#drawU`; ours separates `parser.ts`, `layout.ts` and string templates in `renderer.ts`. **Evidence:** all 6 rows diverge on the first text's `text-anchor`. Labels are creole `Display`s with `textLength`; ticks are `UPath`s through `nwdiag.VerticalLine`, so `<path>`, where ours emits `<line>`; and `renderer.ts:25-33` documents the 0.5 stroke as a "port-own default" when it is `element { LineThickness 0.5 }` (`skin/plantuml.skin:93`). **Rejected:** patching `renderer.ts` row by row: no merged style reaches it, so `skin rose`, `<style>` and every theme would need a second style path. Old code is deleted, not archived (`.claude/memory/delete-archived-code.md`).

### D2 — Substrate: chart's plugin shape on klimt
`PacketDiagram extends TitledDiagram`, as `chart/ChartDiagram.ts` does. `index.ts` mirrors `chart/index.ts` (itself wbs's shape, cep D2) with `PACKET` and `packetdiagDiagram` substituted. `packet-skin-param.ts` mirrors `chart/chart-skin-param.ts`, adding `getPragma` because `PacketBlock.java:227-231` reads it. `PacketDiagramFactory.ts` mirrors `ChartDiagramFactory.ts`'s command loop, refusal shape and `CommonCommands.addCommonCommands1`. **Rejected:** importing chart's modules: engines do not reach into each other (`tests/architecture/layering.test.ts`), and "do not refactor while porting" rules out a shared extraction here. **Rejected:** a new `UGraphic` adapter: `UGraphicSvg` already draws chart, wbs, mindmap and salt.

### D3 — `VerticalLine` and `toSet` live at their upstream home, `src/diagrams/nwdiag/`
`PacketIndicator.java:53` imports `net.sourceforge.plantuml.nwdiag.VerticalLine`, and `CommandNumRange.java:118` calls `NwDiagram.toSet`. No nwdiag engine exists yet (#124). Create `src/diagrams/nwdiag/VerticalLine.ts` (the whole class, `skip` set included) and `src/diagrams/nwdiag/NwDiagram.ts` exporting `NwDiagram` with only the static `toSet` and its pattern `p` (`NwDiagram.java:288-303`), and add two `ALLOWLIST` entries, packetdiag to nwdiag, each quoting the Java import. #124 grows `NwDiagram.ts` in place. **Rejected:** private copies in `packetdiag/`: the names would leave their upstream home and #124 would duplicate them. **Rejected:** `src/core/`: upstream keeps both in the nwdiag package. A `src/diagrams/nwdiag/` with no `index.ts` registers no plugin; T1a checks the catalog and any test that walks `src/diagrams/*` for an `index.ts`.

### D4 — Fixtures: the 6 cached rows, upstream's `vega/packet`, then authored probes
`CLAUDE.md`: "Prefer upstream fixtures to synthesized ones", and "In upstream's fixtures or docs ⇒ in scope". Copy the 62 `~/git/plantuml/src/test/resources/vega/packet/*.puml` verbatim to `tests/fixtures/packet/vega-<name>.puml` and render each oracle with `scripts/oracle-render.sh` (gantt D8, cep). Upstream's own `.svg` come from another build and are not oracles. The front matter some carry (`R23.01-error`, `error-with-exception`) stays: it sits before `@start` and is part of upstream's source. Authored `cov-<topic>.puml` cover what neither has: chrome (title, caption, legend, header, footer, mainframe), `scale`, `<style>` on `packetdiagDiagram` and its `rectangle`, skinparams, themes, `!option handwritten`, creole and `\n` in labels, the `...` abbreviation, `{{packetdiag}}` inside another diagram, and document background. **Rejected:** authored fixtures only: vega's are combinatorial because real bugs were.

### D5 — Ratchet: `svg-packet`, mirroring `svg-chart`
Copy `chart.golden.ratchet.test.ts`, `chart.diff-baseline.ratchet.test.ts` and `render-fixture-chart.ts` with `packet` substituted, reading `test-results/dot-cache/packet` and `tests/fixtures/packet`. No DOT eligibility: packet has no svek stage (`scripts/dot-parity-rows.ts:16-19`). `pin-packet.mts` writes goldens, `ratchet.json`, and `goldens` twins in the routing and refusal baselines. The 6 `dot-cache` routing rows are stale `known-misroute` pins with `ourType: NONE`: T4 re-pins them `agree`, moving the count assertions, as cep T5 did. Authored rows go through `authored-baseline.json`. A `diff-baseline.json` for the 6 is written **only if** a row stays nonzero. **Rejected:** a bespoke packet gate.

### D6 — Mirror upstream's dropped inputs; keep the dead-looking state
`textRotation` is stored on `PacketItem` and never reaches `PacketBlock` (`toPacketBlock:521-528`); `leftOpen`, `rightOpen` and `openerStroke` are set and never drawn; `toSet` parses `color`, `label`, `description`, `numbered` and nothing reads them; the start bit only feeds the width. Port every field and setter with these names and leave them unread, each with a one-line comment quoting the Java that drops it. `R12.01-rotate_270` and `R17.01-color` prove the jar ignores them. **Rejected:** honouring any of them: no forcing library, so it would be an unruled divergence (`CLAUDE.md`, "Mirror the jar's output exactly").

### D7 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here. Planning found no forcing library anywhere in packet.

### D8 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `adjustLayout` and `getShapeTextBlock` are the long ones: break them into named helpers that keep the Java method's name on the entry point, with `@see` on each. Pass a context object where Java passes more than five arguments. Use `#lizard forgives` only for the tool quirk the repo already documents. Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

### D9 — Serial, main checkout, one commit per task
The batches build one engine upward in one directory; worktrees need symlinked assets and skip git hooks (`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced beside the old engine until T3a, so `npm test` stays green through batches 1 and 2. **Rejected:** parallel worktrees, and one big commit (the journal cites per-task commits through `pre-squash`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and `packet`'s note in `scripts/parity-dashboard-notes.ts:121` is deleted once every row is conformant (cep precedent), else rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Rendering is linear in fields. The ratchet grows by 6 golden and about 62 + the authored count rows; CI's slowest shard was 564 s on #153 (shard 4), and cep added 193 rows since, unmeasured in CI. T5 names the risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-seam edit (`EmbeddedDiagram`, `assemble-svg`) moves another row: `verdict-diff` names it. Coverage below 90 after deleting the old tests: T1 to T3 cover the new files. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). Lines the old parser accepted and the jar refuses now error, which is the mirror. |

## Baseline

Measured on `a1427cdf2`, 2026-11-05, at planning, load average about 20: `npm test -- --maxWorkers=4` 41713 passed, 4 expected fail, 7 skipped, 6 todo, in 1995 files (1 skipped); coverage 97.36/93.23/98.05 (statements, branches, functions), exit 0. `npm run typecheck`, `npm run lint`, `npm run format:check` exit 0. `npm run svg:survey -- packet --out /tmp/pkt-plan/parity-packet.json`: 0/0/6, identical verdicts to the committed file.
