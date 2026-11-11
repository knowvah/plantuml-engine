# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/`
   (68 files: top level, `command/`, `graphic/`). Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`.
   Check `docs/catalog.md` before building anything: `TitledDiagram`, `TextBlockUtils`, `Display`, `SheetBlock1`,
   `Opale` (`src/core/svek/image/`), `ULine`/`UPath`/`UPolygon`/`URectangle`, `UTranslate`, `Colors`/`ColorParser`,
   `StyleSignatureBasic`/`SName`/`PName`, `StereotypePattern`, `Stereotag`, `SingleLineCommand2`, `CommandMultilines2`,
   `CommandExecutionResult`, `ParserPass`, `BlocLines`, `RegexConcat`/`RegexLeaf`/`RegexOptional`/`RegexOr`,
   `LINE_STYLE` (`src/core/link-style-regex.ts`), `javaHashSetOrder` (`src/core/java-hash-set.ts`), `src/core/time/`,
   `formatDate` (`src/core/tim/builtin/date-format.ts`) and the clock (`src/core/clock.ts`) already exist.
2. **Red.** Add a failing test under `tests/unit/timing/` that asserts jar values, taken from a cached
   `test-results/dot-cache/{timing,unknown}/<slug>/in.svg`, a planning probe oracle (`/tmp/tdp-plan/oracle/`), or an
   upstream test (`DeduceFormatTest`, `TimeSeriesTest`). Author a `cov-*.puml` under `tests/fixtures/timing/` where
   nothing covers the branch, with `scripts/oracle-render.sh` and an absolute out-dir.
3. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even
   where it looks like a bug (D7). Preserve upstream names. Keep dead-looking branches where Java has them, with a
   comment when the port's types make one unreachable. Do not refactor beyond what the mirror needs. Ported symbols
   carry a JSDoc `@see` to their Java origin. Java types map per `CLAUDE.md`'s translation table, except
   `BigDecimal` (D3).
4. **Measure, alone.** From T4a on, survey `timing` and `unknown` into `/tmp/tep-<task>/`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/tep-<task>` (exit 1 is a loss:
   state its mechanism or stop), `survey-moves.mjs` per bucket against `/tmp/tep-b0/`, and `timing-rows.mjs
   /tmp/tep-<task>` for the 158. `fixtures.mts` once fixtures exist. If `/tmp` was cleared, rerun T0's restore lines.
   Before T4a the new files are unreachable from `renderSync`, so the unit tests are the measure.
5. **Re-read the task's rows** with `row-diffs.mts` once T4a has run. `compareSvg` short-circuits, so a fix can reveal a
   diff nobody has seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A row or fixture that did not reach zero
   gets a journal line: which mechanism remains, and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #127`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/tep-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent:
orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt.
Write-sets are plans (`CLAUDE.md`, ruling 2026-11-03): change another repository file when the work needs it and
journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Coverage before turn-on

Batches 1 to 3 add code no render reaches, so `npm test`'s 90/90/90 gate counts it only through unit tests. Each task
tests every exported member and every branch it ports, with jar values; a branch only a full diagram reaches gets a
test that builds the objects directly. Read the coverage summary at each batch close.

## Batch close

1. The gates in the README, at `uptime` below ~10.
2. From batch 4 on: `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs
   <base>`: 0 lost in every engine. List every census attribute moving away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`). The full survey rewrites
   `tests/oracle/svg-conformance/parity-*.json`: run `npm run parity:dashboard` and commit both, or the drift gate fails
   (close order: survey, dashboard, drift test).
3. A newly conformant row in another engine (a `{{ }}` timing inside another diagram, if any appears): re-pin only that
   engine's equality pins with its own tool; never lower a never-rises ceiling to 0 by hand.
4. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(tep): close batch <n>`.
