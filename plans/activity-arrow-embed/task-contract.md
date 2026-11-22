# Task contract

Every task follows these steps, in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you state why a row differs. The spine (`~/git/plantuml/src/main/java/net/sourceforge/plantuml/`):
   - `activitydiagram3/ftile/FtileFactoryDelegator.java:103-112` (`getTextBlock`);
   - `activitydiagram3/ftile/vcompact/FtileFactoryDelegatorAssembly.java:57-96` (reserve, connection, `FtileMargedRight`);
   - `activitydiagram3/ftile/vcompact/ConnectionVerticalDown.java:68-99`;
   - `activitydiagram3/ftile/Snake.java:124-133` (`withLabel`), `:226-270` (`drawInternalLabel`, `getMaxX`,
     `getTextBlockPosition`);
   - `klimt/creole/Display.java` (`create7` → `getCreole`), `klimt/creole/legacy/CreoleParser.java:142-175`,
     `klimt/creole/SheetBlock1.java`, `EmbeddedDiagram.java:126-213`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's facts are
   measurements; the leads in `decisions.md` D2 are where to start, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md`, `src/core/EmbeddedDiagram.ts`, `src/core/nested-diagram-registry.ts`,
     `src/core/svek/edge-label-embed.ts` (ele's walk and `SheetBlock1` stacking, which the activity sheet may already
     share) and `src/diagrams/activity/activity-creole-sheet.ts`.
   - `ls .agent-notes | grep -iE "embed|ele-|xetase|activity-canvas|aae-"`, and read the hits.
3. **Red.** Before a code change, add a failing test that asserts jar values from the row's oracle: the `<image>`
   width, height, x and y, the arrow `line` y1/y2, and the canvas. Assert specific attributes, never just "an image
   exists".
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Embed-free labels must not change (D3).
5. **Measure, alone:** `npx tsx plans/activity-arrow-embed/measurements/measure-probes.mts /tmp/aae-<task>.json`. No
   row's diff count may rise. After any `src/` change, also run the activity gates from the README and read the count,
   then the activity survey with `--out`.
6. **Pin.** Every probe the task covers goes into `tests/fixtures/edge-label-embed/` with its jar `.svg`, and into the
   authored gate (D5), with a dated comment line in that test's existing pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #188`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/aae-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. From batch 2 on: run `npm run svg:survey`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs 229a5a836`. It must show 0 lost in every
   engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` with the `parity-*.json` files.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
