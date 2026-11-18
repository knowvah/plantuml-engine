# legacy-partition-link (lpl)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #157 (from #123, `legacy-activity-engine-port` T3c). Planned unattended on 2026-11-17 at
`feature/parity-queue` `c9c107e7b`.

## Objective

A legacy activity link whose end is a partition (`A --> P`, `P --> (*)`) draws as the jar draws it. Today
`src/diagrams/activity-legacy/activity-legacy-dot.ts:273-277` (`requireLeaf`) throws `unported:` and we draw an
error page; `tests/fixtures/activity-legacy/partition-link.puml` is 21 diffs from its jar oracle.

How the jar does it (read at planning; quote it again before you change anything):

- **Edge ends.** `SvekEdge` takes `startUid = link.getEntityPort1(bibliotekon)` (`svek/SvekEdge.java:249-250`).
  For a group with no `SvekNode`, `Bibliotekon#getNodeUid` answers `Cluster.getSpecialPointId(ent)`
  (`svek/Bibliotekon.java:126-137`), which is `CENTER_ID + group.getUid()` = `"za" + "ent0001"`
  (`svek/Cluster.java:104,653-655`).
- **The special point.** `ClusterDotString#printInternal` computes `thereALinkFromOrToGroup2 =
  isThereALinkFromOrToGroup(lines)` over every `SvekEdge` of the pass (`svek/ClusterDotString.java:91-96,317-323`).
  When true it opens the `a` wrapper (`:98-99`), writes `zaent0001 [shape=point,width=.01,label=""]` inside the base
  cluster (`:148-149`) and opens `i` (`:151-152`); `p0`/`p1` stay unless swimlanes are on (`:107-115`,
  `protection0/1`, `:299-315`).
- **ltail / lhead.** Not DOT attributes: Java-side `Cluster`s found by `getCluster2` (`SvekEdge.java:219-225,
  252-258`). After the solve, `dotPath.simulateCompound(lhead.getRectangleArea(), ltail.getRectangleArea())`
  (`:671-672`, `klimt/shape/DotPath.java:418-…`) trims the spline to the cluster box. The jar's `P --> (*)` path
  starts with the 8 halvings that clip leaves (`M54,187.759 C54,187.807 …`).
- **Extremities.** Under the `SIMPLEST` strategy `getExtremitySimplier` gets `nodeContact = null` for a cluster end,
  so `side` is `null` (`SvekEdge.java:539-565,682-688`). `drawU` asks `getSvekCluster1/2().getMagneticBorder()` when
  there is no node (`:921-942`, `Cluster.java:726-758`).

The jar's `svek-1.dot` for `partition-link` (rendered at planning with `scripts/oracle-render.sh`):

```
sh0012 [shape=circle,…];
subgraph cluster6a {label="";subgraph cluster6p0 {label="";subgraph cluster6 {style=solid;…label=<<TABLE …>>;
zaent0001 [shape=point,width=.01,label=""];subgraph cluster6i {label="";subgraph cluster6p1 {label="";
sh0010 [shape=circle,…];
sh0011 [shape=rect,style=rounded,…];
}}}}}
sh0010->sh0011[…];
sh0011->zaent0001[…];
zaent0001->sh0012[…];
```

What exists: `DotInputCluster.innerMarginLevels`/`unwrappedNodeId` (`src/core/graph-layout-cluster.types.ts:99-155`,
used by class and state for their `zaent` anchors), the shared wrapper decision `src/core/svek-dot-wrappers.ts`
(`wrapperLevels`), and the `simulateCompound` port `src/core/spline-clip.ts` (`clipSplineStart`, `clipSplineEnd`).
A probe at planning with only the throw removed failed at `dot-engine: no spline for edge edge-1`: the edge named the
group's uid, which is no node.

This mission:

1. writes the special point, the wrappers and the `za` edge ends into the legacy DOT, plain partitions first (T1a),
   then under swimlanes (T1b, a shared-core wrapper change) and under `!pragma kermor on` (T1c);
2. maps the special point out of the solved nodes and clips each cluster-ended spline with `simulateCompound`, then
   draws it (T2a);
