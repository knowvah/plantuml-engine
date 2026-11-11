# svg-wire conformance ratchet

Regression-proof gate for the wire engine (`net/sourceforge/plantuml/wire/`, `@startwire`; mission `wire-engine-port`,
#128), laid out flat as `oracle/goldens/svg-regex/` is (wrp D7). A fixture ratchets in once it renders byte-for-byte
identical to the jar oracle under a **deterministic** text measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/wire.golden.ratchet.test.ts`.

## Population

The 18 `@startwire` rows of `plans/wire-engine-port/measurements/planning-rows.json`, all in the `wire` survey bucket and
all drawn by the jar. Each is pinned at `<slug>/{in.puml,golden.svg}` in `ratchet.json`.

## Add rule

```
npm run svg:survey -- wire --out /tmp/x/parity-wire.json   # copy over tests/oracle/svg-conformance/parity-wire.json
npx jiti plans/wire-engine-port/measurements/pin-wire.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins (bare slug, as `svg-regex`'s) to the routing and refusal baselines.

## Authored root

`tests/fixtures/wire/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (wrp D6). `authored-baseline.json` tracks them (`wire.diff-baseline.ratchet.test.ts`): rows =
the `.puml` files on disk, disjoint from the cached slugs; `weightedScore` never rises; a nonzero row is a jar error page
where we also error, with its `jarError`, or a row with a D8 end named in its `reason`. Re-measure:
`npx jiti plans/wire-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

Wire never reaches graphviz: `WBlock` lays itself out on a cursor, so there is no `svek-N.dot`.
