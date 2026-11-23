# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the source first.** Before you quote a mechanism, open the code.
   - Java: `net/sourceforge/plantuml/directdot/PSystemDot.java` and `PSystemDotFactory.java`. Cite line numbers at the
     oracle pin (`git -C ~/git/plantuml show a720bdd:src/main/java/net/sourceforge/plantuml/directdot/PSystemDot.java`).
     `~/git/plantuml` HEAD (8fec366a907 at planning) may differ.
   - graphviz C: `~/git/graphviz/lib/common/textspan.c`, `textspan_lut.c`.
   - dot-engine: `node_modules/@knowvah/dot-engine/src/common/textmeasure.ts`.
2. **Check before you build.** Grep `.agent-notes/` (`dogr-*`, `dhk-planning.md`), `docs/graphviz-issues/TRACKER.md` and
   the ledger. #186 is the finding; file no new graphviz issue.
3. **Red.** Change the test before the data: the ratchet's new `accepted` block and the corpus count (T1). Run it and
   watch it fail for the reason you expect.
4. **Green.** Add data that is measured, never typed from the brief. Every score comes from `measure-accepted.mts` or
   the ratchet's own `compareSvg` call.
5. **Gate tests:** `npx vitest run tests/oracle/svg-conformance/dot.golden.ratchet.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts tests/oracle/svg-conformance/emitter.golden.test.ts`.
   Read the collected count. Update each running count that moved, with a dated `dhk/<task>` derivation comment in the
   test's existing pattern (`dot.golden.ratchet.test.ts:150-157`).
6. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #186`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
7. **Notes.** Write `.agent-notes/dhk-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. Run `npm run parity:dashboard` and `npm run svg:dashboard`, and commit what they rewrite.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
