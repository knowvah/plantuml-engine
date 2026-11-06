# svg-chart conformance ratchet

Regression-proof gate for the chart engine (`net/sourceforge/plantuml/chart/`; mission
`chart-engine-port`, #116), mirroring `oracle/goldens/svg-wbs/` in shape and procedure. A fixture
ratchets in once it renders byte-for-byte identical to the jar oracle under a **deterministic** text
measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/chart.golden.ratchet.test.ts`.

## Population

The 29 cached rows of `test-results/dot-cache/chart/`. All 29 are pinned in `ratchet.json`, so there is
no `diff-baseline.json`: it would be an empty population.

## Add rule

```
npm run svg:survey -- chart --out /tmp/x/parity-chart.json   # copy over tests/oracle/svg-conformance/parity-chart.json
npx jiti plans/chart-engine-port/measurements/pin-chart.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins to the routing and refusal baselines.

## Authored root

`tests/fixtures/chart/` is a flat tree of original fixtures (`cov-<name>.puml` + the jar's `cov-<name>.svg`
beside it, rendered by `scripts/oracle-render.sh`), tracked by `authored-baseline.json`. Gates
(`chart.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk, disjoint from the cached slugs;
`weightedScore` never rises; a nonzero row is a jar error page where we also error, conformant by the
2026-10-10 ruling; we error exactly where the jar errors.

Regenerate from a fresh measurement. The tool refuses a row where the jar draws and diffs remain:

```
npx jiti plans/chart-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
```

## No DOT-parity gate

Chart never reaches graphviz or dot-engine, so it has no svek stage and no `dotEqual` check.
