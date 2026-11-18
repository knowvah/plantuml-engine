# Graphviz 16.1.1 `flat_reorder` bails out on a rank with incoming flat edges; dot-engine still re-sorts it

**Fixed in `dot-engine` 2.12.3 (`fbb98c92`, "fix(dot): skip flat_reorder on a rank with a constrained flat edge").**
On the repro below, 2.12.3 places `sh0006`, `sh0007` and `sh0008` at native 16.1.1's x (centres 20.68, 96.68,
173.68), both edges straight, on a 194.76 x 48 graph. Ticked in `TRACKER.md` (2026-11-18, #164).

**Verified 2026-11-09 (#164), `dot-engine` 2.12.0, native graphviz 16.1.1 (20261108.1752).** The plantuml-ts
oracle moved to native 16.1.1 by user ruling the same day. On the jar's own `svek-N.dot`, dot-engine and native
16.1.1 lay out the same rank of flat edges in different orders. dot-engine's order is the one native 16.1.0
drew: all 123 rows below were conformant against the 16.1.0 oracle, and our output did not change.

## Reproduce

`class/duruga-39-lani451`, from `class A` / `A<-B` / `C<-B`. The jar's `svek-1.dot`:

```
digraph unix {
nodesep=0.486111;
ranksep=0.833333;
remincross=true;
searchsize=500;
sh0006->sh0007[arrowtail=none,arrowhead=none,minlen=0,color="#000009"];
sh0008->sh0007[arrowtail=none,arrowhead=none,minlen=0,color="#00000D"];
sh0006 [shape=rect,label="",width=0.574479,height=0.666667,color="#000006"];
sh0007 [shape=rect,label="",width=0.574479,height=0.666667,color="#000007"];
sh0008 [shape=rect,label="",width=0.585417,height=0.666667,color="#000008"];

}
```

## Observed

- native 16.1.1 (`dot -Tdot`): `sh0006` x 20.681, `sh0007` x 96.681, `sh0008` x 173.68. Both edges are straight,
  and `bb="0,0,194.76,48"`.
- dot-engine 2.12.0 (`renderSvg(src, 'dot')`): `sh0006` at x 0, `sh0008` at x 76.61, `sh0007` at x 154. The edge
  `sh0006->sh0007` arches over `sh0008`, and the canvas is 87.39 tall instead of 48.

## Mechanism (upstream change)

Graphviz commit `9fb21f570` (2026-09-13, first released in 16.1.1), "dotgen flat_reorder: fix: bail out if
incoming edges are constrained" (fixes graphviz #2368, #2854). In `lib/dotgen/mincross.c` at 16.1.1,
`flat_reorder` (`:1328`) now sets `valid_rank = false` and breaks (`:1344`, `:1367`) when it reaches a node that has
incoming flat edges and was not started by `postorder`. It then skips the rank's topological re-sort
(`if (valid_rank && !LIST_IS_EMPTY(&temprank))`, `:1372`), so the rank keeps its mincross order. Before the commit,
such a node fell through and the rank was always rebuilt from the reverse postorder, putting every flat-edge tail
before its head. In the repro, `sh0007` has two incoming flat edges. 16.1.0 rebuilt the rank as
`sh0006, sh0008, sh0007`; 16.1.1 keeps `sh0006, sh0007, sh0008`.

Evidence that this is the change and not another 16.1.1 fix: all 123 rows that moved have `minlen=0` (flat) edges,
against 41% of a 248-row sample of svek rows. Only 20 of the 123 have a cluster, so the 16.1.1
cluster-representative change (#2768) does not explain them. For every row, at least one `svek-N.dot` pass differs
between native and dot-engine (`state/pesita-10` and `state/zoriza-41`: pass 3 only).

## Impact

123 rows went from conformant to diverged (108) or structural-match (15) when the oracle moved to 16.1.1:
activity 16, c4 1, class 42, component 8, network 1, state 13, unknown 36, usecase 6. The full list is in #164.
Their goldens and 18 authored oracles (`tests/fixtures/diagram-style-scope/component__links-*` and
`component__gradient-kinds-*`, `state__probe-note-in-same-side`, `activity-legacy/lap-arrow-dirs`) follow the same
rule. plantuml-ts emits the jar's DOT unchanged, so these rows return when dot-engine adopts `9fb21f570`.

## Resolution (2026-11-18, #164)

The oracle was re-captured under native 16.1.1 with plantuml-ts on `dot-engine` 2.12.3: 353 cache and golden
targets and 31 authored fixture SVGs moved, all byte-stable across two renders. Re-surveyed one type at a time
against the main branch's 16.1.0 baseline, 122 of the 123 rows above stay conformant. The 123rd,
`class/temise-16-neco018`, was not this issue: dot-engine equals native 16.1.1 on its `svek-1.dot` (all 22 shapes).
Under 16.1.1 its three note links route as several beziers, so the jar clears opale (`SvekEdge.java:769-770`,
`:804-806`) and draws each as its own link; the port also drew the freestanding note's relationship a second time
as a host-less note connector. Fixed in `src/diagrams/class/note-layout-tip.ts#resolveGroupGeos`.
