# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Port file for file, mirroring upstream's package layout
`CLAUDE.md`: "Upstream architecture is authoritative" and "Preserve upstream names". `nwdiag/` has three levels:
the diagram, factory and 8 commands at the package root, `core/` (the model: `NServer`, `Network`, `NwGroup`,
`NStackable`) and `next/` (layout and drawing: `NPlayField`, `NTetris`, `BooleanGrid`, `NBar`, `NBox`, `NStage`,
`Staged`, `NwArray`, `NServerDraw`, `GridTextBlockSimple`, `GridTextBlockDecorated`). `src/diagrams/nwdiag/` mirrors
that: commands at the root beside `NwDiagram.ts` and `NwDiagramFactory.ts`, then `core/` and `next/`.
`VerticalLine.ts` and `NwDiagram.toSet` already exist from packet's mission and stay where they are; `NwDiagram.ts`
grows in place (pep D3). **Evidence:** `find ~/git/plantuml/src/main/java/net -path '*nwdiag*'` lists 21 files, 3,026
lines; `package-info.java` is not ported. **Rejected:** packet's `command/` subdirectory: packetdiag's Java keeps its
commands at its package root too, so following packet's file layout would copy a local choice, not upstream.
**Rejected:** a single-file engine. No old engine exists to delete.

### D2 — Substrate: packet's plugin shape on klimt
`NwDiagram extends TitledDiagram` (`src/core/TitledDiagram.ts`), as `packetdiag/PacketDiagram.ts` and
`board/BoardDiagram.ts` do. `index.ts` mirrors `packetdiag/index.ts`, with `NWDIAG` and the style name
`nwdiagDiagram` (`DiagramType.java:277-278`; `src/core/svek/diagram-type-style-name.ts:25` already has it).
`getDefaultMargins()` returns `ClockwiseTopRightBottomLeft.none()` (`NwDiagram.java` last method), so
`calculateMargin` gives 0 unless a `document { Margin }` style says otherwise. `nwdiag-skin-param.ts` mirrors
`packet-skin-param.ts`. Seams: `src/core/block-extractor.ts` gains `'nwdiag'` in `DiagramType`, the start-tag map and
`PORT_TO_UPSTREAM` (`NWDIAG`); `src/core/document-back-color.ts` `STYLE_NAMES` gains `nwdiag: 'nwdiagDiagram'` and
loses the comment that says it has none; `src/registered-plugins.ts` registers `nwdiagPlugin` between `dotPlugin`
(java:154) and `mindmapPlugin` (java:156) with `// java:155`; `src/core/assemble-svg.ts:321-322` adds `NWDIAG` to the
titled path beside `PACKET` and `BOARD`. `cov-chrome-all` (jar 210×240 with title, caption, legend, header, footer) is
the evidence T3a checks. **Rejected:** importing packet's modules: engines do not reach into each other
(`tests/architecture/layering.test.ts`), and "do not refactor while porting" rules out a shared extraction here.

### D3 — Server shapes go through the existing `USymbols`, nothing new
`NServer#updateProperties` resolves `shape` with `USymbols.fromString(shape, ActorStyle.STICKMAN,
ComponentStyle.RECTANGLE, PackageStyle.RECTANGLE)` and keeps `RECTANGLE` when it answers null; `getDraw` builds the box
with `getShape().asSmall(empty(0,0), desc, empty(0,0), symbolContext, CENTER)` from the merged `server` style's
`getSymbolContext`, with `color` replacing the back colour through `getColor` (a `NoSuchColorException` is swallowed).
`src/core/decoration/symbol/USymbols.ts` already has the style-argument overload and every symbol's `asSmall`
(`USymbolRectangle.ts:123`, `USymbolCloud.ts:291`, `USymbolDatabase.ts:180`, …); `Style#getSymbolContext` is
`src/core/style/Style.ts:330`. `cov-shapes-all` exercises 26 shapes plus `bogus`. A shape that draws wrong is a defect
in the shared symbol, fixed there with its Java quote (push-forward), since description and C4 draw the same symbols.
**Rejected:** nwdiag-local shape drawing: a second copy of `USymbol` would drift.

### D4 — Collection order: no Java hash replay is needed
Unlike board (bep D3), no nwdiag output depends on `HashMap` or `HashSet` iteration order. Planning read every
collection: `servers` is a `LinkedHashMap` (insertion order, a JS `Map`); `NwGroup.names` is a `HashSet<String>`
used only through `contains` and `names()`, whose only caller is `alreadyInSomeGroup`'s `contains`; `toSet` returns a
`HashMap` read only by `get`; `NPlayField.doLayout` returns a `HashMap<NBar, Integer>` read only by `get`;
`NTetris.all` is a `LinkedHashMap`; `BooleanGrid.burned` is a `HashSet<Integer>` read only by `contains`;
`NServerDraw#drawLinks`'s `skip` is a `TreeSet<Double>`, which `VerticalLine.ts` already sorts. `Network`, `NBar`,
`NBox` and `NServer` keep Java's identity `equals`/`hashCode`, so JS `Map`/`Set` keyed by the object match.
`NwArray` is a 2-D array; `getNbCols()` reads `data[0].length` and so throws with zero lines, as Java does (an
`ArrayIndexOutOfBoundsException`), which `makeDiagramReady`'s invisible network prevents. T1a journals any collection
this list missed.

