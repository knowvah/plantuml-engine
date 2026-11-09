# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The engine is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/`
   (12 files); its base is `net/atmp/CucaDiagram.java`, **outside** `net/sourceforge/plantuml/`. Grep
   `src/main/java/net/`. Check `docs/catalog.md` before building anything: `CucaDiagram`, `Entity`, `Quark`,
   `LeafType`, `GroupType`, `Display`, `Colors`, `Stereotype`, `Url`/`UrlBuilder` (with `transform`, the `%pLN`/`%g`
   macro expander, `src/core/url/UrlBuilder.ts`), the UBrex builders (`src/core/ubrex/builder/`),
   `UBrexSingleLineCommand2`, `CommandExecutionResult`, `ParserPass`, `Opale`, `EntityImageNoteLink`, `SvekResult`
   and `layoutGraph` already exist.
2. **Red.** Add a failing test under `tests/unit/activity-legacy/` that asserts jar values, taken from a cached
   `test-results/dot-cache/<bucket>/<slug>/{in.svg,svek-N.dot}` or a probe oracle. Author a probe where no row covers
   the branch, with `scripts/oracle-render.sh`.
3. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar,
   even where it looks like a bug (D9). Preserve upstream names. Keep dead-looking branches where Java has them, with
   a comment when the port's types make one unreachable. Do not refactor beyond what the mirror needs. Ported
   symbols carry a JSDoc `@see` to their Java origin.
4. **Measure, alone.** Before T3a the new files are unreachable from `renderSync`, so unit tests are the measure.
   From T3a on, survey `activity`, `unknown` and `network` into `/tmp/laep-<task>/`, run `legacy-rows.mjs` on that
   directory, and `board-moves.mjs` per bucket against `/tmp/laep-b0/`. Exit 1 is a loss: state its mechanism or
   stop. If `/tmp` was cleared, rerun T0's `git show` lines.
5. **Re-read the task's rows** with `measurements/row-diffs.mts` once it exists (T2c). `compareSvg` short-circuits,
   so a fix can reveal a diff nobody has seen. A row or probe that did not reach zero gets a journal line: which
   mechanism remains, and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #123`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/laep-<task>.md` for anything unexpected, in the template of
   `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent:
orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt. Write-sets
are plans.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.
A background agent dies when a headless turn ends (`.claude/memory/headless-background-agent-killed.md`): run
subagents in the foreground.

## Batch close

1. The gates in the README, at `uptime` below ~10.
2. From batch 3 on: `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs
   <base>`: 0 lost in every engine. List every census attribute moving away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`). The full survey rewrites
   `tests/oracle/svg-conformance/parity-*.json`: regenerate `docs/parity-report.md` and commit both, or the drift gate
   fails.
3. A newly conformant row in another engine: re-pin only that engine's equality pins with its own tool; never lower a
   never-rises ceiling to 0 by hand.
4. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(laep): close batch <n>`.
