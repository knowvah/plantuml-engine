# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/`. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. Citations without a line number were read in planning by method name, so find the line. Check `docs/catalog.md` before building anything.
2. **Red.** Add a failing test under `tests/unit/chart/` that asserts jar values, taken from a cached `in.svg` or an authored oracle. Prefer an upstream fixture; author a `.puml` under `tests/fixtures/chart/` only where the corpus has no row for the branch, with `scripts/oracle-render.sh`.
3. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even where it looks like a bug: the black scatter, the dead grid arm, the unregistered `grid` command. Preserve upstream names. Keep the dead-looking branches: `if (color == null)` stays where Java has it, with a comment saying the port's `asColor` never answers null when the type makes it unreachable. Do not refactor beyond what the mirror needs. Ported symbols carry a JSDoc `@see` to their Java origin.
4. **Measure, alone.** From T4a on, survey `chart` into `/tmp/cep-<task>/`, then `chart-moves.mjs /tmp/cep-b0/parity-chart.json /tmp/cep-<task>/parity-chart.json`. Exit 1 is a loss: state its mechanism or stop. If `/tmp` was cleared, rerun T0's `git show` line. Before T4a, the new files are unreachable from `renderSync`, so the unit tests are the measure.
5. **Re-read the task's rows** with `row-diffs.mts` once T4a has run. `compareSvg` short-circuits, so a fix can reveal a diff nobody has seen. A row that did not reach zero gets a journal line: which mechanism remains, and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #116`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/cep-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent: orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt. Write-sets are plans.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`). Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. The gates in the README, at `uptime` below ~10.
2. From batch 4 on: `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: 0 lost in every engine. List every census attribute moving away from the jar (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
3. Tick the overview and README, append the counts to the journal with the close sha, and commit `chore(cep): close batch <n>`.
