# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you say why a row differs. The spine:
   - `sequencediagram/command/CommandParticipant.java:80-86,142-202` (TYPE/CREATE groups, the exists branch,
     `getColor(s)`);
   - `CommandParticipantA.java:59-76`, `A2:59-72`, `A3:59-72`, `A4:59-68` (the shared tail);
   - `CommandParticipantMultilines.java:79-93,136-176` (COLOR captured, never read);
   - `CommandActivate.java:60-83,116-131` and `SequenceDiagram.java:366-380` (bare `create`, CREATE colours);
   - `SequenceDiagramFactory.java:99-156` (registration order);
   - `klimt/color/HColorSet.java:69-76`, `command/SingleLineCommand2.java:160-181`,
     `command/CommandExecutionResult.java:85-86`, `error/PSystemError.java:417`.

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's mechanism
   table is a lead, not a conclusion.
2. **Check before you build.**
   - `refusesAsBareColor` and `colorOrNeutral` live in `src/core/klimt/color/HColorSet.ts`.
   - `CommandExecutionResult.badColor()` (`src/core/command/CommandExecutionResult.ts:76`) holds the message and the
     score.
   - Description's `executionErrorScore` (`description/parse-state.ts:109-110`, consumed at `description/parser.ts:350-354`)
     is the shape to copy for sequence.
   - `object-colour-refusal.authored.test.ts` is the template for the gate (D7).
   - Run `ls .agent-notes | grep -iE "ucol|auc|colour|color|ocr|ubrr|sequence"` and read what matches.
   - Check `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: the refusal's `kind`, `line`,
   `message` and `commandScore`, or a gate row's label and line. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every pattern and constant carries its upstream `file:line`.
   - Preserve upstream names. Give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/actor-line-routing
   /tmp/alr-<task>.json`. Then run the authored gate and read the count. Then run the sequence, component, usecase and
   class surveys (README "Measurement commands").
6. **Pin.** Move every row the task finished into its passing list in `actor-line-routing.authored.test.ts`. Lower
   each OPEN row's `maxDiffs` to today's number, and give every row still open a reason that is true today.
7. **Commit** in Conventional Commits: lines ≤80, footer `Refs: #191`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/alr-<task>.md` for anything unexpected, using the template in
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
