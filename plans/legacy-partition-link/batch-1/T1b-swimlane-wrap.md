# T1b: the swimlane branch of the shared wrappers

**Decisions:** D2 (swimlane half). **Fixture:** `partition-link-swimlane`.

The jar's DOT (planning render):

```
{rank=min;minPoint6 [shape=point,width=.01,label=""];}
{rank=max;maxPoint6 [shape=point,width=.01,label=""];}
sh0012 [shape=circle,…];
subgraph cluster6a {label="";subgraph cluster6 {style=solid;…label=<<TABLE …>>;
zaent0001 [shape=point,width=.01,label=""];subgraph cluster6i {label="";{rank = source; sourceIn6 [shape=point,…];minPoint6->sourceIn6  [weight=999];}
{rank = sink; sinkIn6 [shape=point,…];}sinkIn6->maxPoint6  [weight=999];
sh0010 […]; sh0011 […];
}}}
```

## Steps

1. Read `ClusterDotString.java:91-170`: `a` (`:98`) opens before the base cluster, the point (`:148-149`) and `i`
   (`:151`) come before the swimlane block (`:157-170`), so the lane's rank lines sit inside `i`.
2. Red: `wrapperLevels` on a `swimlane` cluster with `unwrappedNodeId` answers `{ a: true, p0: false, i: true,
   p1: false }` (`tests/unit/core/svek-dot-wrappers-hasport.test.ts` or a sibling); `tests/oracle/wrapper-parity.test.ts`
   gains the swimlane case (layout builder and emitter agree); `partition-link.test.ts` asserts the swimlane DOT equal.
3. Green: the one branch in `wrapperLevels`; honour `unwrappedNodeId` on a swimlane cluster in
   `svek-dot-emit-clusters.ts:416-420`, `graph-layout-build.ts:436` and `svek-dot-order.ts:130`; open the lane's rank
   lines inside `i` (`svek-dot-swimlane.ts`, both consumers). Set `unwrappedNodeId` for a linked swimlane cluster in
   `activity-legacy-dot.ts`.
4. Measure: the legacy suites, then `npx vitest run tests/oracle/wrapper-parity.test.ts tests/oracle` for the other
   engines' DOT-parity gates; read the count. Any state/class/description pin going unequal is stop 1.
5. Pin (task contract step 6).

## Acceptance
- Given `partition-link-swimlane`, then `pin-legacy-dot.mts --authored /tmp/lpl-oracle` lists it EQUAL.
- Given `swimlane-kermor`, `swimlane-no-title` and `lap-swimlane-title` (no group link), then their pinned DOTs are
  unchanged.
- Given every other engine's DOT-parity gate, then it passes unchanged.

Observability is N/A. Rollback is Reversible.
