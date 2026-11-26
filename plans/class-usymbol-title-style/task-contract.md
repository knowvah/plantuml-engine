# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you say why a row differs. The spine:
   - `svek/image/EntityImageDescription.java:111-113,115-177` (`getStyleQuery`, the constructor: `queryTitle`,
     `styleTitle`, `forecolor`, `backcolor`, `roundCorner`, `deltaShadow`, `stroke`, the three fonts);
   - `svek/GeneralImageBuilder.java:162-180` (`CIRCLE`, `DESCRIPTION`, `USECASE`, `USECASE_BUSINESS` all build
     `EntityImageDescription`);
   - `abel/Entity.java:760-772` (`getCurrentStyleBuilder`: the entity's own builder, or the last when
     `isSkinParamUsed()`);
   - `style/FromSkinparamToStyle.java:166-169` (`title*` skinparams become a bare `title` style);
   - `style/Style.java:316-345` (`getStroke`, `getStroke(colors)`), `:212-227` (`eventuallyOverride(colors)`);
   - `svek/image/ActorStickMan.java` (how the stroke thickness reaches the actor's drawn ink);
   - `classdiagram/ClassDiagramFactory.java:105-135` and `classdiagram/command/CommandCreateElementFull2.java:280-300`.

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's mechanism
   table is a lead, not a conclusion.
2. **Check before you build.**
   - `description-entity-style.ts#descriptionEntityStyle` already builds the same `styleTitle` for the description
     engine with `componentDiagram`; its `symbolSNames` maps a `USymbol` to its SNames. Reuse it (D1); do not write
     a second mapping.
   - `services.styleBuilder(generation)` (`src/core/elk/elk-backend.ts:42`) answers the entity's own builder, as
     `description/index.ts:149-151` uses it. `Classifier.styleGeneration` (`class-classifier-ast.ts:240`) is already
     stamped and copied to `ClassifierGeo` (`class-geo-builders.ts:143,372`).
   - `annotateStateLeafStyles` (`class-state-leaf.ts:108-122`) and `annotateObjectStyles` (`class-object-style.ts:167`)
     are the class engine's templates for stamping a merged style on a classifier in `layoutSync`.
   - `measureEntityLeaf` reads `entitySizing.thickness` (`src/core/svek/image/leaf-sizing-entity.ts:189,263`).
   - `stylePaint` (`src/core/style/style-reads.ts:23`) returns the long hex form (`#FF0000`); assert long forms in unit
     tests that read a `Style` (`.agent-notes/uts-T1b.md`).
   - Run `ls .agent-notes | grep -iE "uts|cogr|title|usymbol|allowmix"` and read what matches. Check
     `docs/catalog.md` before writing a helper.
3. **Red.** Before a code change, add a failing test that asserts exact values: a stroke colour and width, a fill, a
   leaf dimension, or a gate row's diff count. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every signature and constant carries its upstream `file:line`.
   - Preserve upstream names. Give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts
   tests/fixtures/class-usymbol-title-style /tmp/cuts-<task>.json`, then both authored gates (README "Measurement
   commands") and read the counts. Then run the class survey.
6. **Pin.** Move every row the task finished into `ZERO`. Lower each `OPEN` row's `maxDiffs` to today's number, and
   give every row still open a reason that is true today.
7. **Commit** in Conventional Commits: lines ≤80, footer `Refs: #195`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/cuts-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability: N/A. There are no new observable operations.
- Rollback: Reversible. Revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey` in the background, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`. Commit `docs/parity-report.md` with the `parity-*.json` files. If only
   `generatedAt` changed, leave them at HEAD and journal that.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
