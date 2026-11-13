# T2a: partition

**Row:** `teoz-ng-001-11`, refused today (`Syntax Error?` at `partition p`). Twins: `known-misroute` (routing),
`known-gap` (refusal). Plus the authored rows below.

## Java to read

- `sequencediagram/command/CommandGrouping.java:64-75` (TYPE includes `partition`), and its `executeArg`.
- `sequencediagram/GroupingType.java:40-73`: `partition` → `START_PARTITION`, `isStart()` true.
- `sequencediagram/SequenceDiagram.java:413-447` (`grouping`): `START_PARTITION` builds a `GroupingStart` like `START`.
- `sequencediagram/Grouping.java:59-95`: the `partition` and `partition.header` style signatures, and
  `computeStyleHeader` returning the flat style for a partition.
- `sequencediagram/teoz/TileBuilder.java:154-167`: `START_PARTITION` builds a `PartitionTile`.
- `sequencediagram/teoz/PartitionTile.java` (255 lines, extends `GroupingTile`): `TITLE_VPAD` (`:69`), the title
  block, `getPreferredDimension`, `drawU`. Every override is the spec; anything it inherits is already ported in the
  `GroupingTile` modules (see `docs/catalog.md`).
- `src/main/resources/skin/plantuml.skin`: the `sequenceDiagram { partition { ... } }` defaults, if any.
- `SName.partition`: check the port's style-name list has it.

## Steps

1. Red: a test that `partition p` parses as a frame of kind partition, and that `teoz-ng-001-11` renders the jar's
   partition rect and title (`rect x=10 y=51 width=111.287 height=45`, title `p` at `x=62.028 y=65.111`, bold 13).
2. Port the grammar (`command-grouping.ts`), the style signature (`frame-style.ts`, `sequence-skin-param.ts`), and the
   tile. Follow upstream's split: if `PartitionTile` overrides a `GroupingTile` method, the port gets the same seam,
   not an `if (partition)` inside the group code.
3. Flip the row's routing twin to `agree` and its refusal twin to `ok`, with the reason text removed, as the gates
   require.
4. **Authored rows** (task contract, "Authored rows"), under `sogr-partition-<case>`:
   `untitled`, `titled-long` (title wider than the body), `nested-group` (a group inside a partition and the
   reverse), `else` (an `else` inside a partition), `colors` (`partition #pink #lightblue p`), `skinparam`
   (any `skinparam` the partition style reads), `style-header` (`<style> sequenceDiagram { partition { header {
   FontColor red } } }`), `style-body` (`partition { BackGroundColor ... }`), `parallel` (`& partition`), and
   `with-notes` (a note inside, and a note right after `end`). Drop a case the jar refuses.
5. Pin `teoz-ng-001-11` and every authored row that reaches zero. An authored row left open after the port is a
   finding: diagnose it in this task, or journal its mechanism and leave it seeded (not pinned).

## Acceptance
- Given `teoz-ng-001-11`, when rendered on the ratchet path, then the diff count is 0 and the row is pinned.
- Given every authored `sogr-partition-*` row, then its oracle is byte-stable across two renders and it is pinned at 0,
  or the journal names its mechanism.
- Given a plain `group` row from the existing ratchet, then it is unchanged (the sequence golden ratchet passes).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
