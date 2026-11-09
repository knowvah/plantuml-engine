# Decisions

All recorded unattended on 2026-11-06; the user audits them here.

## Auto-confirmed (unattended)

### D1 — A new engine, file for file, on our `CucaDiagram` port
`ActivityDiagram extends CucaDiagram` (`ActivityDiagram.java:56`), so the port extends `src/core/cucadiagram/CucaDiagram.ts`, the full port of `net/atmp/CucaDiagram.java` that description already builds on (`src/diagrams/description/index.ts`). It lives in **`src/diagrams/activity-legacy/`**, one TS file per Java file of `net/sourceforge/plantuml/activitydiagram/` (12 files, 1,823 lines), names kept: `ActivityDiagram`, `ConditionalContext`, `ActivityDiagramFactory`, `command/CommandLinkActivity`, and so on. The directory is not `activitydiagram/` because `src/diagrams/activity/` already holds activitydiagram3, and the two would read as one. **Rejected:** translating legacy sources into the state engine's AST and drawing them there: state has start, end, choice and fork bars, but upstream builds a different diagram class from a different factory, and "a structural divergence IS the bug" (`CLAUDE.md`). **Rejected:** growing `src/diagrams/activity/`: that engine mirrors `ActivityDiagramFactory3` and ftile, never svek (`registered-plugins.ts:113-121`).

### D2 — Render through svek, from the shared `src/core/svek/` modules
Upstream draws every cuca diagram through one svek pipeline (`CucaDiagramFileMakerSvek.java:59-87`: simplifier, `DotStringFactory`, `GraphvizImageBuilder`). Ours has no shared `GraphvizImageBuilder`; each cuca engine composes the shared pieces: `graph-layout.ts#layoutGraph` (the one dot-engine seam), `svek/SvekResult.ts`, `svek/image/Opale.ts`, `svek/image/EntityImageNoteLink.ts`, `svek/svek-edge-*.ts`, `svek/Cluster.ts`. The legacy engine does the same. The five leaf images it needs that have no shared port (`EntityImageActivity`, `EntityImageBranch`, `EntityImageCircleStart`, `EntityImageCircleEnd`, `EntityImageSynchroBar`, with `CircleStart` and `CircleEnd`) go to **`src/core/svek/image/`**, their upstream package. State keeps its own drawings of start, end, choice and bars: switching it to the new files would be a refactor during a port, and state is at 297/299. Journal the duplication as a follow-on. A shared command port (note commands, `UBrexCommandHideShow2`, `UBrexCommandRankDir`, `UBrexCommandFootboxIgnored`, common commands 1) is reused if `docs/catalog.md` lists one; otherwise port it at its upstream package under `src/core/command/` when it is engine-neutral, or into the engine when its types are not yet in core. **Rejected:** generalising description's layout and renderer into a shared `GraphvizImageBuilder`: right in the long run, but a cross-engine refactor that puts component's 266/266 at risk. Journal it as a follow-on.

### D3 — Register at upstream's slot, between class and description
`PSystemBuilder.java:137` adds `ActivityDiagramFactory` after `ClassDiagramFactory` and before `DescriptionDiagramFactory`. `registered-plugins.ts#registerUmlRun` gets `registry.register(activityLegacyPlugin); // java:137`, and the comment block at `:104-121` is rewritten to say the legacy factory now exists. Dispatch already attempts each parse in order and picks the error page by score (`PSystemErrorUtils.java:140-147`), so the factory must **refuse exactly where the jar's does**. A conformant row of another engine that moves to the legacy engine is our parser over-accepting: the 124 rows are every cached source the jar drew through this factory, so any other mover is stop 1. **Rejected:** slot 6 next to activitydiagram3: then description and state would claim legacy sources the jar gives to this factory, which is today's misroute.

### D4 — Printed type `ACTIVITY`, chrome by the cuca path
The jar writes `data-diagram-type="ACTIVITY"` for both activity engines, but legacy activity is a `UmlDiagram` exported like state and description, not like activitydiagram3. `assemble-svg.ts:297-325` switches on `fragment.diagramType`, so the legacy fragment needs its own routing key that still prints `ACTIVITY`. T2c picks the smallest mechanism the existing `RenderFragment` allows (a distinct internal key mapped to the printed type, or the state/description finalizer reached by an explicit flag) and proves it on `lap-chrome` (title, header, footer, legend, caption). **Rejected:** reusing `finalizeActivityFragment`: it is activitydiagram3's.

