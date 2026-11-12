# svg-flow conformance ratchet

Regression-proof gate for the flow engine (`net/sourceforge/plantuml/flowdiagram/` and the reachable part of `golem/`,
`@startflow`; mission `flow-engine-port`, #132), laid out as `oracle/goldens/svg-bpm/` is. A fixture ratchets in once
it renders byte-for-byte identical to the jar oracle under a **deterministic** text measurer; the ratchet test then
holds it forever. See `tests/oracle/svg-conformance/flow.golden.ratchet.test.ts`.

## Population

The 1 `@startflow` row of `plans/flow-engine-port/measurements/planning-rows.json`, `bemixo-79-xulu250`, in the
`unknown` survey bucket. It draws 9 boxes, and the jar draws boxes in Java identity-hash order (flp D4: 6 renders, 6
SVGs, 1 multiset), so it is not zero-diff and `ratchet.json` is empty until ruling #174 decides how such rows count.
Its golden lives at `unknown/bemixo-79-xulu250/{in.puml,golden.svg}`, listed in `multiset.json`, not `ratchet.json`.
There is no `diff-baseline.json` (flp D7: written only for a row nonzero for a reason other than order).

## Multiset tier

`tests/oracle/svg-conformance/flow.multiset.ratchet.test.ts` holds every row that draws two or more boxes: the cached
rows of `multiset.json`, and every multi-box authored fixture (box count from the source, `countFlowBoxes`). Each must
equal its oracle, or one of the fixture's recorded `<slug>.vN.svg` layouts, as a multiset of tags
(`svg-multiset.ts`). It is a regression test of our output, not a conformance verdict.

## Add rule

```
npm run svg:survey -- unknown --out /tmp/x/parity-unknown.json   # copy over tests/oracle/svg-conformance/parity-unknown.json
npx jiti plans/flow-engine-port/measurements/pin-flow.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `unknown/<slug>/`, adds `{ slug, type, addedAt, source }` to `ratchet.json`,
and appends `goldens` twins (slug `unknown/<slug>`) to the routing and refusal baselines. A row that moves from
`multiset.json` to `ratchet.json` keeps its golden directory and twins.

## Authored root

`tests/fixtures/flow/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (flp D6). Three shift fixtures (`cov-shift-east`, `cov-many-shift`, `cov-shift-three`)
place their boxes differently from run to run, so each distinct layout `jar-variants.mjs` found over 8 renders is kept
as `<slug>.vN.svg`, and `variants.json` records how each source varied. `authored-baseline.json` tracks them
(`flow.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk; `weightedScore` never rises; a nonzero row is
a jar error page where we also error, with its `jarError`, or a multi-box row that differs only in box order, its
`reason` naming #174. Re-measure:
`npx jiti plans/flow-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

Flow never reaches graphviz: `TilesField` lays out its own golem grid, so there is no `svek-N.dot`.
