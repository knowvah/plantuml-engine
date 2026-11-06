# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Rewrite file for file, delete the old pipeline
`CLAUDE.md`: "A structural divergence IS the bug: re-mirror rather than patch", and "Rewriting a never-faithful local file is allowed." The old engine separates parse, a geometry layer and string templates; upstream draws straight through `UGraphic` from one `ChartRenderer`, reading merged styles at draw time. **Evidence:** all 29 rows differ on the first line or text. The old parser refuses what the jar accepts (`rotate`, `page`) and accepts what it refuses (`grid v-axis`, `bar [..] v2`), and its `colorFromStereo` and `stereoToMarker` invent rules no Java has. **Rejected:** patching `layout.ts` and `renderer.ts` row by row: every label would still skip creole, and every stroke would need a style read the pipeline has no seam for. Old code is deleted, not archived (`.claude/memory/delete-archived-code.md`).

### D2 — Substrate: the wbs plugin's shape on klimt
`ChartDiagram extends TitledDiagram implements TextBlock`, as `wbs/WBSDiagram.ts` does. `index.ts` mirrors `wbs/index.ts`: `renderChart`, `drawFragment`, `exportTextBlock`, `rawTextBlock`, `calculateBackColor`, `muteColorMapper`, `isHandwritten`, `calculateMargin`, with `CHART` and `chartDiagram` substituted. `chart-skin-param.ts` mirrors `wbs/wbs-skin-param.ts`, whose own doc records it as a mirror of mindmap's (wep D4), over `createMindmapSkinParam`. `ChartDiagramFactory.ts` reuses `WBSDiagramFactory.ts`'s `executeCommands`, style dispatch and refusal shape. **Rejected:** importing the wbs skin param or plugin helpers: engines do not reach into each other (`tests/architecture` layering), and "do not refactor while porting" rules out a shared extraction here. **Rejected:** a new `UGraphic` adapter: `UGraphicSvg` already draws wbs, mindmap and salt.

### D3 — Plot annotations keep `getAnnotations()`; the field is `chartAnnotations`
Upstream's `ChartDiagram.annotations` is `List<ChartAnnotation>`. Every klimt diagram in this port exposes `annotations: DiagramAnnotations` for chrome, and `src/index.ts#annotationsOf` reads it. So `annotations` holds the chrome as in `WBSDiagram.ts`, the plot list is the private field `chartAnnotations`, and `getAnnotations()` and `addAnnotation()` keep upstream's names. That lets T4a delete the `chrome` branch of `annotationsOf`, which exists only for the old AST. **Rejected:** keeping `chrome` as a field: a chart-only special case in `src/index.ts` for a name collision.

### D4 — Java number text in one small core module
Labels go through `String.format("%d" | "%.1f" | "%.2f" | "%.0f" | "%.2e")`. `core/java-number-format.ts` exports `javaFormatF(value, decimals)` over `svg-format.ts`'s `javaFixedN` (exported, HALF_UP on the shortest decimal), `javaFormatE(value, decimals)` printing `1.00e-03` with a two-digit exponent, and `javaFormatLong`. It also exports `parseDouble` with `Double.parseDouble`'s grammar, hex floats included, since `[^,]+` in `annotation` and `\[(.*)\]` in series reach it. **Rejected:** `toFixed` and `toExponential`: `(1.005).toFixed(2)` is `1.00` where Java prints `1.01`, and `toExponential` prints `1.00e-3`. **Rejected:** moving `sax-text-image-use.ts`'s and `style-line-style.ts`'s private parsers here: not this mission's refactor; log them in `.agent-notes/`.

### D5 — Hooks: group parameters, split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters, and the Java is a 1422-line class with 7-parameter methods. Split `ChartRenderer` into `ChartRenderer.ts` (constructor, `calculateDimension`, `drawU`, `drawSeries`, plot size), `ChartRendererAxes.ts`, `ChartRendererLegend.ts`, `ChartRendererAnnotations.ts`, `ChartStyles.ts` (signatures and `get*Style`). Keep each Java method's name on its function, with `@see` on it, and pass a named context object where Java passes many arguments (`WBSIdeaContent` precedent). Break a long method into named helpers. Use `#lizard forgives` only for the tool quirk the repo already documents, never to silence a real limit. `~/.claude/hooks/complexity-ignore` is outside this repository and is not edited.

### D6 — Regexes are transcribed with Java's classes, `i` without `u`
Each command exports its pattern built from the `RegexConcat` leaves in order. `RegexLeaf.spaceZeroOrMore` is `[ \t\n\x0B\f\r ]*` (`%s`, `Pattern2.java:57`), not JS `\s`. `Pattern2` is `CASE_INSENSITIVE` without `UNICODE_CASE`, and JS's `i` without `u` folds the same way; `iu` would fold `ſ` to `s`. Java's `\w` is ASCII, as JS's is. `String#split(",")` drops trailing empties and `String#trim` strips only up to U+0020: T2a ports both as helpers, since `"1,2,".split(",")` and `" ".trim()` differ in JS. `Map<Double, String>` keys keep `-0.0` and `0.0` apart, so custom ticks are an insertion-ordered array that overwrites by `Object.is`.

### D7 — Ratchet: `svg-chart`, mirroring `svg-utility`
Copy `utility.golden.ratchet.test.ts` and `render-fixture-wbs.ts` (a thin `renderSync`) with `chart` substituted, reading `test-results/dot-cache/chart`. No DOT eligibility: `chart` has no svek stage. `pin-chart.mts` writes goldens, `ratchet.json`, and `goldens` twins in the routing and refusal baselines. The 29 `dot-cache` routing rows are stale `known-misroute` pins with `ourType: NONE` (`routing-conformance.test.ts#progressNote` already logs `[FIXED]`): T5 re-pins them `agree`, moving the count assertions. Authored rows go through `authored-baseline.json` as `utility.diff-baseline.ratchet.test.ts` does. `diff-baseline.json` for the 29 is required **only if** a row stays nonzero, otherwise it would be an empty population; `scripts/parity-dashboard-goldens.ts` skips an absent file. **Rejected:** a bespoke chart gate.

### D8 — What ends a row
In order: conformant; a named divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here. A divergence with no forcing library is a bug. Planning found none: nothing in chart needs a library the port lacks.

### D9 — Serial, main checkout, one commit per task
The batches build one engine upward and share a directory; worktrees need symlinked assets and skip git hooks (`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced beside the old engine until T4a, so `npm test` stays green through batches 1 to 3. **Rejected:** parallel worktrees, and a big-bang single commit (issue-sized review is by batch, and the journal cites per-task commits through `pre-squash`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated, and `chart`'s note in `scripts/parity-dashboard-notes.ts:109` is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Rendering is linear in series times categories. The ratchet grows by up to 29 fixtures; CI's slowest shard was 506 s of 600 s on #146, and #153's first run is the latest number, so T6 reads it and names the risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-seam edit moves a row: `verdict-diff` names it. Coverage below 90 after deleting the old tests: T4a and T4c to T4e cover the new files. |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T6. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). Lines the old parser accepted and the jar refuses now error, which is the mirror. |

## Baseline

Measured on `e2a4a7290`, 2026-11-05, at planning: `npm test -- --maxWorkers=4` 41282 passed, 4 expected fail, 7 skipped, 6 todo, in 1981 files (1 skipped); coverage 97.3/93.1/98.02 (statements, branches, functions), exit 0. `npm run typecheck` and `npm run lint` exit 0. `npm run svg:survey -- chart`: 0/0/29.
