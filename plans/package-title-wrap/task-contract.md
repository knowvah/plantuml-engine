# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line` before
   you say why a row differs. The spine:
   - `svek/image/EntityImageDescription.java:142-210` (the three styles, `desc`, `name`, `asSmall`);
   - `cucadiagram/BodyFactory.java:74-82`, `cucadiagram/BodyEnhanced1.java:92-193`,
     `cucadiagram/MethodsOrFieldsArea.java:240-266`;
   - `decoration/symbol/USymbolFolder.java` (`asSmall`, `getMargin`, `getDimTitle`);
   - `svek/GeneralImageBuilder.java:206-210`, `svek/GraphvizImageBuilder.java:418-430` (an empty package becomes an
     `EMPTY_PACKAGE` leaf; with a `USymbol` it is drawn by `EntityImageDescription`);
   - `klimt/creole/Display.java:118-122` (`equalsLike`).

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are
   starting points, not conclusions.
2. **Check before you build.**
   - `buildCreate2Name` (`EntityImageDescriptionName.ts:150-166`) is the one title builder; sizer and renderer both
     call it. Change it once.
   - `buildDesc` (`EntityImageDescriptionDelegates.ts:344-380`) is the template for a `LineBreakStrategy` from a
     number.
   - `sizedFromStyle` (`leaf-sizing-entity.ts:249-268`) is the template for "style first, then opts".
   - Run `ls .agent-notes | grep -iE "folder|wrap|title|ptw"` and read what matches.
   - `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: the title block's width and height
   from `measureShownFolderTitle`, the DOT node size, or a gate row's diff count. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every constant carries its upstream `file:line`.
   - Preserve upstream names; give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone:** `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/package-title-wrap
   /tmp/ptw-<task>.json`, then the authored gate (read the count), then the description surveys (README "Measurement
   commands").
6. **Pin.** Move every row the task took to 0 into `ZERO` in `package-title-wrap.authored.test.ts`, lower each OPEN
   row's `maxDiffs` and `maxComments` to today's numbers, and give every row still open a reason that is true today.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #219`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ptw-<task>.md` for anything unexpected, using the template in
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
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` with the `parity-*.json` files.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
