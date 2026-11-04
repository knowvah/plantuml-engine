# Border-point cluster (`rank=sink` port node + `ee` subgraph): inner nodes placed 2-17 px off native

> **NOT a dot-engine defect (traced 2026-11-04).** The defect is in
> plantuml-ts: our graph puts the anchor in `cluster0i`, and the jar's DOT puts
> it in `cluster6ee`, before `i` opens. The filing below is kept as written;
> its claim that our DOT equals the jar's, and its suspected C source, are wrong.
>
> **Mechanism.** `ClusterDotString.java:148-149` declares the special point in
> `ee`, and `:151-152` then opens `i`. It is declared again inside `i` only when
> the cluster has no direct node (`added == null`, `:178-183`; `empty()` is the
> same id). In plantuml-ts the border-point family puts every non-port member,
> the anchor included, in `innermost`, which is `i`
> (`src/core/graph-layout-build.ts`, the `portRanksLabelOnEe` branch of
> `addClusters`). The text emitter does the same
> (`src/core/svek-dot-emit-clusters.ts`, `pointInEe` is false when
> `portRanksLabelOnEe` is set).
>
> **Why `dotEqual` stayed true.** `tests/oracle/svek-dot.ts#scanNesting` folds
> the `ee` and `i` wrappers into the base cluster, so it never sees which of them
> holds a node. Our text is not byte-equal to the jar's.
>
> **Evidence (`dot-engine` 2.4.0, native 16.1.0).**
> - `DE.render(DE.parse(svek-1.dot), 'dot')` is byte-identical to native
>   `dot -Tdot` on that file.
> - Native on the jar's DOT with only `zaent0001` moved into `cluster6i`
>   reproduces our builder's numbers: start 50, chk 67, ex 125, zaent 95,
>   cluster `16,16,139,293`.
> - Our builder with only the anchor moved to `cluster0ee` reproduces native on
>   the jar's DOT, for all six nodes:
>
> | Node | Builder now | Anchor in `ee` | Native, jar DOT |
> | --- | --- | --- | --- |
> | start | 50,242 | 61,242 | 61,242 |
> | chk | 67,147 | 65,147 | 65,147 |
> | final | 67,51 | 65,51 | 65,51 |
> | ex | 125,51 | 128,51 | 128,51 |
> | anchor | 95,242 | 106,242 | 106,242 |
> | comp2 | 186,147 | 189,147 | 189,147 |
>
> - The same move on `state__hist-bg-diag` takes cluster `T` from 133 to 125 wide,
>   the jar's `rect/@width`. The other nine `state__hist-*` rows were not run.
>
> **Ruled out.** The `:P` port and `rank=sink` handling: both graphs have them
> and they lay out as native once the anchor moves. Not yet checked: a full
> re-measure of `viroxo-69` with the fix, and the `added == null` case.
>
> **Fix belongs here:** place the anchor in `ee` in both the builder and the text
> emitter, re-declare it in `i` when `added == null`, make `scanNesting` see the
> difference, then retire the `DIVERGENCES.md` entry, which still calls this
> library-forced.

**Impact:** `state/viroxo-69-fito663` (93 attribute diffs, every one a 2-3 px
x shift of the `comp1` cluster's content and a 17 px shift of its `[*]` start;
cluster rect 109 px wide against the jar's 112). The same mechanism is the
pre-existing 8 px on the ten `state__hist-*` rows of
`oracle/goldens/diagram-style-scope.json` (journal row 12 of
`plans/state-divergence-drive`). Engine: `@knowvah/dot-engine` 2.4.0 vs real
`dot` 16.1.0 (homebrew). Found by plantuml-ts mission `state-divergence-drive`,
task T6c, 2026-11-04. Our DOT text equals the jar's `svek-1.dot` (`dotEqual`
true); only the layout differs (`layoutEqual` false).

**Finding.** A state composite with an exit point: the cluster carries a
`{rank=sink; sh0010;}` group and a `shape=rect` 0.1667 in port node, an inner
`cluster6ee` subgraph holding a `shape=point` anchor (`zaent0001`) and an inner
`cluster6i` with the real content, plus `sh0012->sh0010:P` (an edge into the
port node's `:P` compass) and two edges on the anchor. Node sizes and the
cluster nesting are identical on both sides; the positions inside the cluster
are not.

## Repro

```dot
digraph unix {
nodesep=0.486111;
ranksep=0.833333;
remincross=true;
searchsize=500;
sh0014 [shape=rect,style=rounded,label="",width=0.861111,height=0.694444,color="#00000E"];
subgraph cluster6a {label="";
subgraph cluster6 {style=solid;color="#000006";labeljust="c";{rank=sink;sh0010;}
sh0010 [shape=rect,label="",width=0.166667,height=0.166667,color="#00000A"];
subgraph cluster6ee {label=<<TABLE BGCOLOR="#000007" FIXEDSIZE="TRUE" WIDTH="42" HEIGHT="9"><TR><TD></TD></TR></TABLE>>;
zaent0001 [shape=point,width=.01,label=""];subgraph cluster6i {label="";
sh0011 [shape=circle,label="",width=0.277778,height=0.277778,color="#00000B"];
sh0012 [shape=rect,style=rounded,label="",width=0.694444,height=0.694444,color="#00000C"];
sh0013 [shape=circle,label="",width=0.305556,height=0.305556,color="#00000D"];
}}}}
sh0011->sh0012[arrowtail=none,arrowhead=none,minlen=1,color="#00000F"];
sh0012->sh0010:P[arrowtail=none,arrowhead=none,minlen=1,color="#000013"];
sh0012->sh0013[arrowtail=none,arrowhead=none,minlen=1,color="#000017"];
sh0014->zaent0001[arrowtail=none,arrowhead=none,minlen=1,color="#00001B"];
zaent0001->sh0014[arrowtail=none,arrowhead=none,minlen=1,color="#00001F"];
sh0010:P->sh0014[arrowtail=none,arrowhead=none,minlen=1,color="#000023"];
}
```

`dot -Tdot` (16.1.0), `pos` of the cluster's nodes (points):

```
sh0011 (start)  61,242
sh0012 (chk)    65,147
sh0013 (final)  65,51
sh0010 (ex)    128,51
cluster6 bb     16,16,142,293
```

The jar's SVG agrees with these to the pixel after its `6 - minX` move
(start 52, chk 56, ex 119; comp1 rect 7..119). Our render of the same DOT
through dot-engine, same frame:

```
start  41   (17 px left of chk; native: 4 px)
chk    58
ex    116   (58 px right of chk; native: 63 px)
comp1 rect 7..116 (109 wide; native 112)
```

Re-run: `/opt/homebrew/bin/dot -Tdot repro.dot` against
`DE.render(DE.parse(src), 'dot')` with `DE` = `@knowvah/dot-engine/dist/index.js`;
or `npx jiti /tmp/stdd-autolink-probe.mts viroxo-69-fito663` in this repo
(prints the root pass's node positions).

## Suspected graphviz C source

`lib/dotgen/rank.c` / `lib/dotgen/cluster.c` for the `rank=sink` subgraph
inside a cluster (`collapse_sets`, `cluster_leader`) and
`lib/dotgen/position.c` (`set_xcoords` with the compass port `:P` edge, whose
port offset enters `make_lrvn`/`ports_eq`). Confidence: LOW -- not traced into
dot-engine; the start node's 13 px extra offset from `chk` suggests the
x-coordinate pass, not ranking (ranks agree: both engines put ex and final on
the same rank).
