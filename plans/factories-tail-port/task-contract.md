# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the Java first.** Open the method, and the constructor that built its inputs. Quote `file:line` before you
   state why a fixture differs. The Java is under `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`:
   - `eggs/PSystemWelcome{,Factory}.java`, `eggs/PSystemPath{,Factory}.java`, `eggs/GraphicsPath.java`;
   - `font/PSystemListFonts{,Factory}.java`, `command/PSystemSingleLineFactory.java`, `PlainStringsDiagram.java`;
   - `crash/{CrashDiagramFactory,CrashDiagram,CommandSelectCrash,CommandCrashAny,CrashType}.java`;
   - `PSystemBuilder.java:132-290`, `error/PSystemErrorUtils.java`, `command/ProtectedCommand.java`,
     `command/PSystemCommandFactory.java`, `TitledDiagram.java`, `core/UmlSource.java#getTotalLineCount`.

   Grep `src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before you build anything.** These already exist:
   - **Gates and commands:** `singleLinePlugin` (`src/core/command/PSystemSingleLineFactory.ts`),
     `UBrexSingleLineCommand2`, the UBrex leaves, `CommandExecutionResult`, `parse-refusal.ts`, `dispatcher.ts#attempt`,
     `mergeRefusals`.
   - **Pages:** `PlainStringsDiagram`, `src/core/error/{PSystemWelcome,graphic-strings,error-diagrams}.ts`,
     `PSystemVersion.ts#getPlantumlImage`, `TitledDiagram`, `Display`, `FontConfiguration.blackBlueTrue`,
     `UFontFactory.sansSerif`.
   - **Precedent:**
     - `src/diagrams/eggs/PSystemColorsFactory.ts`: a single-line plugin.
     - `src/core/klimt/sprite/ListSpriteDiagramFactory.ts`: a command factory with `ProtectedCommand`, its own tag and
       a non-native root type.
     - `src/diagrams/help/`: a `TitledDiagram` text export.
3. **Red.** Add a failing test under `tests/unit/<package>/` that asserts jar values. Take the values from a planning
   oracle (`/tmp/ftp-plan/fx/<slug>.svg`) or from a fixture oracle in `tests/fixtures/factories/`. Where no fixture
   covers a branch, author a `.puml` and render it with `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
4. **Green.** Port the method, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs.
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone:** `npx jiti plans/factories-tail-port/measurements/fixtures.mts --dir /tmp/ftp-plan/fx` until T2a
   lands, then the same command without `--dir`.
6. **Re-read the task's fixtures** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has
   seen yet (`.claude/memory/comparesvg-count-not-monotonic.md`). A fixture that does not end (D9) gets a journal line
   that names the mechanism left and the task that owns it.
7. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #135`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ftp-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Restoring the planning oracles

If `/tmp/ftp-plan/fx` is gone, re-render each probe into its own directory, with one
`scripts/oracle-render.sh /tmp/ftp-plan/r1/<slug> <abs>/plans/factories-tail-port/probes/<slug>.puml` per probe. Then
copy `<slug>.puml` and its SVG to `/tmp/ftp-plan/fx/`. `cov-welcome-named` writes `foo.svg`, so copy that file as
`cov-welcome-named.svg`. Error probes make the jar exit non-zero, which is expected.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 1 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both,
     or the drift gate fails.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
