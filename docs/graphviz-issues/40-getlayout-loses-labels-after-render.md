# `getLayout` after `render` reports no label positions (regression, 2.8.0 on)

**Impact:** blocks moving plantuml-ts off `@knowvah/dot-engine` 2.4.0. On 2.10.2
the state corpus falls from 298 to 154 conformant of 299, with 144 rows moving to
`structural-match`; the other types were not surveyed unpatched. `layoutGraph`
(`src/core/graph-layout.ts`) calls `render`, then reads every label position from
`getLayout`. With none reported, edge labels stop counting towards a nested
composite's size, so `bemena-23-zebu249`'s composite is 374.04 wide where the jar's
is 392.33. Nothing warns. Found 2026-11-04 measuring the 2.10.2 bump.

**Finding.** Every label position `getLayout` publishes is absent once `render` has
run: `label`, `xlabel`, `tailLabel`, `headLabel` on an edge, and `label` on a
cluster. The DOT output of that same `render` still carries `lp`, and it agrees with
native 16.1.0 on `svek-*.dot` from three corpus rows, so layout is correct. Only the
read after `render` is affected.

## Repro

```js
import { createGraph, render, getLayout } from '@knowvah/dot-engine';
const b = createGraph({ directed: true });
b.addNode('a', { shape: 'rect' });
b.addNode('b', { shape: 'rect' });
b.addEdge('a', 'b', { label: 'x', taillabel: 't', headlabel: 'h', xlabel: 'y' });
render(b.graph, 'dot', { engine: 'dot' });
console.log(getLayout(b.graph).edges[0]);
```

| Version | `label`, `tailLabel`, `headLabel`, `xlabel`, cluster `label` |
| --- | --- |
| 2.4.0, 2.6.10, 2.7.1 | present |
| 2.8.0, 2.8.1, 2.9.0, 2.10.0, 2.10.1, 2.10.2 | absent |

## Mechanism

`render` frees at its end, and `freeLayout` now reaches the label frees in dot
cleanup, which clear the fields in place (`src/layout/dot/init.ts`, 2.10.2):

- `gvCleanupEdgeLabels`, `:298-303`: `e.info.label`, `xlabel`, `head_label` and
  `tail_label` become `undefined` (`lib/common/utils.c:gv_cleanup_edge`).
- `dotCleanupGraph`, `:318-321`: `g.info.label` becomes `undefined` on every
  non-root subgraph (`lib/dotgen/dotinit.c:dot_cleanup_graph`).

`getLayout` then reads those fields (`src/api/geometry.ts:291,329,370`), and
`placedLabelPos` returns `undefined` for a missing record. `src/api/geometry.ts` is
byte-identical between 2.4.0 and 2.10.2. The label frees are absent from 2.7.1's
`init.ts` and present in 2.8.1's.

`src/gvc/layout-reset.ts` already states the constraint this breaks: "The port
cannot delete them there: `getLayout` is documented to work after `render`, and
`render` frees at its end." It defers the record reset to the next layout, and the
label frees need the same deferral. Issue 37's closing note warned of the same thing.

**Ruled out.**
- Our input: the pass-0 `DotInputGraph` of `bemena-23-zebu249` is byte-identical on
  both versions.
- The builder API: builder and `parse(toSvekDot(input))` give the same `bb` on 2.10.2.
- Layout: `render(parse(svek-N.dot), 'dot')` on 2.10.2 has the `bb` of native 16.1.0
  and of 2.4.0 on `bajelo-54`, `beguxu-19` and `bemena-23`.

**Counterfactual.** In a throwaway copy of the 2.10.2 bundle, with only those five
assignments removed, all five label kinds return and all 28 surveyed types lose no
verdict against plantuml-ts `16ad2ffd4`. One row gains:
`unknown/zodela-36-sica712`, `structural-match` to `conformant` (issue 36).

## Also seen on 2.10.2

- Issue 36: the repro's edge is `64.019,17 75.489,17 86.959,17 98.429,17`, equal to
  native 16.1.0.
- Issue 37: three renders of one `Graph` are identical and equal a fresh parse.

Neither is ticked here: the tracker rule needs the fix in the pinned `.tgz`, and this
issue stops that pin moving.
