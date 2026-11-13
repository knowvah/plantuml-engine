# T3b: page 1 of a `newpage` diagram

**Row:** `teoz-ng-001-5` (9 diffs). Page 1 is four activating messages, then `newpage`; page 2 has anchors and more
activations. The jar's page 1 is 216 high and ends with the newpage dashed line (`x1=10 x2=392.012 y=165`,
`stroke-dasharray:2,2`, width 0.5). Ours is 275 high, with 8 more children and a vertical line at `x=141.3` where the
jar's dashed line is. The jar cached both pages (`in.svg`, `in_001.svg`); the ratchet compares `in.svg`.

## Java to read

- `teoz/NewpageTile.java`, `teoz/UGraphicNewpages.java`.
- `teoz/PlayingSpaceWithParticipants.java:90-110`: the page's y range from
  `getNewpageTiles().get(pageIndex - 1).getYGauge()`.
- `teoz/GroupingTile.java:1251-1257` (`addNewpageTiles`).
- `teoz/LiveBoxes.java`: how a live box open across a page break is cut.

## Steps

1. Compare our page 1 with the jar's element by element (`diff-one.mts teoz-ng-001-5`) and find the first element we
   draw that the jar does not. Write the mechanism with `file:line`.
2. Red: assert the page height and the dashed line.
3. Port. Then pin the row.
4. Check `in_001.svg` against our page 2 with a scratch script. A difference there is a follow-on (README
   push-forward), unless it shares page 1's mechanism.

## Acceptance
- Given `teoz-ng-001-5`, then page 1 is at 0 diffs and pinned.
- Given the pinned `newpage` rows (for example `Sequence-delay-destroy-newpage-style`), then they are unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