### D5 — Fixtures: the 68 cached rows, then authored probes
Upstream ships no nwdiag fixture beyond `DiagramTypeTest.java`, so `CLAUDE.md`'s "when a feature has no fixture,
author `.puml` fixtures and generate oracles" applies. The 16 planning probes in `probes/` are the floor; T3b adds what
they miss: each chrome element alone and with `scale 2`, a mainframe, `!theme` on two stdlib themes, `skinparam
monochrome true`, `<style>` blocks for each of `network`, `server`, `arrow` and `group` (fonts, colours, `LineThickness`,
`Shadowing`, `RoundCorner`), a `document { Margin 20 }`, `width = full` on a middle network, a group with no
description, a group spanning two networks, a server in three networks with addresses on each, `a -- b` chains before
and after the first network (`veryFirstLink`, `justAfter`), a sprite and an openiconic icon in a description, creole
in a network name, `\n` in a description, every `CommandProperty` key quoted and unquoted, `//` comments, `footbox`
(ignored), `{{nwdiag}}` in a sequence note and in a class note, and an unknown line. **Rejected:** stopping at the 68
rows: they reach no `scale`, no mainframe, two chrome rows, and 6 of the 26 shapes.

### D6 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named
divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a
"Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here.
Planning found no forcing library anywhere in nwdiag: it never reaches graphviz, Smetana, KaTeX or the `{{ }}` oracle
seam on its own.

**Amended 2026-11-10 (execution, journal 22).** "`oracle/accepted-divergences.json` is never edited here" met a case
planning did not foresee: four signed entries ("jar errors, we draw": `jifoke-84`, `ligalo-62`, `torazi-09`,
`zeceme-22`) became conformant error pairs at T3a, and `emitter.golden.test.ts` stays red until they move to `retired`.
The four were moved to `retired`, marked unsigned. No entry was added. #165 (`needs-ruling`) asks the maintainer to
confirm or restore them. The prohibition still holds for adding or changing an acceptance.

### D7 — Ratchet: `svg-nwdiag`, laid out like `svg-activity-legacy`
The rows live in the `unknown` cache tree, so goldens go under `oracle/goldens/svg-nwdiag/unknown/<slug>/` with
`ratchet.json` entries `{ slug, type: 'unknown', addedAt, source: 'dot-cache' }`, as laep's
`svg-activity-legacy/<bucket>/<slug>/` does (`measurements/pin-nwdiag.mts` is adapted from `pin-legacy.mts`). Copy
`activity-legacy.golden.ratchet.test.ts`, `activity-legacy.diff-baseline.ratchet.test.ts` and
`render-fixture-activity-legacy.ts` with `nwdiag` substituted, reading `tests/fixtures/nwdiag` for authored rows;
`render-fixture-nwdiag.ts` defaults to the sprite + Twemoji + utility asset store, as the survey renders (pep journal
row 31). No DOT eligibility: nwdiag has no svek stage (`scripts/dot-parity-rows.ts:23-26` already says so). T4 re-pins
the 64 `known-misroute` routing rows `agree`, `ourType: NWDIAG`, and the refusal rows' `engine`, moving the count
assertions; the 4 `jar-error` routing rows stay `jar-error` unless the gate's own rule says otherwise. A
`diff-baseline.json` is written **only if** a row stays nonzero. **Rejected:** a new `svg-conformance` bucket for
nwdiag: re-classifying the corpus moves every bucket's survey file and the dashboard at once, for no fidelity gain.

### D8 — Mirror upstream's quirks
Port each of these as the jar does it, with a one-line comment quoting the Java:
- `CommandProperty`'s `VALUE` `([^"]*)` keeps a trailing `;` on an unquoted value (`cov-net-address-semicolon`);
- `CommandNwDiagInit` matching a blank or `{`-only line;
- `setProperty("description")` with no current group and no current network dereferencing null: throw, so the render
  is an error page (`cov-description-outside`);
- `link`'s `what about <name>`, `openGroup`'s `Cannot nest group`, `openNetwork`'s two errors, and
  `addElement`'s `Element already in another group.`, with Java's exact text (the four jar-error rows read them);
- `drawMe`'s trailing `UEmpty(1, 1)` and `getTotalDimension` through `getMinMax(…, true)`;
- `NServerDraw`'s `seven = 9.0`, `marginAd = 10`, `marginBoxW()` 15, `link2()` reading the next network's address
  even when the server is not on it, and `getMinMax`'s ±5;
