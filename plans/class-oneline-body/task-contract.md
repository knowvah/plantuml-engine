# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you say why a row differs. The spine:
   - `classdiagram/command/CommandCreateClass.java:88-119` (the regex, its optional empty `{}`);
   - `classdiagram/command/CommandCreateClassMultilines.java:92-100,120-142` (CODE, END, the opener);
   - `classdiagram/ClassDiagramFactory.java:105-170` (`initCommandsList` order);
   - `command/PSystemCommandFactory.java:200-215,317-340` (`getCandidate`, the SYNTAX_ERROR);
   - `regex/Pattern2.java:50-60,109-114` (`%s`, case-insensitive compile);
   - `descdiagram/command/CommandCreateElementFull.java:83-132` (for T2b's description sibling).

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's mechanism
   table is a lead, not a conclusion.
2. **Check before you build.**
   - `compileUpstream` (`src/core/command/CommandCreateElementFull.ts:48`) compiles a `%`-token pattern; use it, or
     `transform`, for the brace tail.
   - `buildSyntaxRefusal` (`src/diagrams/class/parser.ts:320`) already builds the refusal; do not add another.
   - `nbsp-trim.authored.test.ts` is the template for a manifest-shaped authored gate;
     `hidden-note-host.authored.test.ts` for ZERO/OPEN rows with `maxDiffs` and `reason`.
   - Run `ls .agent-notes | grep -iE "class|decl|brace|refus|ocb"` and read what matches.
   - Check `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: the refusal's `kind`, `line` and
   `message`, a member list, or a gate row's label and line. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every pattern carries its upstream `file:line`.
   - Preserve upstream names. Give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone:** run `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/class-oneline-body
   /tmp/ocb-<task>.json`. Then run the authored gate (read the count), then the class, object and description
   surveys (README "Measurement commands").
6. **Pin.** Move every row the task finished into its passing list in `class-oneline-body.authored.test.ts`. Lower
   each OPEN row's `maxDiffs` to today's number, and give every row still open a reason that is true today.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #223`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ocb-<task>.md` for anything unexpected, using the template in
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
