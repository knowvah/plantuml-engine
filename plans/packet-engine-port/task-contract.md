# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/`, plus `nwdiag/VerticalLine.java` and `nwdiag/NwDiagram.java`. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. Citations without a line number were read in planning by method name, so find the line. Check `docs/catalog.md` before building anything.
2. **Red.** Add a failing test under `tests/unit/packetdiag/` (or `tests/unit/nwdiag/`) that asserts jar values, taken from a cached `in.svg` or a fixture oracle. Prefer a vega source; author a `cov-*.puml` under `tests/fixtures/packet/` only where neither the corpus nor vega covers the branch, with `scripts/oracle-render.sh`.
3. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even where it looks like a bug: last-block row height, the dropped rotation, the undrawn open sides (D6). Preserve upstream names. Keep dead-looking branches where Java has them, with a comment when the port's types make one unreachable. Do not refactor beyond what the mirror needs. Ported symbols carry a JSDoc `@see` to their Java origin.
4. **Measure, alone.** From T3a on, survey `packet` into `/tmp/pep-<task>/`, then `packet-moves.mjs /tmp/pep-b0/parity-packet.json /tmp/pep-<task>/parity-packet.json`, and `probe-dir.mts tests/fixtures/packet` once fixtures exist. Exit 1 is a loss: state its mechanism or stop. If `/tmp` was cleared, rerun T0's `git show` line. Before T3a the new files are unreachable from `renderSync`, so the unit tests are the measure.
5. **Re-read the task's rows** with `row-diffs.mts` once T3a has run. `compareSvg` short-circuits, so a fix can reveal a diff nobody has seen. A row or fixture that did not reach zero gets a journal line: which mechanism remains, and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #117`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/pep-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent: orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt. Write-sets are plans.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`). Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. The gates in the README, at `uptime` below ~10.
2. From batch 3 on: `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: 0 lost in every engine. List every census attribute moving away from the jar (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
3. Tick the overview and README, append the counts to the journal with the close sha, and commit `chore(pep): close batch <n>`.
