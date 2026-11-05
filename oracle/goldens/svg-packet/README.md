# svg-packet conformance ratchet

Regression-proof gate for the packet engine (`net/sourceforge/plantuml/packetdiag/`; mission
`packet-engine-port`, #117), mirroring `oracle/goldens/svg-chart/` in shape and procedure. A fixture
ratchets in once it renders byte-for-byte identical to the jar oracle under a **deterministic** text
measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/packet.golden.ratchet.test.ts`.

## Population

The 6 cached rows of `test-results/dot-cache/packet/`. All 6 are pinned in `ratchet.json`, so there is
no `diff-baseline.json`: it would be an empty population.

## Add rule

```
npm run svg:survey -- packet --out /tmp/x/parity-packet.json   # copy over tests/oracle/svg-conformance/parity-packet.json
npx jiti plans/packet-engine-port/measurements/pin-packet.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins to the routing and refusal baselines.

## Authored root

`tests/fixtures/packet/` is a flat tree: upstream's 62 `src/test/resources/vega/packet` sources as
`vega-<name>.puml`, and original fixtures as `cov-<name>.puml`, each with the jar's `.svg` beside it,
rendered by `scripts/oracle-render.sh`. `authored-baseline.json` tracks them. Gates
(`packet.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk, disjoint from the cached slugs;
`weightedScore` never rises; a nonzero row is a jar error page where we also error, conformant by the
2026-10-10 ruling; we error exactly where the jar errors. Fixtures render with the sprite, Twemoji and
utility asset stores (`render-fixture-packet.ts`), as the survey does.

Regenerate from a fresh measurement. The tool refuses a row where the jar draws and diffs remain:

```
npx jiti plans/packet-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
```

## No DOT-parity gate

Packet never reaches graphviz or dot-engine, so it has no svek stage and no `dotEqual` check.
