# T2b: the subset/superset middle decor

**Java:**
- `svek/extremity/MiddleSubset.java` and `MiddleFactorySubset.java`;
- `decoration/LinkMiddleDecor.java:49-69`;
- `svek/SvekEdge.java:353-356` (`labelShield`) and `:982-989` (the draw).

**Do:**
1. First grep callers of `withMiddleSubset`/`withMiddleSuperset` in `src/`, and journal that only Chen reaches them, so
   no other engine's output can move.
2. Port `MiddleSubset`: `radius = 6`, `length = 10`, `UStroke.withThickness(1.5)`, the `reverse ? -45 : 135` rotation,
   an `UEllipse` arc of `(angle + rotate, 180)`, and two `ULine`s. Port `MiddleFactorySubset(reverse)`: `SUBSET` is
   `false` and `SUPERSET` is `true` (`LinkMiddleDecor.java:63-66`).
3. Add the arm to `LinkMiddleDecor#getMiddleFactory`, or to the dispatch in `MiddleCircleDecor.ts#drawMiddleDecor`,
   whichever mirrors upstream more closely without moving the `CIRCLE*` arms. Update the header's DEFERRED note.
4. `SvekEdge` sets `labelShield = 7` for any non-`NONE` middle decor. Check that ours does.

## Acceptance
- Given `cov-subclass-super` and `cov-subclass-sub`, then the decor's `path` (the arc) and its two `line`s match the
  oracle's coordinates to the comparator's tolerance.
- Given `cov-multi-d` and `cov-multi-U`, then the decor sits on the subclass links for `d` and on the superclass link
  for `U` (D8).
- Given every existing `CIRCLE*` lollipop test, then they still pass unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
