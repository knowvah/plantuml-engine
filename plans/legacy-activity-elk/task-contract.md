# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line` before
   you say why a row differs. The spine:
   - `net/atmp/CucaDiagram.java:462-490` (`getTextBlock`, the maker choice);
   - `elk/CucaDiagramFileMakerElk.java` whole (501 lines): `getLabel` `:190-248`, `printAllSubgroups` `:315-341`,
     `printSingleGroup`, `prinEntity`, `manageSingleEdge`, `printEntityInternal` `:462-475`, `getTextBlock` `:477-500`;
   - `elk/MyElkDrawing.java`, `elk/MyElkCluster.java`, `elk/MyElkEdge.java`: what each reads off the adapter;
   - `activitydiagram/ActivityDiagram.java`, `activitydiagram/command/` for the groups and links the engine builds.

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are
   starting points, not conclusions.
2. **Check before you build.**
   - Read `ElkDiagramAdapter.ts` whole, then `cheneer-elk-adapter.ts`, `cheneer/layout-elk.ts` and
     `cheneer/layout.ts:70-81`: the template (D1, D2). For the cluster half, read how `description-elk-adapter.ts`
     answers `getClusterHeader`, `getClusterStyle*` and `getClusterBackColor`, and what the legacy svek path already
     computes for a partition (`activity-legacy/renderer-cluster.ts`, `core/svek/ClusterHeader.ts`).
   - Run `ls .agent-notes | grep -iE "elk|laep|cdd8|ceep"` and read what matches.
   - `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: an adapter member's answer for a
   parsed diagram (a dimension, an id list, a group type), or a row's diff count. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every constant carries its upstream `file:line`.
   - Preserve upstream names; give every new symbol a JSDoc `@see` to its origin.
   - No legacy row without the pragma may move.
5. **Measure, alone:** `npx tsx plans/legacy-activity-elk/measurements/measure.mts tests/fixtures/activity-legacy
   /tmp/lae-<task>.json`, then the legacy ratchet (`npx vitest run tests/oracle/svg-conformance/activity-legacy`,
   read the count) and the DOT gate.
6. **Pin.** Re-run `build-authored-baseline.mts <HEAD sha> --write`, drop every row the task took to 0 from
   `OPEN_ROWS` in both the ratchet and the builder, and give every row still open a reason that is true today.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #158`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/lae-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` with the `parity-*.json` files.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
