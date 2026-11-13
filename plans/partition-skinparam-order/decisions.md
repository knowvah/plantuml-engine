# Decisions

These are pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Mechanism | a frame's fill, line and title colour come off its merged positional style (`FtileGroup.java:99-102`) |
| D2 | Tier order | inline `#color` → the existing stereotype and gated bucket tiers → **merged style** → the flat tiers (hand-built themes only) |
| D3 | Scope | activity frames, all five keywords; description and class are guard rows only |
| D4 | Public API | `graph.activity.compositeStyleOf?: ActivityCompositeStyleResolver` replaces the hidden symbol key |
| D5 | Rows and pins | 43 `<engine>__frameorder-*` rows in `diagram-style-scope`, pinned at today's counts in T1 |
| D6 | Execution | serial, main checkout, no worktrees; one commit per task; squash at the end |

### D1: Mechanism
`FtileGroup`'s constructor (`FtileGroup.java:99-102`) reads `getFontConfiguration` (title colour),
`BackGroundColor` and `LineColor` off `stylePartition`. That style is built at the command
(`CommandPartition3.java:160-161`): the signature `root, element, activityDiagram, <symbol>, composite`
(`FtileGroup.java:89-92`), `withTOBECHANGED(stereotype)`, merged with `getCurrentStyleBuilder()`. The port already
builds the same style per frame: `withActivityCompositeStyle` (`activity-box-style.ts:206-222`), positional through
`builderAtPosition` (`activity-box-builder-at.ts:47-54`). It reaches the tile as `GtileGroup.compositeStyle`
(`gtile-group.ts:143-144`) and the node as `ActivityNodeGeo.compositeStyle`. Today only the font size, the face and the
thickness are read from it (`activity-composite-theme.ts:26-37`). T2 adds the three colours.

Colours become paints the way `activity-circle-style.ts#paintOf` (`:73-83`) does it, including `isDark` for
`skinparam mode dark` (`TitledDiagram.java:294`, `ColorMapper.java:68-72`). `#00000000` must reach the SVG as
`none`, as the transparent row requires.

**Evidence:** planning measured the hidden resolver on all 14 open rows. Each one's three colours equal the jar's,
including `frame-then-own` (jar `none`), `own-then-frame-then-partition` (`#AAA`) and `partition-then-own-transparent`
(`none`) (README, "Evidence for D1").

### D2: Tier order
The new read goes **after** the tiers that only the gated path writes: `stereotypeBack`, `stereotypeLine` and
`stereotypeFont` (`activity-scoped-colors.ts`), and the `composite.<symbol>` bucket. It goes **before** the flat
tiers: `graph.partition*`, `elements.<symbol>`, `graph.package*` and `COMPOSITE_TITLE_FONT_COLOR`.

- A styled source keeps today's bytes, because both styled rows are already at 0.
- A theme built by `buildTheme` always carries the resolver, so for every real render the flat tiers stop deciding
  frame colours.
- They stay as the fallback when `node.compositeStyle` is undefined: a hand-built theme in a unit test, or a frame
  with no symbol.
- Do not delete them. That is a refactor beyond the mirror, and the unit tests that build themes by hand rely on them.

dss-T3d recorded that `<style>` blocks are positional in activity while the buckets are not. A merged-style-first order
would fix that too, but it is not this issue: journal any row it would move as a follow-on.

### D3: Scope
Upstream's order question exists wherever two converted selectors meet in one signature. Planning probed every place
where `composite` appears (`grep -rn SName.composite src/main/java/net`):
- `FtileGroup.java:91`, the activity frames. **Open:** 14 rows across `rectangle`, `card`, `package` and `group`.
  `partition` has no second key, since its symbol is `partition` and no skinparam converts onto it, so its rows are
  0 and stay as guards.
- `ClusterHeader.java:159-164`, cuca group titles. 6 guard rows in description and class are already at 0.
- `FromSkinparamToStyle.java`, the converter itself.

#138 names `rectangle` and `partition`. `card`, `package` and `group` are in scope because the mechanism and the fix are
the same ("the long tail is the deliverable").