### D5 — Graphviz geometry is a target
Legacy activity reaches real graphviz upstream (`svek-N.dot` in every row's cache), so `CLAUDE.md`'s Smetana carve-out does not apply: the DOT and its geometry are targets. T2b builds the DOT the way `DotStringFactory` does and T4 adds a DOT-parity gate like `tests/oracle/state-dot-parity.test.ts`, with goldens under `oracle/goldens/activity-legacy/<slug>/`. A geometry delta that is dot-engine's goes in `docs/graphviz-issues/` and `TRACKER.md` after `dot -Tdot` on the cached `svek-N.dot` proves it (`.claude/memory/dot-engine-blame-needs-real-dot.md`); dot-engine is pinned at 2.10.3 and is never edited.

### D6 — Fixtures: the 124 rows, the 28 planning probes, then more
The 124 rows cover `if`, arrows, sync bars and notes well, and partitions, styles and chrome thinly. The 28 probes in `probes/` are the floor; T3c adds what they miss: each chrome element alone and with `scale 2`, `!theme` on two stdlib themes, `skinparam handwritten true`, `skinparam monochrome true`, dark mode, a `<style> activityDiagram { ... }` on each element, `hide`/`show` variants, `top to bottom direction`, `(*top)` and `(*N)` ends, `else` without `if` (an error), `endif` without `if`, an unterminated long activity, a `partition` closed by `}` and by `end partition`, notes on every side, `note on link` before any link, `{{ }}` inside an activity, `newpage`, `left to right direction` with partitions. Render into `tests/fixtures/activity-legacy/<slug>.{puml,svg}` with `scripts/oracle-render.sh`, one directory per source when its DOT is needed. **Rejected:** stopping at the corpus: the issue says "Fixture counts are small, so author more", and `CLAUDE.md` says the corpus is not a ceiling.

### D7 — Ratchet: a new `svg-activity-legacy` family
`render-fixture-activity.ts` calls activitydiagram3's pipeline directly, so legacy pins cannot share `svg-activity`. T4 copies `board.golden.ratchet.test.ts`, `board.diff-baseline.ratchet.test.ts` and `render-fixture-board.ts` with the legacy engine substituted, pins carrying `type` (`activity`, `unknown`, `network`) the way c4 pins carry `tree` (`parity-dashboard-goldens.ts:40-41`). `RATCHET_FAMILY` gains `svg-activity-legacy` on `activity`, `unknown` and a new `network` entry. Routing and refusal rows move from `known-misroute` to `agree`, moving the count assertions, as bep T4 did. **Rejected:** a `tree` field inside `svg-activity`: its render helper would need a dispatch branch the activitydiagram3 suite does not have.

### D8 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named divergence with a forcing library (KaTeX for `<latex>`/`<math>`, the oracle seam for `{{ }}`, platform glyph outlines); a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked by" line added to #136. **No row ends unnamed.** `oracle/accepted-divergences.json` is never edited here. Planning found no forcing library in the engine itself.

### D9 — Mirror upstream's quirks
Port as the jar does it, with a one-line comment quoting the Java: `ActivityDiagram#getDotStrings` (dead under svek, kept); the `@Deprecated` `getLastEntityBrancheConsulted`; `CommandInnerConcurrent` and `concurrentActivity` (ported and unregistered, as the factory comments it out at `ActivityDiagramFactory.java:98`); `ConditionalContext`'s `IllegalArgumentException` on a non-branch; the activity `rect` drawn outside any `<g>` while start, end and branch get one. **Rejected:** grouping the activity rect for symmetry: the jar does not.

### D10 — Serial, main checkout, one commit per task
The batches build one engine upward in one directory; worktrees need symlinked assets and skip git hooks (`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until T3a, so `npm test` stays green through batches 1 and 2, measured by unit tests. **Rejected:** parallel worktrees, and one big commit (the journal cites per-task commits through `pre-squash`).

### D11 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `CommandLinkActivity` (460 Java lines) and the renderer will need splits: keep the Java method's name on the entry point and `@see` on each helper. Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

## Operational readiness (auto-confirmed)

- **Observability:** N/A. A browser-safe library with no service, SLI or trace. The measures are the survey verdicts, ratchets and DOT-parity gate.
- **Rollback:** Reversible. Revert the squashed commit; no data, schema or published contract changes.
- **Scale:** a new plugin in the dispatch loop. Each `@startuml` source the class factory refuses is now tried against one more command list before description; T5 compares survey wall time before and after and journals it. CI risk: the new ratchet adds 124 golden rows plus authored fixtures; record their local wall time at T4.
- **On-call:** N/A. The failure mode is a misroute, caught by the routing and refusal gates.
- **Compatibility:** no public API change. `dist/*.d.ts` compared with a base build at T5.

## Baseline

Measured at planning on `2313f74e0` (2026-11-06, load about 5): `npm test -- --maxWorkers=4` exit 0, 2057 files passed
(1 skipped), 42886 tests passed, 4 expected fail, 7 skipped, 6 todo; coverage statements 97.31%, branches 93.19%,
functions 98%, lines 98.27%. `npm run lint` exit 0. Typecheck, build and `format:check` were not run at planning; T0's
`npm run build` is the first build on the base.
