# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Quote `file:line` before you change anything. The spine:
   - upstream (grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`):
     `svek/ClusterDotString.java:72-210,299-323`, `svek/ClusterDotStringKermor.java:69-196,275-281`,
     `svek/Bibliotekon.java:126-137`, `svek/Cluster.java:104,653-655,726-758`,
     `svek/SvekEdge.java:219-258,539-565,618-700,915-942,1270-1281`, `klimt/shape/DotPath.java:418-490`,
     `svek/GraphvizImageBuilder.java:209-298,348-440` (our code comments cite an older layout of this file: trust the Java)
   - ours: `src/diagrams/activity-legacy/activity-legacy-dot.ts`, `layout-geometry.ts`, `renderer-edge.ts`,
     `src/core/svek-dot-wrappers.ts`, `src/core/svek-dot-emit-clusters.ts:400-430`,
     `src/core/graph-layout-build.ts:370-440`, `src/core/svek-dot-order.ts:120-140`, `src/core/svek-dot-swimlane.ts`,
     `src/core/spline-clip.ts`, `src/core/svek/SvekEdge.ts:238-292,375-385`,
     `src/diagrams/class/class-dot-clusters.ts:120-175` (the pattern D2 follows).
2. **Check before you build.** `ls .agent-notes | grep -iE "laep|T3c|T4"` and read the hits;
   `grep -n "partition-link\|#157" plans/legacy-activity-engine-port/decision-journal.md`.
3. **Red.** A failing test first, in `tests/unit/activity-legacy/partition-link.test.ts`: the DOT of a fixture against
   its jar `svek-N.dot` (use the parse/compare helpers the DOT-parity test uses, `tests/oracle/svek-dot.ts`), or the
   SVG diff count. Watch it fail on the current tree.
4. **Green.** Make the change the task names. Preserve upstream names; every ported symbol carries `@see` to its Java.
5. **Measure, alone.** The fixture commands in the README, then the legacy suites; read the counts. Then
   `npm run typecheck`.
6. **Pin.** For every authored fixture that reached 0 SVG diffs or an EQUAL DOT in this task: remove it from both
   `OPEN_ROWS`, run `build-authored-baseline.mts <HEAD sha> --write` and `pin-legacy-dot.mts --authored
   /tmp/lpl-oracle --write`. Diff the JSON you rewrote: any pin that ROSE is stop 1 (memory
   `repin-script-raises-preexisting-red-pin`).
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #157`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/lpl-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator. Each task edits the file the previous one edited (`activity-legacy-dot.ts`), so subagents
  would serialize anyway and add handoff cost. A read-only `Explore` agent for a Java sweep is allowed.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run the legacy suites and `fixtures.mts` over every `partition-link*` slug; journal the table.
3. At the exit close only: the every-engine survey and `verdict-diff.mjs <base>` (T3).
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