3. adds 10 authored fixtures (D5) and pins them in the SVG ratchet and the DOT-parity gate as they reach 0;
4. measures every engine (T3) and squashes (T4).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `legacy-partition-link/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- `npm run catalog` if a module's header or exports change (drift-gated).
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Oracles:** `scripts/oracle-render.sh /tmp/lpl-oracle/<slug> <puml>`, one out dir per slug, never a hand-typed
  `java -jar`. The out dir keeps `<slug>.svg` and `svek-1.dot`; the DOT gate's `--authored` flag reads
  `/tmp/lpl-oracle/<slug>/svek-N.dot`.
- **Fixtures, SVG:** `npx jiti plans/legacy-activity-engine-port/measurements/fixtures.mts <slug> [<slug> …]` prints
  `slug<TAB>diffs<TAB>firstDiff`.
- **Fixtures, DOT:** `npx jiti plans/legacy-activity-engine-port/measurements/pin-legacy-dot.mts --authored
  /tmp/lpl-oracle` prints each row's failing structural checks; `--write` pins the EQUAL ones.
- **SVG baseline:** `npx jiti plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts <sha>`
  (`--write` to replace `oracle/goldens/svg-activity-legacy/authored-baseline.json`).
- **Legacy suites:** `npx vitest run tests/unit/activity-legacy tests/oracle/activity-legacy-dot-parity.test.ts
  tests/oracle/svg-conformance/activity-legacy.diff-baseline.ratchet.test.ts`; read the count.
- **Every engine, at exit:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.

## Stop conditions (halt, journal, report)

1. A verdict or pinned golden moves away from the jar in any engine, or a DOT-parity pin of state, class or
   description goes unequal after T1b. Name the mechanism with `file:line`, amend `decisions.md`, halt.
2. A pinned golden would have to be re-captured or removed (adding new pins is not this).
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt.
5. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead
   (`docs/graphviz-issues/` + `TRACKER.md`, CLAUDE.md) and treat the fixture as an open row (push-forward 2).

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- An authored fixture that cannot reach 0 inside its task (push-forward 2).
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

1. **Read the Java first** for every number. A diff names the attribute, never the cause; no constant without its
   upstream `file:line`.
2. **A fixture stuck above 0** after one diagnosis pass (the artifact in `~/.claude/rules/diagnosis.md`): file a
   `parity` issue labelled `queue:ready` with the mechanism, add the slug to `OPEN_ROWS` in both
   `tests/oracle/svg-conformance/activity-legacy.diff-baseline.ratchet.test.ts:47` and
   `build-authored-baseline.mts` with the issue number as its reason, journal it, continue. `partition-link` itself
   is never pushed forward this way: it is the issue's bar.
3. A jar DOT that differs from what this README quotes: the jar wins; journal the difference.
4. Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.
5. A shared-core edit (T1b) that moves another engine's DOT text but not its structure or SVG: keep it only with a
   journalled quote of the Java branch that produces the jar's text.

## Blast radius

- **Data model:** none.
- **API:** none. `renderSync` output changes only for legacy activity sources with a link to a partition, which
  draw an error page today. `DotInputCluster` is internal (0 hits in `dist/*.d.ts` at planning).
- **Shared core (T1b):** `wrapperLevels` and the two consumers of a cluster's wrappers (layout builder, DOT emitter,
  node order) gain a swimlane branch. Only legacy activity sets `DotInputCluster.swimlane` (laep journal row 22), so
  no other engine can reach it; the every-engine survey and the DOT-parity gates prove it (stop 1).
- **Dependencies:** nothing new.

| File | Action | Task |
|---|---|---|
| `src/core/svek/Cluster.ts` | Modify: `CENTER_ID`, `getSpecialPointId` (D1) | T1a |
| `src/diagrams/activity-legacy/activity-legacy-dot.ts` | Modify: special point, cluster flags after the edges, `za` ends | T1a, T1b, T1c |
| `tests/unit/activity-legacy/partition-link.test.ts` | Create | T1a-T2a |
| `tests/fixtures/activity-legacy/partition-link-*.puml` + `.svg` (10, D5) | Create (from `fixtures/`) | T1a |
| `oracle/goldens/svg-activity-legacy/authored-baseline.json` | Modify (re-measured) | T1a, T2a |
| `oracle/goldens/activity-legacy/<slug>/` | Create (DOT pins) | T1a-T1c |
| `tests/oracle/svg-conformance/activity-legacy.diff-baseline.ratchet.test.ts:47` | Modify `OPEN_ROWS` | T1a, T2a |
| `plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts` | Modify `OPEN_ROWS` | T1a, T2a |
| `src/core/svek-dot-wrappers.ts`, `svek-dot-emit-clusters.ts`, `graph-layout-build.ts`, `svek-dot-order.ts`, `svek-dot-swimlane.ts` | Modify (swimlane branch, D2) | T1b |
| `tests/oracle/wrapper-parity.test.ts`, `tests/unit/core/svek-dot-wrappers-hasport.test.ts` | Modify (a swimlane case) | T1b |
| `src/core/graph-layout*.ts` / emitter (an undeclared node, D3) | Modify only if D3 holds | T1c |
| `src/diagrams/activity-legacy/layout-geometry.ts` | Modify: special point out of nodes, `simulateCompound` | T2a |
| `src/diagrams/activity-legacy/renderer-edge.ts` | Modify: cluster magnet if non-zero (D4) | T2a |
| `docs/parity-report.md`, `docs-site/parity.md`, `tests/oracle/svg-conformance/parity-*.json` | Modify only if not just `generatedAt` | T3 |
| `planning/next-missions.md`, `plans/legacy-activity-engine-port/README.md:195` | Modify (strike #157) | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline, oracles](batch-0/overview.md) | T0 | [x] |
| [1: the DOT](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2: solve and draw](batch-2/overview.md) | T2a | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #157)

- [x] `npx jiti plans/legacy-activity-engine-port/measurements/fixtures.mts partition-link` prints 0. (journal 13, 17)
- [x] `partition-link`'s DOT is structurally EQUAL to the jar's `svek-1.dot` and pinned in
      `oracle/goldens/activity-legacy/partition-link/`; `pin-legacy-dot.mts` lists it as EQUAL. (journal 5)
- [x] `partition-link` is gone from `OPEN_ROWS` (ratchet test and `build-authored-baseline.mts`). (journal 15-16)
- [x] The 10 D5 fixtures are committed with their jar SVGs; each is at 0, or an `OPEN_ROWS` entry whose reason names
      a filed issue and its mechanism. (journal 15-17: all 10 at 0)
- [x] 0 verdict movers away from the jar in every engine, base survey against final survey. (journal 18)
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. (journal 17, 19)

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [fixtures/](fixtures/): the 10 authored sources (D5); the jar draws all of them (planning render).
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`npm`, `npx jiti`,
`npx vitest`, `node`, `git`, `gh issue`, `scripts/oracle-render.sh`). It is deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-17)

**Tasks:** T0, T1a, T1b, T1c, T2a, T3 done; T4 (squash) follows. Per-task history on `legacy-partition-link/pre-squash`.
No stop condition hit, no question open, no issue filed (no fixture needed a push-forward).

**Gates (journal 17, 19):** `npm test -- --maxWorkers=4` 2299 files / 49458 passed (base 49173: +285, the 11 fixtures'
ratchet/DOT/wrapper-parity rows and `partition-link.test.ts`), coverage 96.96/92.55/97.43/98.00; typecheck, lint,
build, format:check 0. No gate needed a fix.

| fixture | SVG diffs base → exit | DOT |
|---|---|---|
| `partition-link` | 21 (error page) → 0 | EQUAL, pinned |
| `partition-link-to-partition` | new → 0 | EQUAL, pinned |
| `partition-link-from-outside` | new → 0 | EQUAL, pinned |
| `partition-link-nested` | new → 0 | EQUAL, pinned |
| `partition-link-label` | new → 0 | EQUAL, pinned |
| `partition-link-colored` | new → 0 | EQUAL, pinned |
| `partition-link-ltr` | new → 0 | EQUAL, pinned |
| `partition-link-self` | new → 0 | EQUAL, pinned |
| `partition-link-empty` | new → 0 | EQUAL, pinned |
| `partition-link-swimlane` | new → 0 | EQUAL, pinned |
| `partition-link-kermor` | new → 0 | EQUAL, pinned |

**Verdicts, base `c9c107e7b` → exit:** `verdict-diff.mjs` "lost 0, timeout or errored 0", no row moved; every
`parity-*.json` changed only `generatedAt` and was reverted; `npm run parity:dashboard` wrote no change.

**DOT pins:** `oracle/goldens/activity-legacy/` +11 (135 EQUAL with the 124 rows), size backlog empty.
**Authored baseline:** 112 rows, 101 zero, 8 jar error pages, 3 open (`pragma-elk`, `pragma-elk-if` #158,
`pragma-smetana` library-forced). **d.ts:** no new symbol in `dist/*.d.ts` (`DotInputNode`, `Cluster` internal).

**Beyond the planned write-set (journalled):** `DotInputNode.implicit` across `graph-layout.types.ts`,
`svek-dot-sequence.ts`, `svek-dot-emit.ts`, `svek-dot-order.ts`, `graph-layout-build*.ts` (T1c); new
`activity-legacy-dot-ends.ts` (file cap); `Cluster.ts`' magnetic-border guard (`packageGroup`, opt-in),
`renderer-cluster.ts#buildCluster`, `renderer-svek-result.ts#autoLinkOfAGroupDx` (T2a).

**Follow-ons (`.agent-notes/lpl-T2a.md`):** description's `buildCluster(...).getMagneticBorder()` does not set
`packageGroup` (unmeasured); the group-autolink shift now lives in three engines (state, description, legacy).
**CI risk:** low. `wrapper-parity.test.ts` now also sweeps the activity-legacy goldens (kermor graphs skipped).
