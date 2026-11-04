# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you state
   why a row differs. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. Citations in the task files marked *lead*
   were not proved in planning; the others were read on 2026-11-03.
2. **Red.** Add a failing test under `tests/unit/state/` (or the core module's own test directory) that asserts jar values, taken
   from a cached `in.svg` or an authored oracle. Prefer an upstream fixture; author a `.puml` under `tests/fixtures/stdd-<task>/`
   only where the corpus has no row for the branch.
3. **Green.** Fix at the origin. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar, even where it
   looks like a bug. Preserve upstream names, and do not refactor beyond what the mirror needs.
4. **Measure, alone:** `npm run svg:survey -- state --out /tmp/stdd-<task>.json`, then `state-moves.mjs` against `/tmp/stdd-b0.json`.
   Exit 1 is a loss: state its mechanism or stop. If `/tmp` was cleared, rerun T0's `git show` line.
5. **Re-read the task's rows** with `row-diffs.mts`. A row that did not reach zero gets a journal line: which mechanism remains,
   and which task owns it.
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #112`. Worktree hooks are not in play here (D3), so
   prettier runs on commit.
7. **Notes.** Write `.agent-notes/stdd-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent: orchestrator or a
`typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`). Agents using
Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. The four gates, at `uptime` below ~10.
2. `npm run svg:survey`, then `verdict-diff.mjs <base>`: 0 lost in every engine. Census state, `pins-vs-census.mjs`, then `pin-state.mjs
   <yyyy-mm-dd>` and rerun `state.golden.ratchet.test.ts`, reading the collected count.
3. Tick the overview and README, append the counts to the journal with the close sha, and commit `chore(stdd): close batch <n>`.
