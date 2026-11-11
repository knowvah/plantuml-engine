# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/`
   (10 files) and the tiles in `…/ebnf/`. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. Check
   `docs/catalog.md` before building anything: `TitledDiagram`, `TextBlockUtils`, `CharInspector`/`CharInspectorImpl`,
   `BlocLines#inspector`, `I18n`, every `ETile*` class and `Symbol` in `src/diagrams/ebnf/`, `StyleExtractor`
   (`src/diagrams/json/`), `SingleLineCommand2`, `CommandExecutionResult` and `ParserPass` already exist.
2. **Red.** Add a failing test under `tests/unit/regex/` that asserts jar values, taken from a cached
   `test-results/dot-cache/regex/<slug>/in.svg`, a planning probe oracle (`/tmp/rep-plan/oracle/`), or a fixture
   oracle. Author a `cov-*.puml` under `tests/fixtures/regex/` where no row covers the branch, with
   `scripts/oracle-render.sh` and an absolute out-dir.
3. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even
   where it looks like a bug (D4). Preserve upstream names. Keep dead-looking branches where Java has them, with a
   comment when the port's types make one unreachable. Do not refactor beyond what the mirror needs. Ported symbols
   carry a JSDoc `@see` to their Java origin.
4. **Measure, alone.** From T3a on, survey `regex` into `/tmp/rep-<task>/`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/rep-<task>` (exit 1 is a loss:
   state its mechanism or stop), `survey-moves.mjs /tmp/rep-b0/parity-regex.json /tmp/rep-<task>/parity-regex.json` for
   what moved, and `regex-rows.mjs /tmp/rep-<task>` for the 46. `fixtures.mts` once fixtures exist. If `/tmp` was
   cleared, rerun T0's restore lines. Before T3a the new files are unreachable from `renderSync`, so the unit tests
   are the measure.
5. **Re-read the task's rows** with `row-diffs.mts` once T3a has run. `compareSvg` short-circuits, so a fix can reveal a
   diff nobody has seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A row or fixture that did not reach zero
   gets a journal line: which mechanism remains, and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #126`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/rep-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent:
orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt.
Write-sets are plans.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. The gates in the README, at `uptime` below ~10.
2. From batch 3 on: `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs
   <base>`: 0 lost in every engine. List every census attribute moving away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`). The full survey rewrites
   `tests/oracle/svg-conformance/parity-*.json`: run `npm run parity:dashboard` and commit both, or the drift gate fails
   (close order: survey, dashboard, drift test).
3. A newly conformant row in another engine (a `{{regex}}` row, if any appears): re-pin only that engine's equality
   pins with its own tool, never lower a never-rises ceiling to 0 by hand.
4. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(rep): close batch <n>`.