### D4: Public API
`Theme.colors.graph.activity` (`theme-graph-colors-b.ts:392-410`) gains
`compositeStyleOf?: ActivityCompositeStyleResolver`, next to `boxStyleOf` and with the same JSDoc style.
- `withActivityCompositeStyle` writes the field instead of the `COMPOSITE_STYLE_KEY` symbol.
- `activityCompositeStyleOf(theme)` reads the field, or goes, with its one caller
  (`activity-composite-theme.ts#compositeStyleOf`) reading the field directly.
- The resolver's signature is unchanged: `(symbol, stereotype, position) => Style | undefined`.
- `Style` already appears in the public d.ts through `boxStyleOf`. T0 snapshots `dist/*.d.ts`, and T3 diffs it.
- The only allowed change is the field, the exported resolver type, and their JSDoc (stop 5).

This is the "new `Theme` field" the maintainer leaned towards in #110: "I'm guessing a new Theme field is the better
answer". It leaves dss D3 as written. The gate, `documentStyleBuilder` and the bucket writers are untouched.

### D5: Rows and pins
- **Rows:** the 43 probes in `plans/partition-skinparam-order/probes/` and their jar oracles are copied into
  `tests/fixtures/diagram-style-scope/`, keeping dss's `<engine>__<group>-<case>` naming with group `frameorder`.
  Never hand-edit an oracle.
- **Pins:** T1 pins every row at its measured count with `pin-rows.mjs` (14 open rows at 1 or 2), so the ratchet is
  shrink-only from the start. T2 lowers all 14 to 0.
- **No new family:** the ratchet test `diagram-style-scope.ratchet.test.ts` picks the rows up from the directory.

### D6: Execution
This is a size:S mission with one mechanism, so it runs serially in the main checkout. The orchestrator writes, or one
`typescript-pro` subagent whose prompt is `task-contract.md`, this file and the task file. There are no worktrees and
never two writers at once. Each task makes one unsigned commit with the footer `Refs: #138`, and T4 squashes them.

## Operational readiness

- **Observability:** N/A. This is a pure library, with no new operations, services or I/O.
- **Rollback:** Reversible. Revert the squash commit; no data or format migrates.
- **Scalability:** the resolver already runs once per frame for the font and thickness. Reading three more values off
  the same `Style` adds no builder work.
- **Failure modes:**
  1. A conformant activity row whose frame colour came from a flat tier the builder lacks, such as monochrome or a
     theme seed. It is detected by `verdict-diff` and the census, and it is stop 1 until the mechanism is quoted.
  2. Dark mode painted without `isDark`. It is detected by the survey's dark rows; an authored row is a push-forward.
  3. A `<style>` source moving because of D2's order. It is detected by `verdict-diff` and the pinned dss rows.
- **Backwards compatibility:** the public d.ts gains one optional field (D4). Nothing is removed or narrowed.

## Auto-confirmed (unattended)

Planned on 2026-11-12 by `/plan-mission --unattended next`, with no maintainer present. The queue selected #138,
the lowest `queue:ready` issue with no open blocker.

**D1, recommendation taken:** read the merged positional style, carried as a Theme field.

**Rejected:**
- **Reopen dss D3 for these keys,** writing `elements.<symbol>` and `composite.<symbol>` for no-style sources. #138
  forbids it: "file a `needs-ruling` issue with the evidence rather than reopening D3 here."
- **An order field (the declaration rank of each `Partition*` and symbol key) consulted by the flat chain.** It fails 3
  measured rows. The flat theme tiers hold the document's final values, so a key declared after the frame still
  reaches it (`frame-then-own`, `own-then-frame-then-partition`), and a rank comparison has no answer for `transparent`
  against the skin default (`partition-then-own-transparent`). It would also re-implement `DarkString`'s priority
  outside the style engine.
- **A pre-resolved colour field** (per symbol: back, line, font). It duplicates the resolver that already exists and
  loses the stereotype and position arguments.

**Why this is not a parking case:** #138 sets the direction (a Theme field) and says what done means, and the
public d.ts change is declared expected. Planning measured the D1 evidence on every open row. No maintainer-reserved
decision is left, and no divergence is needed.

**D2, D3, D5:** each follows from D1 and the measurements. They are recorded above with their evidence.
