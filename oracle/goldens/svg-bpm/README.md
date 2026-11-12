# svg-bpm conformance ratchet

Regression-proof gate for the BPM engine (`net/sourceforge/plantuml/bpm/`, `@startbpm`; mission `bpm-engine-port`,
#130), laid out as `oracle/goldens/svg-nwdiag/` is. A fixture ratchets in once it renders byte-for-byte identical to
the jar oracle under a **deterministic** text measurer; the ratchet test then holds it forever. See
`tests/oracle/svg-conformance/bpm.golden.ratchet.test.ts`.

## Population

The 7 `@startbpm` rows of `plans/bpm-engine-port/measurements/planning-rows.json`, all in the `unknown` survey bucket.
The jar draws all 7 and all 7 are zero-diff, so every one is pinned at `unknown/<slug>/{in.puml,golden.svg}` in
`ratchet.json`, and there is no `diff-baseline.json` (bpe D7: written only if a row stays nonzero).

## Add rule

```
npm run svg:survey -- unknown --out /tmp/x/parity-unknown.json   # copy over tests/oracle/svg-conformance/parity-unknown.json
npx jiti plans/bpm-engine-port/measurements/pin-bpm.mts [--write]
```

A pin copies `in.puml` and `in.svg` to `unknown/<slug>/`, adds `{ slug, type, addedAt, source }` to `ratchet.json`,
and appends `goldens` twins (slug `unknown/<slug>`) to the routing and refusal baselines.

## Authored root

`tests/fixtures/bpm/` is a flat tree of original fixtures, each with the jar's `.svg` beside it, rendered by
`scripts/oracle-render.sh` (bpe D6). `authored-baseline.json` tracks them (`bpm.diff-baseline.ratchet.test.ts`): rows =
the `.puml` files on disk, disjoint from the cached slugs; `weightedScore` never rises; a nonzero row is a jar error
page where we also error, with its `jarError`. `cov-duplicate-merge-id` is deliberately absent: the jar's own output
for duplicate merge ids changes from run to run (bpe D4). Re-measure:
`npx jiti plans/bpm-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.

## No DOT parity

BPM never reaches graphviz: it lays out its own grid (`Grid`, `GridArray`), so there is no `svek-N.dot`.
