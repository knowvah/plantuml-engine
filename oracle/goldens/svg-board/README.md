# svg-board conformance ratchet

Regression-proof gate for the board engine (`net/sourceforge/plantuml/board/`; mission
`board-engine-port`, #118), mirroring `oracle/goldens/svg-packet/` in shape and procedure. A fixture
ratchets in once it renders byte-for-byte identical to the jar oracle under a **deterministic** text
measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/board.golden.ratchet.test.ts`.

## Population

The 4 cached rows of `test-results/dot-cache/board/`. All 4 are pinned in `ratchet.json`, so there is
no `diff-baseline.json`: it would be an empty population.

## Add rule

```
npm run svg:survey -- board --out /tmp/x/parity-board.json   # copy over tests/oracle/svg-conformance/parity-board.json
npx jiti plans/board-engine-port/measurements/pin-board.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `<slug>/`, adds `{ slug, addedAt, source }` to `ratchet.json`, and appends
`goldens` twins to the routing and refusal baselines.

## Authored root

`tests/fixtures/board/` is a flat tree of original fixtures, `cov-<topic>.puml`, each with the jar's `.svg`
beside it, rendered by `scripts/oracle-render.sh`. Upstream ships no board fixtures beyond
`DiagramTypeTest.java`, so these are the floor (bep D4). `authored-baseline.json` tracks them. Gates
(`board.diff-baseline.ratchet.test.ts`): rows = the `.puml` files on disk, disjoint from the cached slugs;
`weightedScore` never rises; a nonzero row is a jar error page where we also error, conformant by the
2026-10-10 ruling; we error exactly where the jar errors. Fixtures render with the sprite, Twemoji and
utility asset stores (`render-fixture-board.ts`), as the survey does.

Regenerate from a fresh measurement. The tool refuses a row where the jar draws and diffs remain:

```
npx jiti plans/board-engine-port/measurements/build-authored-baseline.mts <commit> [--write]
```

## No DOT-parity gate

Board never reaches graphviz or dot-engine, so it has no svek stage and no `dotEqual` check.
