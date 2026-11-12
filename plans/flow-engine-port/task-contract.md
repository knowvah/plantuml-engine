# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The Java is in `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`:
   `flowdiagram/` (5 files) and `golem/` (10 files), plus `TitledDiagram`, `core/TextBlockExporter` and
   `command/PSystemCommandFactory` for the export and parse paths. Grep `src/main/java/net/`, not just
   `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before building anything.** These already exist:
   - Diagram and parsing: `TitledDiagram`, `SkinParamFresh`, `SingleLineCommand2`, `CommandExecutionResult`,
     `ParserPass`, `RegexConcat`/`RegexLeaf`/`RegexOptional` (`src/core/regex/`);
   - Text: `Display` (`create`, and its `create(ctx, alignment)` render), `UFontFactory`, `FontConfiguration`
     (`blackBlueTrue`, `src/core/abel/`);
   - Shapes: `URectangle` (`rounded`), `UEllipse`, `ULine`, `UStroke`, `UTranslate`, `HColors`;
   - Precedents: `src/diagrams/bpm/{BpmDiagramFactory,bpm-export,index}.ts`, the template for the factory walk, the
     export and the plugin.
3. **Red.** Add a failing test under `tests/unit/golem/` or `tests/unit/flow/` that asserts jar values. Take them from
   `test-results/dot-cache/unknown/bemixo-79-xulu250/in.svg`, a planning probe oracle (`/tmp/flp-plan/oracle/`), or a
   fixture oracle. Where no row covers the branch, author a `cov-*.puml` under `tests/fixtures/flow/` and render it with
   `scripts/oracle-render.sh <absolute-out-dir> <puml>`. Because of D4, assert on sets of boxes or on one box by its
   label, never on the jar's box order.
4. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug (D8).
   - Preserve upstream names.
   - Keep dead-looking branches where the Java has them (D1 lists the only exceptions).
   - Do not refactor beyond what the mirror needs.
   - Ported symbols carry a JSDoc `@see` to their Java origin.
5. **Measure, alone.** From T3a on:
   - Survey `unknown` into `/tmp/flp-<task>/`.
   - Run `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/flp-<task>`. Exit 1 is a
     loss: state its mechanism, or stop.
   - Run `survey-moves.mjs`, `flow-rows.mjs`, and `fixtures.mts` once fixtures exist.
   - Run `multiset.mjs` on every multi-box row and fixture.

   Before T3a the new files are unreachable from `renderSync`, so the unit tests are the measure. If `/tmp` was
   cleared, rerun T0's restore lines.
6. **Re-read the task's rows** with `row-diffs.mts` once T3a has run. `compareSvg` short-circuits, so a fix can reveal
   a diff nobody has seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A row or fixture that is neither
   conformant nor multiset-equal gets a journal line: which mechanism remains, and which task owns it.
7. **Commit** with Conventional Commits: lines ≤80, no attribution, `Refs: #132`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/flp-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

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
3. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(flp): close batch <n>`.
