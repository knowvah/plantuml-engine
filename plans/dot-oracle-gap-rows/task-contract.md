# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the source first.** For a mechanism, open the Java method and the constructor that built its inputs, and
   quote `file:line` before you state why a row differs. The `@startdot` Java is
   `net/sourceforge/plantuml/directdot/` (`PSystemDot.java`, its factory). Grep `src/main/java/net/`, never just
   `net/sourceforge/plantuml/`. Where graphviz itself does the work, read the C at `~/git/graphviz/lib/common/`
   (`textspan.c`, `textspan_lut.c`), never Smetana's transpile. The README's leads are where to start.
2. **Check before you build.** Grep `docs/catalog.md`, `src/`, `.agent-notes/` (`ls .agent-notes | grep -i dot`;
   `T8-startdot-not-titled-diagram.md` and the `dot-engine-*` notes are there) and `docs/graphviz-issues/TRACKER.md`.
   A dot-engine finding may already be filed.
3. **Red.** Before a code change, add a failing test that asserts jar values from the row's oracle
   (`test-results/dot-cache/dot/<slug>/in.svg`). Assert specific attributes. Pinning tasks are red through the ratchet
   count test (`pins the whole known @startdot corpus`), which you raise before you pin.
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Do not refactor beyond what the mirror needs.
5. **Measure, alone:** `npx tsx plans/dot-oracle-gap-rows/measurements/measure-rows.mts /tmp/dogr-<task>.json`. No
   row may rise. Then run the dot ratchet (`npx vitest run tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`)
   and read its count.
6. **Pin** each row that reached zero (or each error-page row, T1b):
   `npx jiti plans/dot-oracle-gap-rows/tools/pin-goldens.mts dogr-<task> <task> <slug...>`. Then run
   `npx vitest run tests/oracle/svg-conformance/dot.golden.ratchet.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts`
   and update the running counts those tests assert, with a dated comment line in each test's existing pattern
   (`routing-conformance.test.ts:1087-1089`).
7. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #141`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/dogr-<task>.md` for anything unexpected, using the template in
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
2. From batch 2 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both,
     or the drift gate fails.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