- `GridTextBlockSimple#getInnerPosition` and `getMinMax` throwing `UnsupportedOperationException`, as thrown `Error`s;
- the commented-out branch in `addElement` is not ported.
**Rejected:** tidying any of them: no forcing library, so an unruled divergence.

### D9 — Serial, main checkout, one commit per task
The batches build one engine upward in one directory; worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until
T3a, so `npm test` stays green through batches 1 and 2. **Rejected:** parallel worktrees, and one big commit (the
journal cites per-task commits through `pre-squash`).

### D10 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `NwDiagram.java` is 460 lines and
`NServerDraw#drawLinks` is the longest method; break long functions into named helpers that keep the Java method's
name on the entry point, with `@see` on each, and move a cohesive block of `NwDiagram`'s drawing to a sibling file only
if the 500-line cap forces it (journal the split). `NServerDraw`'s 6-argument paths take an options object. Use
`#lizard forgives` only for the tool quirk the repo already documents. Files written through the shell skip the hook:
run `lizard` by hand (`.claude/memory/cep-status.md`).

### D11 — Errors mirror the jar's, not its page; rackdiag is not an engine
An empty `@startnwdiag` is the jar's Welcome page (`cov-empty`): follow the factory's empty-diagram path the way
`PacketDiagramFactory.ts` and `BoardDiagramFactory.ts` do. Errors carry Java's message text where the Java builds one
(D8). The Java NPE of `cov-description-outside` gets a port message, mapped in the test the way
`tests/unit/salt/factory/jar-rows.ts:14-18` maps salt's; per `.claude/memory/error-page-conformance-rule.md`, matching
the page's text or geometry is not a target. `planning/mission-guide.md` Phase 4f lists a `rack`/`rackdiag` variant as a
watch-out; upstream has no rackdiag engine (`grep -rli rackdiag ~/git/plantuml/src/main/java/net` finds only
`packetdiag/readme.md`), so nothing is ported for it, and T5 corrects the guide. `planning/roadmap.md:118` also names
rackdiag; it is the user's v1.0 definition, so T5 leaves it and journals the finding.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; the `unknown` note's "no engine yet (nwdiag 64, …)" and the `network` note's "holds no nwdiag diagrams" sentence in `scripts/parity-dashboard-notes.ts:63-65` are rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | Layout is `NTetris` over at most 100 columns (`NTetris.java` throws past 100) and a grid of networks × servers. The ratchet grows by up to 68 golden rows plus the authored count; CI's slowest shard and the routing and refusal parts are unmeasured since #162's run. T5 names the risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A shared-seam edit (`assemble-svg`, a `USymbol`, `Display`) moves another row: `verdict-diff` names it. Coverage below 90 on the new files. Routing count assertions moved by the wrong number (pep journal rows 27-28). |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |

## Baseline

Measured on `3200e13bc`, 2026-11-09, at planning, load average about 18: `npm test -- --maxWorkers=4` **exit 1**:
43,759 passed, 1 failed, 4 expected fail, 7 skipped, 6 todo, in 2,090 files (2,088 passed, 1 failed, 1 skipped),
524.55 s. The one failure is `tests/oracle/svg-conformance/oracle-freshness.test.ts` on
`network/denevo-18-toza672` (fresh 13,301 bytes, cached 13,094): native graphviz moved 16.1.0 → 16.1.1 at 11:10 that
day, and the re-capture is #164 (`.claude/memory/graphviz-16-1-1-local.md`). CI skips that test (no jar). Coverage was
not printed because a test failed. `npm run typecheck`, `npm run lint`, `npm run format:check` exit 0; `npm run build`
was not run at planning. Committed `parity-*.json` (generated 2026-11-07, unchanged since `17773baa3`): 5,355
conformant, 111 structural-match, 458 diverged, 3 oracle-error, of 5,927; `unknown` 864 / 4 / 180.

**This red baseline is why planning stopped as `blocked`** (unattended mode forbids recording a red baseline as known).
A resume re-runs Phase 8 only.

**Phase 8 rerun, 2026-11-10, still on `3200e13bc`, load average about 9: green.** Local graphviz was pinned back to
16.1.0 (`dot -V` = `16.1.0 (20260904.0139)`, `.claude/memory/graphviz-16-1-1-local.md`). `npm test -- --maxWorkers=4`
**exit 0**: 43,760 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in 2,090 files (2,089 passed, 1 skipped),
430.90 s; coverage 97.12 / 92.84 / 97.86 / 98.13 (statements / branches / functions / lines). `npm run typecheck`,
`npm run lint`, `npm run format:check`, `npm run build` exit 0. **This green run is the baseline.** The executor stays
on graphviz 16.1.0: never `brew upgrade`/`reinstall` graphviz or plantuml during the mission, and if
`oracle-freshness` goes red, check `dot -V` before anything else.
