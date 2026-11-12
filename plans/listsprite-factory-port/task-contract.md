# Task contract

Every task in this brief does these steps, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you
   state why a fixture differs. The Java is under `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`:
   - `klimt/sprite/{ListSpriteDiagramFactory,ListSpriteDiagram,CommandListSprite}.java`;
   - `klimt/sprite/Sprite{Monochrome,Color,Image,Svg}.java` (`asTextBlock`), `klimt/creole/atom/AtomSprite.java`;
   - `command/CommonCommands.java`, `command/PSystemCommandFactory.java`, `TitledDiagram.java`,
     `core/TextBlockExporter.java`, `skin/SkinParam.java:799-816`, `klimt/shape/TextBlockUtils.java#mergeTB`.

   Grep `src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before building anything.** These already exist:
   - **Parse:** `sprite-commands.ts#matchSpriteCommand`, `scale-command.ts#matchScaleCommand`,
     `annotations/index.ts#matchAnnotationCommand`, `assume-transparent.ts`, `SingleLineCommand2`, `CommandControl`,
     `ParserPass`, `PSystemBasicFactory.ts#{upstreamLinesOf,documentLineOf,preprocessingArtifactOf}`, `parse-refusal.ts`.
   - **Model:** `TitledDiagram`, `SpriteRegistry` (`sprite-registry.ts`), the sprite kinds in `src/core/klimt/sprite/`.
   - **Draw:** `Display`, `FontConfiguration.blackBlueTrue`, `UFontFactory.sansSerif`, `TextBlockUtils.mergeTB`,
     `HorizontalAlignment`, `UTranslate`, `XDimension2D`, the creole sprite atom
     (`creole-atoms-image-resolver.ts#makeAtomImageResolverFor`, `annotations/blocks-creole.ts#chromeAtomOps`).
   - **Precedent:** `src/diagrams/help/` (a `HELP`-typed `TitledDiagram` export) and `src/diagrams/regex/` (common
     commands copy, skin param, chrome and scale export, plugin).
3. **Red.** Add a failing test under `tests/unit/core/klimt/sprite/` that asserts jar values. Take the values from a
   planning oracle (`/tmp/lsp-plan/po/<slug>/<slug>.svg`, or the restore below) or a fixture oracle under
   `tests/fixtures/factories/`. Where no fixture covers a branch, author a `.puml` and render it with
   `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
4. **Green.** Port the method, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug (D8).
   - Preserve upstream names. Keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs.
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone.** From T2a on, run `npx jiti plans/creole-math-factories-port/measurements/fixtures.mts
   <cov-sprites-* slugs>` and `npx jiti plans/listsprite-factory-port/measurements/corpus-rows.mts`. Before T2a the new
   files are unreachable from `renderSync`, so the unit tests are the measure.
6. **Re-read the task's fixtures** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has
   seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A fixture that does not end (D9) gets a journal line
   naming the mechanism that remains and the task that owns it.
7. **Commit** with Conventional Commits: lines ≤80, no attribution, `Refs: #134`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/lsp-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so never run two writers at once.

## Restoring the planning oracles

If `/tmp/lsp-plan/po` is gone, re-render each probe into its own directory, one
`scripts/oracle-render.sh /tmp/lsp-plan/po/<slug> plans/listsprite-factory-port/probes/<slug>.puml` per probe. The 3
error probes make the jar exit non-zero; that is expected. T2b's `tests/fixtures/factories/<slug>.svg` replaces them
once it lands.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 2 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both,
     or the drift gate fails.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
