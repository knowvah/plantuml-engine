# Task contract

Every task in this brief does these steps, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you
   state why a fixture differs. The Java is under `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`:
   - `cheneer/` (9 files);
   - `svek/image/EntityImageChen*.java`, `svek/extremity/MiddleSubset.java` and `MiddleFactorySubset.java`;
   - `svek/GeneralImageBuilder.java`, `svek/SvekEdge.java`, `svek/DotStringFactory.java` and
     `svek/GraphvizImageBuilder.java`;
   - `net/atmp/CucaDiagram.java`, which lives outside `net/sourceforge/plantuml/`.

   Grep `src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before building anything.** These already exist:
   - **Model:** `CucaDiagram` (with `cleanId`, `quarkInContext`, `reallyCreateLeaf` and `getPortId`), `Entity`
     (`muteToType`, `setStereotype`, `setStereostyle`, `setColors`), `Link` (`setPortMembers`, `setColors`),
     `LinkType` (`goBold`, `withMiddleSubset`, `withMiddleSuperset`), `LinkArg`, `LinkMiddleDecor` (`SUBSET`,
     `SUPERSET`), and `LeafType.CHEN_*`.
   - **Parse and style:** `UBrexCommandRankDir`, `SingleLineCommand2`, `ColorParser`, `Stereotype`, and `SName`
     (`chenEerDiagram`, `chenEntity`, `chenRelationship`, `chenAttribute`, `circle`).
   - **Draw:** `TextBlockInEllipse`, `UEllipse` with start and extend, `UPolygon`, `URectangle`, `AbstractEntityImage`,
     `ShapeType`, `SvekEdge`, `SvekResult`, and `graph-layout.ts#layoutGraph` (the one dot-engine seam).
   - **ELK:** `src/core/elk/` and `src/diagrams/description/description-elk-adapter.ts`.
   - **Precedent:** `src/diagrams/activity-legacy/`, a `CucaDiagram` engine drawn through svek: the skin param, common
     commands, DOT, layout, renderer and plugin (D2).
3. **Red.** Add a failing test under `tests/unit/cheneer/`, or `tests/unit/core/svek/` for the shared images, that asserts
   jar values. Take the values from a planning oracle (`/tmp/cee-plan/po/<slug>/`, or the restore below) or from a
   fixture oracle under `tests/fixtures/cheneer/`. Where no fixture covers a branch, author a `.puml` and render it with
   `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
4. **Green.** Port the method, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug (D8).
   - Preserve upstream names.
   - Keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs.
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone.** From T3a on, run `npx jiti plans/chen-eer-engine-port/measurements/fixtures.mts`, and
   `pin-cheneer-dot.mts --authored /tmp/ceep-dots` once T3b has rendered the jar DOTs. From batch 3 on, at batch close,
   run the every-engine survey (README). Before T3a the new files are unreachable from `renderSync`, so the unit tests
   are the measure.
6. **Re-read the task's fixtures** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has
   seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A fixture that does not end (D12) gets a journal line
   naming the mechanism that remains and the task that owns it.
7. **Commit** with Conventional Commits: lines ≤80, no attribution, `Refs: #133`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ceep-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so never run two writers at once.

## Restoring the planning oracles

If `/tmp/cee-plan` is gone, re-render each probe in its own directory (each DOT is `svek-1.dot`). Run this from a
`node` script, or one `scripts/oracle-render.sh /tmp/cee-plan/po/<slug> plans/chen-eer-engine-port/probes/<slug>.puml`
per probe. T3b's `tests/fixtures/cheneer/<slug>.svg` replaces them once it lands.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 3 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both,
     or the drift gate fails.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
