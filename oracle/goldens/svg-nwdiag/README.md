# svg-nwdiag conformance ratchet

Regression-proof gate for the nwdiag engine (`net/sourceforge/plantuml/nwdiag/`, `@startnwdiag`; mission
`nwdiag-engine-port`, #124), laid out as `oracle/goldens/svg-activity-legacy/` is. A fixture ratchets in once it
renders byte-for-byte identical to the jar oracle under a **deterministic** text measurer; the ratchet test then holds
it forever. See `tests/oracle/svg-conformance/nwdiag.golden.ratchet.test.ts`.

## Population

The 68 `@startnwdiag` rows of `plans/nwdiag-engine-port/measurements/planning-rows.json`, all in the `unknown` survey
bucket (the classifier's `network` bucket fills by keyword and holds none of them). The 64 the jar draws are pinned at
`unknown/<slug>/{in.puml,golden.svg}` in `ratchet.json`. The 4 the jar draws as an error page, where we draw ours
(ruling 2026-10-10), cannot be zero-diff: `diff-baseline.json` pins their score with the jar's `{ line, message }`.

## Add rule

```
npm run svg:survey -- unknown --out /tmp/x/parity-unknown.json   # copy over tests/oracle/svg-conformance/parity-unknown.json
npx jiti plans/nwdiag-engine-port/measurements/pin-nwdiag.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `unknown/<slug>/`, adds `{ slug, type, addedAt, source }` to `ratchet.json`,
and appends `goldens` twins (slug `unknown/<slug>`) to the routing and refusal baselines. The error rows are
re-measured by `npx jiti plans/nwdiag-engine-port/measurements/build-diff-baseline.mts <commit> [--write]`.

## Authored root

`tests/fixtures/nwdiag/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (nwp D5). `authored-baseline.json` tracks them
(`nwdiag.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk, disjoint from the cached slugs;
`weightedScore` never rises; a nonzero row is a jar error page where we also error, with its `jarError`. Re-measure:
`npx jiti plans/nwdiag-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

nwdiag never reaches graphviz: it lays its grid out itself (`next/NTetris.java`), so there is no `svek-N.dot`.
