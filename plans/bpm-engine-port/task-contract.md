# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/` (36 files),
   plus `activitydiagram3/ftile/{Hexagon,AbstractFtile}.java` and `activitydiagram3/ftile/vertical/` for T1b. Grep
   `src/main/java/net/`, not just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before building anything.** These already exist: `TitledDiagram`, `Display`
   (`getWithNewlines`, `create`, `isNull`), `SkinParamFresh`, `CircleStart` (`src/core/svek/image/`), `AbstractFtile`,
   `FtileGeometry`, `BoxStyle`, `FtileBoxOld` (the sheet pipeline to copy for `FtileBox`), `SheetBlock1`, `SheetBlock2`,
   `TextBlockMemoized`, `UFontFactory`, `FontConfiguration`, `HColors`, `ULine`, `UPolygon`, `UTranslate`,
   `SingleLineCommand2`, `CommandExecutionResult` and `ParserPass`.
3. **Red.** Add a failing test under `tests/unit/bpm/` (or `tests/unit/activity/ftile/` for T1b) that asserts jar
   values. Take them from a cached `test-results/dot-cache/unknown/<slug>/in.svg`, a planning probe oracle
   (`/tmp/bpe-plan/oracle/`), or a fixture oracle. Where no row covers the branch, author a `cov-*.puml` under
   `tests/fixtures/bpm/` and render it with `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
4. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug (D8).
   - Preserve upstream names.
   - Keep dead-looking branches where the Java has them (D1 lists the only exceptions).
   - Do not refactor beyond what the mirror needs.
   - Ported symbols carry a JSDoc `@see` to their Java origin.
5. **Measure, alone.** From T3a on:
   - Survey `unknown` into `/tmp/bpe-<task>/`.
   - Run `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/bpe-<task>`. Exit 1 is a
     loss: state its mechanism, or stop.
   - Run `survey-moves.mjs /tmp/bpe-b0/parity-unknown.json /tmp/bpe-<task>/parity-unknown.json` to see what moved.
   - Run `bpm-rows.mjs /tmp/bpe-<task>` for the 7 rows, and `fixtures.mts` once fixtures exist.

   Before T3a the new files are unreachable from `renderSync`, so the unit tests are the measure. If `/tmp` was
   cleared, rerun T0's restore lines.
6. **Re-read the task's rows** with `row-diffs.mts` once T3a has run. `compareSvg` short-circuits, so a fix can reveal
   a diff nobody has seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A row or fixture that did not reach
   zero gets a journal line: which mechanism remains, and which task owns it.
7. **Commit** with Conventional Commits: lines ≤80, no attribution, `Refs: #130`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/bpe-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A, since there are no new observable operations. Rollback: Reversible (revert the commit).
Agent: the orchestrator, or a `typescript-pro` subagent given this file, `decisions.md` and the task file as its
prompt. Write-sets are plans: change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so never run two writers at once.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 3 on, run `npm run svg:survey`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The full survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit
     both, or the drift gate fails. The close order is survey, dashboard, drift test.
3. If a row becomes conformant in another engine (T1a and T1b touch shared seams), re-pin only that engine's equality
   pins, with its own tool. Never lower a never-rises ceiling to 0 by hand.
4. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(bpe): close batch <n>`.
