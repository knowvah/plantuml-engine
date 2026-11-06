# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you state
   why a row differs. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. A citation marked *lead* was not proved in planning;
   the others were read on 2026-11-04. Check `docs/catalog.md` before building anything: class already drew the middle decor, and planning nearly missed it.
2. **Red.** Add a failing test under `tests/unit/description/` (or the core module's own test directory) that asserts jar values, taken
   from a cached `in.svg` or an authored oracle. Prefer an upstream fixture; author a `.puml` under `tests/fixtures/ddd-<task>/`
   only where the corpus has no row for the branch, with `scripts/oracle-render.sh`.
3. **Green.** Fix at the origin. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even where it
   looks like a bug. Preserve upstream names, and do not refactor beyond what the mirror needs.
4. **Measure, alone.** Survey the three buckets into `/tmp/ddd-<task>/` (README, "Measurement commands"), then `moves.mjs /tmp/ddd-b0 /tmp/ddd-<task>`.
   Exit 1 is a loss: state its mechanism or stop. If `/tmp` was cleared, rerun T0's `git show` lines.
5. **Re-read the task's rows** with `row-diffs.mts`. A row that did not reach zero gets a journal line: which mechanism remains,
   and which task owns it. The family lists in [rows.md](rows.md) are leads: a row in a family it does not belong to moves on, with a line.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #113`. Prettier runs on commit (D3).
7. **Notes.** Write `.agent-notes/ddd-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent: orchestrator or a
`typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt. Write-sets are plans.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`). Agents using
Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. The four gates, at `uptime` below ~10.
2. `npm run svg:survey`, then `verdict-diff.mjs <base>`: 0 lost in every engine. List every census attribute moving away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
3. `npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance b<n>` to read it, then again with `--write`.
   Diff the baselines: a pin that rose is stop 2. `npx jiti .../measure-diff-baseline.mts`, tightening only where a value fell.
4. `npx vitest run tests/oracle/svg-conformance/description.golden.ratchet.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts`, reading the collected counts.
5. Tick the overview and README, append the counts to the journal with the close sha, and commit `chore(ddd): close batch <n>`.
