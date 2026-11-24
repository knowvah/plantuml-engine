# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you say why a row differs. The spine:
   - `objectdiagram/command/CommandCreateEntityObject.java:76-85,118-148` (regex, duplicate check, `getColor(s)`);
   - `objectdiagram/command/CommandCreateEntityObjectMultilines.java:136-181`;
   - `objectdiagram/command/CommandCreateJson.java:85-100,141-153,197-226`;
   - `objectdiagram/command/CommandCreateJsonSingleLine.java:76-98,136-186`;
   - `klimt/color/ColorParser.java:43-46,89-91` and `klimt/color/HColorSet.java:69-110`;
   - `command/SingleLineCommand2.java:160-181`, `command/CommandMultilines2.java:115-124`,
     `command/CommandExecutionResult.java:85-86`;
   - `command/PSystemCommandFactory.java:214-247` (the error line of a multi-line command);
   - `ClassDiagramFactory.java:105-125`, `StateDiagramFactory.java:110-120`, `DescriptionDiagramFactory.java:125-135`.

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's mechanism
   table is a lead, not a conclusion.
2. **Check before you build.**
   - `HColorSet.ts` already has `getColorOrNull`, `getColor` (throws `NoSuchColorException`), `colorOrNeutral` and
     `UNKNOWN_COLOR_NEUTRAL`. `ColorParser.ts` exports `COLOR_REGEXP`.
   - `CommandExecutionResult.badColor()` (`src/core/command/CommandExecutionResult.ts:76`) holds the message and the
     score.
   - `ParseState.pendingBodyRefusal` (`class-parse-state.ts:79`, consumed at `class/parser.ts:190-195`) already defers
     a class block refusal to its `}`.
   - `class-oneline-body.authored.test.ts` is the template for the gate (D5).
   - Run `ls .agent-notes | grep -iE "ucol|auc|colour|color|object|json|ocr"` and read what matches.
   - Check `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: the refusal's `kind`, `line`,
   `message` and `commandScore`, or a gate row's label and line. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every pattern and constant carries its upstream `file:line`.
   - Preserve upstream names. Give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/object-colour-refusal
   /tmp/ocr-<task>.json`. Then run the authored gate and read the count. Then run the object, class, state and
   component surveys (README "Measurement commands").
6. **Pin.** Move every row the task finished into its passing list in `object-colour-refusal.authored.test.ts`. Lower
   each OPEN row's `maxDiffs` to today's number, and give every row still open a reason that is true today.
7. **Commit** in Conventional Commits: lines ≤80, footer `Refs: #190`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ocr-<task>.md` for anything unexpected, using the template in
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
